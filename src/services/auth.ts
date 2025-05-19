import { passwordRequest, passwordReset, readMe, refresh } from "@directus/sdk";
import directusClient, { storage } from "./api";
import {UserTypes} from "@/types/UserTypes";

const MAX_LOGIN_ATTEMPTS = 5;
const LOCKOUT_DURATION = 2 * 60 * 1000; // 2 minutos

let loginAttempts = 0;
let lockoutUntil = 0;

// Timestamp da última verificação de token
let lastTokenCheckTime = 0;
// Intervalo mínimo entre verificações (em ms) para evitar verificações excessivas
const MIN_TOKEN_CHECK_INTERVAL = 10000; // 10 segundos

export async function signIn(email: string, password: string): Promise<UserTypes> {
    // Verificar se está em período de bloqueio
    if (Date.now() < lockoutUntil) {
        const remainingMinutes = Math.ceil((lockoutUntil - Date.now()) / 60000);
        throw new Error(`Muitas tentativas. Tente novamente em ${remainingMinutes} minutos.`);
    }

    try {
        await directusClient.login(email, password);

        // Reset contador em caso de sucesso
        loginAttempts = 0;
        lockoutUntil = 0;

        return await directusClient.request<UserTypes>(readMe());
    } catch (error) {
        // Incrementar contador de tentativas
        loginAttempts++;

        // Bloquear após atingir limite
        if (loginAttempts >= MAX_LOGIN_ATTEMPTS) {
            lockoutUntil = Date.now() + LOCKOUT_DURATION;
            loginAttempts = 0;
            throw new Error(`Muitas tentativas. Tente novamente em 2 minutos.`);
        }

        throw error;
    }
}

export async function signOut(): Promise<void> {
    try {
        // Primeiro verificar se existe um token válido antes de tentar fazer logout
        const authData = await storage.get();
        if (!authData || !authData.access_token) {
            console.log("Nenhum token disponível para logout");
            // Limpar o storage manualmente para garantir o logout local
            await storage.clear();
            return;
        }

        await directusClient.logout();
    } catch (error) {
        console.warn("Erro ao fazer logout no servidor, continuando com logout local:", error);
        // Garantir que os dados sejam limpos mesmo em caso de erro
        await storage.clear();
        throw error;
    }
}

export async function requestPassword(email: string): Promise<void> {
    try {
        await directusClient.request(passwordRequest(email, 'https://unaadeb.app.br/reset-password'));
    } catch (error) {
        throw error;
    }
}

export async function requestResetPassword(token: string, newPassword: string): Promise<void> {
    try {
        await directusClient.request(passwordReset(token, newPassword));
    } catch (error) {
        throw error;
    }
}

// Função para verificar e renovar o token se necessário
export async function checkAndRefreshToken(): Promise<boolean> {
    // Verificar throttling para evitar verificações frequentes demais
    const now = Date.now();
    if (now - lastTokenCheckTime < MIN_TOKEN_CHECK_INTERVAL) {
        console.log("Verificação de token ignorada - muito recente da última verificação");
        return true; // Assumir que o token está OK se a verificação anterior foi muito recente
    }

    // Atualizar timestamp da última verificação
    lastTokenCheckTime = now;

    try {
        // Verificar se existe um token
        const authData = await storage.get();
        if (!authData || !authData.access_token) {
            console.log("Nenhum token disponível para verificação");
            return false;
        }

        // Verificar se o token está expirando em breve
        const isExpiring = await storage.isTokenExpiring(10); // 10 minutos
        if (!isExpiring) {
            console.log("Token ainda é válido");
            return true; // Token ainda é válido
        }

        // Se não houver refresh token, não é possível renovar
        if (!authData.refresh_token) {
            console.log("Token expirando, mas não há refresh token");
            return false;
        }

        // Tentar renovar o token
        await directusClient.refresh();
        console.log("Token renovado com sucesso");
        return true;
    } catch (error) {
        console.error("Erro ao verificar/renovar token:", error);
        return false;
    }
}

// Função específica para obter um novo token apenas quando necessário
export async function refreshAuthToken(): Promise<boolean> {
    try {
        await directusClient.refresh();
        return true;
    } catch (error) {
        console.error("Erro ao renovar token:", error);
        return false;
    }
}
