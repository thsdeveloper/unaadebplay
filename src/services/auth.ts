// src/services/auth.ts
import { passwordRequest, passwordReset, readMe, refresh } from "@directus/sdk";
import directusClient, { storage } from "./api";
import {UserTypes} from "@/types/UserTypes";

export async function signIn(email, password): Promise<UserTypes> {
    try {
        await directusClient.login(email, password);
        return await directusClient.request<UserTypes>(readMe());
    } catch (error) {
        throw error;
    }
}

export async function signOut(): Promise<void> {
    try {
        await directusClient.logout();
    } catch (error) {
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

// Nova função para verificar e renovar o token se necessário
export async function checkAndRefreshToken(): Promise<boolean> {
    try {
        // Verificar se o token está expirando em breve
        const isExpiring = await storage.isTokenExpiring(10); // 10 minutos

        if (isExpiring) {
            // Obter os dados atuais do armazenamento
            const authData = await storage.get();

            // Se não houver dados de autenticação ou refresh token, não é possível renovar
            if (!authData || !authData.refresh_token) {
                return false;
            }

            // Tentar renovar o token
            await directusClient.refresh();
            return true;
        }

        return true; // Token ainda é válido
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
