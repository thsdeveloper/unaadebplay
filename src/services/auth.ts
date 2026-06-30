import { supabase } from "./supabase";
import { UserTypes } from "@/types/UserTypes";
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Linking from 'expo-linking';
import type { AuthError } from '@supabase/supabase-js';

// Constantes de segurança (lockout local — apenas UX; o rate-limit real é do Supabase)
const MAX_LOGIN_ATTEMPTS = 5;
const LOCKOUT_DURATION = 5 * 60 * 1000; // 5 minutos
const LOCKOUT_INCREMENT = 5 * 60 * 1000; // Incrementa 5 minutos a cada bloqueio

const FAILED_ATTEMPTS_KEY = 'UNAADEB_FailedAttempts';

interface FailedAttempts {
    count: number;
    lockoutUntil: number;
    lockoutCount: number;
    lastAttempt: number;
}

// Dados aceitos pelo cadastro (vindos de useSignUp). Campos do responsável vêm em camelCase.
export interface RegisterData {
    email: string;
    password: string;
    first_name: string;
    last_name: string;
    phone?: string;
    gender?: string;
    birthdate?: string; // ISO
    sector?: string;    // uuid
    avatar?: string | null;
    responsibleName?: string;
    responsiblePhone?: string;
}

export interface RegisterResult {
    user: UserTypes | null;
    needsConfirmation: boolean; // true quando a confirmação de email está ligada (sem sessão)
}

/** Mapeia uma linha de `profiles` para o formato UserTypes usado pelo app. */
export function profileToUser(profile: Record<string, any>): UserTypes {
    return { ...profile } as UserTypes;
}

/** Traduz erros do Supabase Auth para mensagens em pt-BR. */
function mapAuthError(error: AuthError): string {
    const code = (error as any).code as string | undefined;
    switch (code) {
        case 'invalid_credentials':
        case 'invalid_grant':
            return 'Email ou senha incorretos';
        case 'email_not_confirmed':
            return 'Confirme seu email antes de entrar.';
        case 'user_already_exists':
        case 'email_exists':
            return 'Este email já está cadastrado.';
        case 'weak_password':
            return 'Senha muito fraca. Use uma senha mais forte.';
        case 'over_request_rate_limit':
        case 'over_email_send_rate_limit':
            return 'Muitas tentativas. Aguarde um momento e tente novamente.';
        case 'validation_failed':
            return 'Dados inválidos. Verifique as informações e tente novamente.';
        default:
            return error.message || 'Ocorreu um erro de autenticação.';
    }
}

export class AuthService {
    private static instance: AuthService;

    // Deduplica buscas de perfil concorrentes (cold-start dispara vários gatilhos)
    private profileInFlight = new Map<string, Promise<UserTypes | null>>();

    private constructor() {}

    public static getInstance(): AuthService {
        if (!AuthService.instance) {
            AuthService.instance = new AuthService();
        }
        return AuthService.instance;
    }

    /** Busca o perfil do usuário (tabela profiles) com dedupe de requisições em voo. */
    async fetchProfile(userId: string): Promise<UserTypes | null> {
        const existing = this.profileInFlight.get(userId);
        if (existing) return existing;

        const promise = (async () => {
            const { data, error } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', userId)
                .maybeSingle();

            if (error) {
                console.error('Erro ao buscar perfil:', error);
                return null;
            }
            return data ? profileToUser(data) : null;
        })().finally(() => {
            this.profileInFlight.delete(userId);
        });

        this.profileInFlight.set(userId, promise);
        return promise;
    }

    /** Login com proteção local contra força bruta (UX). */
    async signIn(email: string, password: string): Promise<UserTypes> {
        const failedAttempts = await this.getFailedAttempts();
        if (failedAttempts && Date.now() < failedAttempts.lockoutUntil) {
            const remainingMinutes = Math.ceil((failedAttempts.lockoutUntil - Date.now()) / 60000);
            throw new Error(`Conta bloqueada. Tente novamente em ${remainingMinutes} minutos.`);
        }

        const { data, error } = await supabase.auth.signInWithPassword({ email, password });

        if (error) {
            await this.incrementFailedAttempts();

            if ((error as any).code === 'invalid_credentials') {
                const attempts = await this.getFailedAttempts();
                const remaining = MAX_LOGIN_ATTEMPTS - (attempts?.count || 0);
                if (remaining > 0) {
                    throw new Error(`Credenciais inválidas. ${remaining} tentativas restantes.`);
                }
            }
            throw new Error(mapAuthError(error));
        }

        await this.resetFailedAttempts();

        const user = await this.fetchProfile(data.user.id);
        if (!user) {
            throw new Error('Perfil não encontrado. Entre em contato com o suporte.');
        }
        return user;
    }

    /** Cadastro. O perfil é criado pelo trigger handle_new_user a partir do metadata. */
    async register(userData: RegisterData): Promise<RegisterResult> {
        const { data, error } = await supabase.auth.signUp({
            email: userData.email,
            password: userData.password,
            options: {
                // Mapeamento EXPLÍCITO para snake_case (o trigger lê estes campos).
                // role/status NÃO são enviados: são definidos pelo servidor (não confiar em metadata).
                data: {
                    first_name: userData.first_name,
                    last_name: userData.last_name,
                    phone: userData.phone ?? '',
                    gender: userData.gender ?? '',
                    birthdate: userData.birthdate ?? '',
                    sector: userData.sector ?? '',
                    avatar: userData.avatar ?? '',
                    responsible_name: userData.responsibleName ?? '',
                    responsible_phone: userData.responsiblePhone ?? '',
                },
            },
        });

        if (error) {
            throw new Error(mapAuthError(error));
        }

        // Sem sessão => confirmação de email exigida no projeto.
        if (!data.session) {
            return { user: null, needsConfirmation: true };
        }

        const user = data.user ? await this.fetchProfile(data.user.id) : null;
        return { user, needsConfirmation: false };
    }

    async signOut(): Promise<void> {
        const { error } = await supabase.auth.signOut();
        if (error) {
            console.warn('Erro ao fazer logout no servidor:', error);
        }
    }

    /** Envia email de redefinição de senha com deep-link de volta ao app. */
    async requestPasswordReset(email: string): Promise<void> {
        const redirectTo = Linking.createURL('reset-password');
        const { error } = await supabase.auth.resetPasswordForEmail(email, { redirectTo });
        if (error) {
            throw new Error(mapAuthError(error));
        }
    }

    /**
     * Conclui a redefinição. `token` é o token_hash do link de recuperação; estabelece a
     * sessão de recovery e então grava a nova senha.
     */
    async resetPassword(token: string, newPassword: string): Promise<void> {
        const { error: verifyError } = await supabase.auth.verifyOtp({
            type: 'recovery',
            token_hash: token,
        });
        if (verifyError) {
            throw new Error(mapAuthError(verifyError));
        }

        const { error } = await supabase.auth.updateUser({ password: newPassword });
        if (error) {
            throw new Error(mapAuthError(error));
        }

        // Encerra a sessão de recuperação: o usuário entra de novo com a nova senha.
        await supabase.auth.signOut();
    }

    // --- Lockout local (UX) -------------------------------------------------

    private async getFailedAttempts(): Promise<FailedAttempts | null> {
        try {
            const data = await AsyncStorage.getItem(FAILED_ATTEMPTS_KEY);
            return data ? JSON.parse(data) : null;
        } catch (error) {
            console.error('Erro ao obter tentativas falhas:', error);
            return null;
        }
    }

    private async incrementFailedAttempts(): Promise<void> {
        try {
            const current = (await this.getFailedAttempts()) || {
                count: 0,
                lockoutUntil: 0,
                lockoutCount: 0,
                lastAttempt: 0,
            };

            current.count++;
            current.lastAttempt = Date.now();

            if (current.count >= MAX_LOGIN_ATTEMPTS) {
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

    private async resetFailedAttempts(): Promise<void> {
        try {
            await AsyncStorage.removeItem(FAILED_ATTEMPTS_KEY);
        } catch (error) {
            console.error('Erro ao resetar tentativas falhas:', error);
        }
    }
}

// Exportar instância singleton
export const authService = AuthService.getInstance();
