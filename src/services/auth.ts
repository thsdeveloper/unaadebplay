import { passwordRequest, passwordReset, readMe, refresh } from "@directus/sdk";
import directusClient, { storage } from "./api";
import { UserTypes } from "@/types/UserTypes";
import { encrypt, decrypt, generateSessionId } from "@/utils/crypto";
import * as SecureStore from 'expo-secure-store';
import AsyncStorage from '@react-native-async-storage/async-storage';
import NetInfo from '@react-native-community/netinfo';

// Constantes de segurança
const MAX_LOGIN_ATTEMPTS = 5;
const LOCKOUT_DURATION = 5 * 60 * 1000; // 5 minutos
const LOCKOUT_INCREMENT = 5 * 60 * 1000; // Incrementa 5 minutos a cada bloqueio
const TOKEN_REFRESH_THRESHOLD = 5 * 60 * 1000; // 5 minutos antes de expirar
const SESSION_ROTATION_INTERVAL = 24 * 60 * 60 * 1000; // 24 horas

// Chaves de armazenamento
const AUTH_SESSIONS_KEY = 'UNAADEB_AuthSessions';
const ACTIVE_SESSION_KEY = 'UNAADEB_ActiveSession';
const FAILED_ATTEMPTS_KEY = 'UNAADEB_FailedAttempts';
const REFRESH_TOKEN_ROTATION_KEY = 'UNAADEB_RefreshRotation';

// Interface para sessão de autenticação
interface AuthSession {
    id: string;
    userId: string;
    email: string;
    deviceInfo: string;
    createdAt: number;
    lastActivity: number;
    refreshCount: number;
    isActive: boolean;
}

// Interface para tentativas falhas
interface FailedAttempts {
    count: number;
    lockoutUntil: number;
    lockoutCount: number;
    lastAttempt: number;
}

// Classe principal de autenticação melhorada
export class AuthService {
    private static instance: AuthService;
    private currentSession: AuthSession | null = null;
    private tokenRefreshTimer: NodeJS.Timeout | null = null;
    private sessionRotationTimer: NodeJS.Timeout | null = null;

    private constructor() {
        this.initializeService();
    }

    public static getInstance(): AuthService {
        if (!AuthService.instance) {
            AuthService.instance = new AuthService();
        }
        return AuthService.instance;
    }

    private async initializeService() {
        // Verificar sessão ativa ao inicializar
        await this.restoreActiveSession();
        
        // Configurar verificação periódica de token
        this.setupTokenRefreshTimer();
        
        // Configurar rotação de sessão
        this.setupSessionRotation();
    }

    // Login melhorado com proteção contra força bruta
    async signIn(email: string, password: string): Promise<UserTypes> {
        // Verificar tentativas falhas
        const failedAttempts = await this.getFailedAttempts();
        
        if (failedAttempts && Date.now() < failedAttempts.lockoutUntil) {
            const remainingMinutes = Math.ceil((failedAttempts.lockoutUntil - Date.now()) / 60000);
            throw new Error(`Conta bloqueada. Tente novamente em ${remainingMinutes} minutos.`);
        }

        // Verificar conectividade
        const netInfo = await NetInfo.fetch();
        if (!netInfo.isConnected) {
            throw new Error('Sem conexão com a internet. Verifique sua conexão e tente novamente.');
        }

        try {
            // Fazer login no Directus
            await directusClient.login(email, password);
            
            // Obter dados do usuário
            const user = await directusClient.request<UserTypes>(readMe());
            
            // Criar nova sessão
            const session = await this.createAuthSession(user);
            
            // Resetar tentativas falhas
            await this.resetFailedAttempts();
            
            // Configurar renovação automática de token
            this.setupTokenRefreshTimer();
            
            return user;
        } catch (error: any) {
            // Incrementar tentativas falhas
            await this.incrementFailedAttempts();
            
            // Verificar se é erro de credenciais
            if (error.response?.status === 401) {
                const attempts = await this.getFailedAttempts();
                const remainingAttempts = MAX_LOGIN_ATTEMPTS - (attempts?.count || 0);
                
                if (remainingAttempts > 0) {
                    throw new Error(`Credenciais inválidas. ${remainingAttempts} tentativas restantes.`);
                }
            }
            
            throw error;
        }
    }

    // Criar sessão de autenticação
    private async createAuthSession(user: UserTypes): Promise<AuthSession> {
        const sessionId = generateSessionId();
        
        const session: AuthSession = {
            id: sessionId,
            userId: user.id,
            email: user.email,
            deviceInfo: await this.getDeviceInfo(),
            createdAt: Date.now(),
            lastActivity: Date.now(),
            refreshCount: 0,
            isActive: true
        };

        // Salvar sessão
        await this.saveSession(session);
        this.currentSession = session;
        
        return session;
    }

    // Logout melhorado
    async signOut(): Promise<void> {
        try {
            // Limpar timers
            if (this.tokenRefreshTimer) {
                clearInterval(this.tokenRefreshTimer);
                this.tokenRefreshTimer = null;
            }
            
            if (this.sessionRotationTimer) {
                clearInterval(this.sessionRotationTimer);
                this.sessionRotationTimer = null;
            }

            // Invalidar sessão atual
            if (this.currentSession) {
                this.currentSession.isActive = false;
                await this.saveSession(this.currentSession);
            }

            // Fazer logout no servidor
            try {
                await directusClient.logout();
            } catch (error) {
                console.warn('Erro ao fazer logout no servidor:', error);
            }

            // Limpar dados locais
            await storage.clear();
            await SecureStore.deleteItemAsync(ACTIVE_SESSION_KEY);
            
            this.currentSession = null;
        } catch (error) {
            console.error('Erro no logout:', error);
            throw error;
        }
    }

    // Renovar token com rotation
    async refreshToken(): Promise<boolean> {
        if (!this.currentSession) {
            console.log('Nenhuma sessão ativa para renovar token');
            return false;
        }

        try {
            // Verificar se o token precisa ser renovado
            const isExpiring = await storage.isTokenExpiring(5);
            if (!isExpiring) {
                return true;
            }

            // Tentar renovar o token
            await directusClient.refresh();
            
            // Incrementar contador de renovações
            this.currentSession.refreshCount++;
            this.currentSession.lastActivity = Date.now();
            
            // Implementar refresh token rotation
            if (this.currentSession.refreshCount % 3 === 0) {
                console.log('Executando rotação de refresh token');
                // Aqui você implementaria a lógica de rotação do refresh token
                // se o Directus suportar
            }
            
            await this.saveSession(this.currentSession);
            
            return true;
        } catch (error) {
            console.error('Erro ao renovar token:', error);
            
            // Se falhar, invalidar sessão
            if (this.currentSession) {
                this.currentSession.isActive = false;
                await this.saveSession(this.currentSession);
            }
            
            return false;
        }
    }

    // Configurar timer de renovação de token
    private setupTokenRefreshTimer() {
        // Limpar timer anterior
        if (this.tokenRefreshTimer) {
            clearInterval(this.tokenRefreshTimer);
        }

        // Verificar a cada 2 minutos
        this.tokenRefreshTimer = setInterval(async () => {
            if (this.currentSession?.isActive) {
                const success = await this.refreshToken();
                if (!success) {
                    // Emitir evento de sessão expirada
                    this.onSessionExpired();
                }
            }
        }, 2 * 60 * 1000);
    }

    // Configurar rotação de sessão
    private setupSessionRotation() {
        // Limpar timer anterior
        if (this.sessionRotationTimer) {
            clearInterval(this.sessionRotationTimer);
        }

        // Verificar a cada hora se a sessão precisa ser rotacionada
        this.sessionRotationTimer = setInterval(async () => {
            if (this.currentSession?.isActive) {
                const sessionAge = Date.now() - this.currentSession.createdAt;
                
                if (sessionAge > SESSION_ROTATION_INTERVAL) {
                    console.log('Rotacionando sessão por idade');
                    await this.rotateSession();
                }
            }
        }, 60 * 60 * 1000);
    }

    // Rotacionar sessão
    private async rotateSession() {
        if (!this.currentSession) return;

        try {
            // Criar nova sessão mantendo os dados do usuário
            const newSession: AuthSession = {
                ...this.currentSession,
                id: generateSessionId(),
                createdAt: Date.now(),
                lastActivity: Date.now(),
                refreshCount: 0
            };

            // Invalidar sessão antiga
            this.currentSession.isActive = false;
            await this.saveSession(this.currentSession);

            // Ativar nova sessão
            this.currentSession = newSession;
            await this.saveSession(newSession);
            await SecureStore.setItemAsync(ACTIVE_SESSION_KEY, newSession.id);

            console.log('Sessão rotacionada com sucesso');
        } catch (error) {
            console.error('Erro ao rotacionar sessão:', error);
        }
    }

    // Gerenciar tentativas falhas
    private async getFailedAttempts(): Promise<FailedAttempts | null> {
        try {
            const data = await AsyncStorage.getItem(FAILED_ATTEMPTS_KEY);
            return data ? JSON.parse(data) : null;
        } catch (error) {
            console.error('Erro ao obter tentativas falhas:', error);
            return null;
        }
    }

    private async incrementFailedAttempts() {
        try {
            const current = await this.getFailedAttempts() || {
                count: 0,
                lockoutUntil: 0,
                lockoutCount: 0,
                lastAttempt: 0
            };

            current.count++;
            current.lastAttempt = Date.now();

            if (current.count >= MAX_LOGIN_ATTEMPTS) {
                // Incrementar duração do bloqueio a cada vez
                current.lockoutCount++;
                const lockoutDuration = LOCKOUT_DURATION + (current.lockoutCount - 1) * LOCKOUT_INCREMENT;
                current.lockoutUntil = Date.now() + lockoutDuration;
                current.count = 0;
            }

            await AsyncStorage.setItem(FAILED_ATTEMPTS_KEY, JSON.stringify(current));
        } catch (error) {
            console.error('Erro ao incrementar tentativas falhas:', error);
        }
    }

    private async resetFailedAttempts() {
        try {
            await AsyncStorage.removeItem(FAILED_ATTEMPTS_KEY);
        } catch (error) {
            console.error('Erro ao resetar tentativas falhas:', error);
        }
    }

    // Salvar sessão
    private async saveSession(session: AuthSession) {
        try {
            // Obter todas as sessões
            const sessionsData = await AsyncStorage.getItem(AUTH_SESSIONS_KEY);
            const sessions: AuthSession[] = sessionsData ? JSON.parse(sessionsData) : [];
            
            // Atualizar ou adicionar sessão
            const index = sessions.findIndex(s => s.id === session.id);
            if (index >= 0) {
                sessions[index] = session;
            } else {
                sessions.push(session);
            }

            // Limitar a 10 sessões mais recentes
            const sortedSessions = sessions
                .sort((a, b) => b.lastActivity - a.lastActivity)
                .slice(0, 10);

            await AsyncStorage.setItem(AUTH_SESSIONS_KEY, JSON.stringify(sortedSessions));

            // Se for a sessão ativa, salvar ID
            if (session.isActive) {
                await SecureStore.setItemAsync(ACTIVE_SESSION_KEY, session.id);
            }
        } catch (error) {
            console.error('Erro ao salvar sessão:', error);
        }
    }

    // Restaurar sessão ativa
    private async restoreActiveSession() {
        try {
            const activeSessionId = await SecureStore.getItemAsync(ACTIVE_SESSION_KEY);
            if (!activeSessionId) return;

            const sessionsData = await AsyncStorage.getItem(AUTH_SESSIONS_KEY);
            if (!sessionsData) return;

            const sessions: AuthSession[] = JSON.parse(sessionsData);
            const activeSession = sessions.find(s => s.id === activeSessionId && s.isActive);

            if (activeSession) {
                this.currentSession = activeSession;
                console.log('Sessão restaurada:', activeSession.id);
            }
        } catch (error) {
            console.error('Erro ao restaurar sessão:', error);
        }
    }

    // Obter informações do dispositivo
    private async getDeviceInfo(): Promise<string> {
        // Aqui você implementaria a lógica para obter informações do dispositivo
        // Por exemplo: modelo, OS, versão do app, etc.
        return 'Mobile Device';
    }

    // Callback quando a sessão expira
    private onSessionExpired() {
        // Aqui você emitiria um evento ou notificaria o AuthContext
        console.log('Sessão expirada');
    }

    // Obter sessão atual
    getCurrentSession(): AuthSession | null {
        return this.currentSession;
    }

    // Verificar se há sessão ativa
    isAuthenticated(): boolean {
        return this.currentSession?.isActive === true;
    }

    // Obter todas as sessões
    async getAllSessions(): Promise<AuthSession[]> {
        try {
            const sessionsData = await AsyncStorage.getItem(AUTH_SESSIONS_KEY);
            return sessionsData ? JSON.parse(sessionsData) : [];
        } catch (error) {
            console.error('Erro ao obter sessões:', error);
            return [];
        }
    }

    // Invalidar uma sessão específica
    async invalidateSession(sessionId: string) {
        try {
            const sessions = await this.getAllSessions();
            const session = sessions.find(s => s.id === sessionId);
            
            if (session) {
                session.isActive = false;
                await this.saveSession(session);
                
                // Se for a sessão atual, fazer logout
                if (this.currentSession?.id === sessionId) {
                    await this.signOut();
                }
            }
        } catch (error) {
            console.error('Erro ao invalidar sessão:', error);
        }
    }
}

// Exportar instância singleton
export const authService = AuthService.getInstance();