import React, { createContext, useContext, useEffect, useState, useRef, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AppState, AppStateStatus, Alert } from 'react-native';
import NetInfo from '@react-native-community/netinfo';
import { useRouter, useSegments } from "expo-router";
import * as Updates from 'expo-updates';
import type { Session } from '@supabase/supabase-js';

import { authService } from "@/services/auth";
import { supabase } from "@/services/supabase";
import { UserTypes } from "@/types/UserTypes";
import { useFeedbackToast } from '@/components/FeedbackToast';

interface SessionInfo {
    id: string;
    createdAt: Date;
    lastActivity: Date;
    expiresAt: Date | null;
}

interface AuthContextData {
    // Estados
    signed: boolean;
    user: UserTypes | null;
    loading: boolean;
    isRefreshing: boolean;
    isOnline: boolean;
    sessionInfo: SessionInfo | null;

    // Métodos principais
    login(email: string, password: string, rememberMe?: boolean): Promise<void>;
    register(userData: any): Promise<{ needsConfirmation: boolean }>;
    logout(): Promise<void>;

    // Gerenciamento de usuário
    setUser(user: UserTypes | null): Promise<void>;
    updateUser(updates: Partial<UserTypes>): Promise<void>;

    // Recuperação de senha
    requestPasswordReset(email: string): Promise<void>;
    resetPassword(token: string, newPassword: string): Promise<void>;

    // Sessão
    checkSession(): Promise<boolean>;
    refreshSession(): Promise<boolean>;
    getActiveSessions(): Promise<any[]>;
    invalidateSession(sessionId: string): Promise<void>;

    // Credenciais salvas (apenas email — nunca a senha)
    loadSavedCredentials(): Promise<{ email: string; password: string; rememberMe: boolean } | null>;
    clearSavedCredentials(): Promise<void>;
}

// Chaves de armazenamento
const USER_STORAGE_KEY = '@UNAADEB_User';
const REMEMBER_ME_KEY = '@UNAADEB_RememberMe';
const SAVED_EMAIL_KEY = '@UNAADEB_SavedEmail';

const AuthContext = createContext<AuthContextData>({} as AuthContextData);

interface Props {
    children: React.ReactNode;
}

export const AuthProvider: React.FC<Props> = ({ children }) => {
    // Estados principais
    const [user, setUserState] = useState<UserTypes | null>(null);
    const [session, setSession] = useState<Session | null>(null);
    // `signed` é explícito (não derivado de `session`): uma sessão de PASSWORD_RECOVERY
    // NÃO deve logar o usuário no app — a tela de reset a consome.
    const [signed, setSigned] = useState(false);
    const [loading, setLoading] = useState(true);
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [isOnline, setIsOnline] = useState(true);

    // Hooks
    const router = useRouter();
    const segments = useSegments();
    const toast = useFeedbackToast();

    // Refs
    const isAuthScreen = segments[0] === '(auth)';
    const networkUnsubscribeRef = useRef<(() => void) | null>(null);
    // Qual usuário já teve o perfil carregado (evita refetch/loop no onAuthStateChange)
    const loadedProfileForRef = useRef<string | null>(null);
    // Qual usuário já teve o perfil APLICADO no estado (login() já buscou) — evita
    // o segundo fetch que o evento SIGNED_IN dispararia logo após o login.
    const appliedProfileForRef = useRef<string | null>(null);
    const hasCheckedUpdatesRef = useRef(false);

    // Inicialização: a sessão do Supabase é a fonte única de verdade.
    useEffect(() => {
        // 1) Render imediato a partir do cache (cold-start sem flicker)
        AsyncStorage.getItem(USER_STORAGE_KEY)
            .then((stored) => {
                if (stored) setUserState((prev) => prev ?? JSON.parse(stored));
            })
            .catch(() => {});

        // 2) onAuthStateChange dispara INITIAL_SESSION na montagem (com a sessão persistida).
        //    O callback DEVE ser síncrono — chamar supabase.auth.* aqui dentro trava o lock
        //    interno do cliente. Por isso o fetch de perfil é adiado com setTimeout(.., 0).
        const { data: sub } = supabase.auth.onAuthStateChange((event, newSession) => {
            setSession(newSession);

            if (!newSession) {
                loadedProfileForRef.current = null;
                appliedProfileForRef.current = null;
                setSigned(false);
                setUserState(null);
                AsyncStorage.removeItem(USER_STORAGE_KEY).catch(() => {});
                setLoading(false);
                return;
            }

            // PASSWORD_RECOVERY: sessão de recuperação de senha — NÃO é login.
            // A tela de reset consome o token; não buscamos perfil nem navegamos.
            if (event === 'PASSWORD_RECOVERY') {
                setLoading(false);
                return;
            }

            // TOKEN_REFRESHED só rotaciona o token — o perfil não muda, evita re-render storm.
            if (event === 'TOKEN_REFRESHED') {
                setLoading(false);
                return;
            }

            // Só tratamos como entrada de sessão estes eventos.
            if (event !== 'INITIAL_SESSION' && event !== 'SIGNED_IN' && event !== 'USER_UPDATED') {
                setLoading(false);
                return;
            }

            setSigned(true);

            const uid = newSession.user.id;
            if (loadedProfileForRef.current === uid) {
                setLoading(false);
                return;
            }
            loadedProfileForRef.current = uid;

            setTimeout(async () => {
                // login()/register() já aplicaram o perfil deste usuário — não refazer o fetch
                if (appliedProfileForRef.current === uid) {
                    setLoading(false);
                    return;
                }
                const profile = await authService.fetchProfile(uid);
                if (profile) {
                    appliedProfileForRef.current = uid;
                    setUserState(profile);
                    AsyncStorage.setItem(USER_STORAGE_KEY, JSON.stringify(profile)).catch(() => {});
                } else {
                    // Perfil ainda não disponível — permite nova tentativa num próximo evento
                    loadedProfileForRef.current = null;
                }
                setLoading(false);
            }, 0);
        });

        // Monitorar conectividade
        networkUnsubscribeRef.current = NetInfo.addEventListener((state) => {
            setIsOnline(state.isConnected ?? false);
        });

        return () => {
            sub.subscription.unsubscribe();
            networkUnsubscribeRef.current?.();
        };
    }, []);

    // Login
    const login = async (email: string, password: string, rememberMe: boolean = false) => {
        setLoading(true);
        try {
            if (!isOnline) {
                toast.error('Sem conexão com a internet');
                return;
            }

            const userData = await authService.signIn(email, password);

            if (userData.status && userData.status !== 'active') {
                await authService.signOut();
                toast.error('Sua conta não está ativa. Entre em contato com o suporte.');
                return;
            }

            // Marca o perfil como carregado/aplicado para o evento SIGNED_IN não refazer o fetch
            loadedProfileForRef.current = userData.id;
            appliedProfileForRef.current = userData.id;
            setSigned(true);
            await setUser(userData);

            // Remember-me: guarda apenas o email (a sessão persistida já mantém o login)
            await AsyncStorage.setItem(REMEMBER_ME_KEY, rememberMe.toString());
            if (rememberMe) {
                await AsyncStorage.setItem(SAVED_EMAIL_KEY, email);
            } else {
                await AsyncStorage.removeItem(SAVED_EMAIL_KEY);
            }

            toast.success('Login realizado com sucesso!');
            router.replace('/(tabs)/(home)/');
        } catch (error: any) {
            console.error('Erro no login:', error);
            toast.error(error?.message || 'Erro ao fazer login. Verifique sua conexão.');
        } finally {
            setLoading(false);
        }
    };

    // Registro
    const register = async (userData: any): Promise<{ needsConfirmation: boolean }> => {
        setLoading(true);
        try {
            if (!isOnline) {
                toast.error('Sem conexão com a internet');
                return { needsConfirmation: false };
            }

            const { user: newUser, needsConfirmation } = await authService.register(userData);

            // Confirmação de email exigida: não há sessão ainda.
            if (needsConfirmation) {
                toast.info('Enviamos um email de confirmação. Confirme para acessar sua conta.');
                return { needsConfirmation: true };
            }

            // Há sessão. Se o perfil ainda não veio (lag do trigger), segue mesmo assim —
            // o onAuthStateChange preenche o perfil em seguida.
            setSigned(true);
            if (newUser) {
                loadedProfileForRef.current = newUser.id;
                appliedProfileForRef.current = newUser.id;
                await setUser(newUser);
            }
            await AsyncStorage.setItem(REMEMBER_ME_KEY, 'true');
            await AsyncStorage.setItem(SAVED_EMAIL_KEY, userData.email);

            toast.success('Conta criada com sucesso!');
            router.replace('/(tabs)/(home)/');
            return { needsConfirmation: false };
        } catch (error: any) {
            console.error('Erro no registro:', error);
            toast.error(error?.message || 'Erro ao criar conta. Verifique sua conexão.');
            throw error;
        } finally {
            setLoading(false);
        }
    };

    // Logout
    const logout = async () => {
        try {
            setLoading(true);
            await authService.signOut(); // dispara SIGNED_OUT → limpa user/session
            loadedProfileForRef.current = null;
            appliedProfileForRef.current = null;
            setSigned(false);
            await AsyncStorage.removeItem(USER_STORAGE_KEY);
            setUserState(null);
            toast.info('Você foi desconectado');
            router.replace('/(auth)/sign-in');
        } catch (error) {
            console.error('Erro ao fazer logout:', error);
            toast.error('Erro ao sair da conta');
        } finally {
            setLoading(false);
        }
    };

    // checkSession: leitura local da sessão (sem round-trip), auto-refresh se necessário
    const checkSession = useCallback(async (): Promise<boolean> => {
        try {
            const { data } = await supabase.auth.getSession();
            return !!data.session;
        } catch (error) {
            console.error('Erro ao verificar sessão:', error);
            return false;
        }
    }, []);

    // refreshSession: força rotação do token
    const refreshSession = useCallback(async (): Promise<boolean> => {
        try {
            setIsRefreshing(true);
            const { data, error } = await supabase.auth.refreshSession();
            return !error && !!data.session;
        } catch (error) {
            console.error('Erro ao renovar sessão:', error);
            return false;
        } finally {
            setIsRefreshing(false);
        }
    }, []);

    // Salvar/atualizar usuário (cache local)
    const setUser = async (userData: UserTypes | null) => {
        if (userData) {
            await AsyncStorage.setItem(USER_STORAGE_KEY, JSON.stringify(userData));
        } else {
            await AsyncStorage.removeItem(USER_STORAGE_KEY);
        }
        setUserState(userData);
    };

    const updateUser = async (updates: Partial<UserTypes>) => {
        if (!user) return;
        const updatedUser = { ...user, ...updates };
        await setUser(updatedUser);
    };

    // Recuperação de senha (Supabase)
    const requestPasswordReset = async (email: string) => {
        try {
            await authService.requestPasswordReset(email);
        } catch (error: any) {
            console.error('Erro ao solicitar redefinição de senha:', error);
            // Não revela se o email existe (anti-enumeração) — a tela mostra sucesso genérico.
        }
    };

    const resetPassword = async (token: string, newPassword: string) => {
        await authService.resetPassword(token, newPassword);
    };

    // Sessões: o Supabase não lista/revoga sessões por dispositivo no cliente.
    const getActiveSessions = async () => {
        return session ? [{ id: session.user.id, current: true }] : [];
    };

    // "Encerrar sessão" só pode encerrar a atual (globalmente).
    const invalidateSession = async (_sessionId: string) => {
        try {
            await supabase.auth.signOut({ scope: 'global' });
            toast.info('Sessões encerradas em todos os dispositivos');
        } catch (error) {
            console.error('Erro ao encerrar sessão:', error);
            toast.error('Erro ao encerrar sessão');
        }
    };

    // Carregar credenciais salvas (apenas email; a senha nunca é persistida)
    const loadSavedCredentials = async () => {
        try {
            const rememberMe = await AsyncStorage.getItem(REMEMBER_ME_KEY);
            if (rememberMe !== 'true') return null;

            const email = await AsyncStorage.getItem(SAVED_EMAIL_KEY);
            if (!email) return null;

            return { email, password: '', rememberMe: true };
        } catch (error) {
            console.error('Erro ao carregar credenciais:', error);
            return null;
        }
    };

    const clearSavedCredentials = async () => {
        await AsyncStorage.multiRemove([SAVED_EMAIL_KEY, REMEMBER_ME_KEY]);
    };

    // Verificar atualizações OTA uma única vez por sessão do app
    useEffect(() => {
        if (loading || !user || hasCheckedUpdatesRef.current) return;
        hasCheckedUpdatesRef.current = true;
        checkForUpdates();
    }, [loading, user]);

    const checkForUpdates = async () => {
        try {
            const update = await Updates.checkForUpdateAsync();
            if (update.isAvailable) {
                await Updates.fetchUpdateAsync();
                Alert.alert(
                    'Atualização Disponível',
                    'Uma nova versão do app está disponível. Deseja reiniciar agora?',
                    [
                        { text: 'Depois', style: 'cancel' },
                        { text: 'Reiniciar', onPress: () => Updates.reloadAsync() },
                    ],
                );
            }
        } catch (error) {
            console.log('Erro ao verificar atualizações:', error);
        }
    };

    const sessionInfo: SessionInfo | null = session
        ? {
              id: session.user.id,
              createdAt: session.user.created_at ? new Date(session.user.created_at) : new Date(),
              lastActivity: new Date(),
              expiresAt: session.expires_at ? new Date(session.expires_at * 1000) : null,
          }
        : null;

    return (
        <AuthContext.Provider
            value={{
                signed,
                user,
                loading,
                isRefreshing,
                isOnline,
                sessionInfo,

                login,
                register,
                logout,
                setUser,
                updateUser,
                requestPasswordReset,
                resetPassword,
                checkSession,
                refreshSession,
                getActiveSessions,
                invalidateSession,
                loadSavedCredentials,
                clearSavedCredentials,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
};

export default AuthContext;

export function useAuth() {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}
