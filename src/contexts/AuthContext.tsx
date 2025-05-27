import React, { createContext, useContext, useEffect, useState, useRef, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AppState, AppStateStatus, Alert } from 'react-native';
import NetInfo from '@react-native-community/netinfo';
import { useRouter, useSegments } from "expo-router";
import * as Updates from 'expo-updates';

import { authService, AuthService } from "@/services/auth";
import { UserTypes } from "@/types/UserTypes";
import { storage } from '@/services/api';
import { useFeedbackToast } from '@/components/FeedbackToast';
import { encrypt, decrypt } from '@/utils/crypto';

interface AuthContextData {
    // Estados
    signed: boolean;
    user: UserTypes | null;
    loading: boolean;
    isRefreshing: boolean;
    isOnline: boolean;
    sessionInfo: {
        id: string;
        createdAt: Date;
        lastActivity: Date;
        refreshCount: number;
    } | null;
    
    // Métodos principais
    login(email: string, password: string, rememberMe?: boolean): Promise<void>;
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
    
    // Credenciais salvas
    loadSavedCredentials(): Promise<{ email: string, password: string, rememberMe: boolean } | null>;
    clearSavedCredentials(): Promise<void>;
}

// Chaves de armazenamento
const USER_STORAGE_KEY = '@UNAADEB_User';
const REMEMBER_ME_KEY = '@UNAADEB_RememberMe';
const ENCRYPTED_CREDS_KEY = '@UNAADEB_EncryptedCredentials';
const LAST_AUTH_CHECK_KEY = '@UNAADEB_LastAuthCheck';

const AuthContext = createContext<AuthContextData>({} as AuthContextData);

interface Props {
    children: React.ReactNode;
}

export const AuthProvider: React.FC<Props> = ({ children }) => {
    // Estados principais
    const [user, setUserState] = useState<UserTypes | null>(null);
    const [loading, setLoading] = useState(true);
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [isOnline, setIsOnline] = useState(true);
    const [sessionInfo, setSessionInfo] = useState<any>(null);
    
    // Hooks
    const router = useRouter();
    const segments = useSegments();
    const toast = useFeedbackToast();
    
    // Refs
    const appState = useRef(AppState.currentState);
    const isAuthScreen = segments[0] === '(auth)';
    const initializationRef = useRef(false);
    const networkUnsubscribeRef = useRef<(() => void) | null>(null);

    // Inicialização do contexto
    useEffect(() => {
        if (!initializationRef.current) {
            initializationRef.current = true;
            initializeAuth();
        }
        
        // Configurar listeners
        const appStateSubscription = AppState.addEventListener('change', handleAppStateChange);
        
        // Monitorar conectividade
        networkUnsubscribeRef.current = NetInfo.addEventListener(state => {
            setIsOnline(state.isConnected ?? false);
        });
        
        // Cleanup
        return () => {
            appStateSubscription.remove();
            networkUnsubscribeRef.current?.();
        };
    }, []);

    // Inicializar autenticação
    const initializeAuth = async () => {
        try {
            setLoading(true);
            
            // Verificar conectividade
            const netInfo = await NetInfo.fetch();
            setIsOnline(netInfo.isConnected ?? false);
            
            // Carregar usuário salvo
            const storedUser = await AsyncStorage.getItem(USER_STORAGE_KEY);
            if (storedUser) {
                const userData = JSON.parse(storedUser);
                setUserState(userData);
                
                // Verificar sessão se online
                if (netInfo.isConnected && !isAuthScreen) {
                    const isValid = await authService.refreshToken();
                    if (!isValid) {
                        await handleSessionExpired();
                    } else {
                        // Atualizar informações da sessão
                        const session = authService.getCurrentSession();
                        if (session) {
                            setSessionInfo({
                                id: session.id,
                                createdAt: new Date(session.createdAt),
                                lastActivity: new Date(session.lastActivity),
                                refreshCount: session.refreshCount,
                            });
                        }
                    }
                }
            }
        } catch (error) {
            console.error('Erro ao inicializar autenticação:', error);
            if (!isAuthScreen) {
                toast.error('Erro ao restaurar sessão');
            }
        } finally {
            setLoading(false);
        }
    };

    // Handler para mudanças no estado do app
    const handleAppStateChange = async (nextAppState: AppStateStatus) => {
        if (
            appState.current.match(/inactive|background/) &&
            nextAppState === 'active' &&
            user &&
            !isAuthScreen
        ) {
            console.log('App voltou ao primeiro plano, verificando sessão...');
            
            // Verificar última checagem
            const lastCheck = await AsyncStorage.getItem(LAST_AUTH_CHECK_KEY);
            const lastCheckTime = lastCheck ? parseInt(lastCheck) : 0;
            const timeSinceLastCheck = Date.now() - lastCheckTime;
            
            // Verificar apenas se passou mais de 5 minutos
            if (timeSinceLastCheck > 5 * 60 * 1000) {
                const isValid = await checkSession();
                if (!isValid) {
                    await handleSessionExpired();
                }
                
                await AsyncStorage.setItem(LAST_AUTH_CHECK_KEY, Date.now().toString());
            }
        }
        
        appState.current = nextAppState;
    };

    // Login melhorado
    const login = async (email: string, password: string, rememberMe: boolean = false) => {
        setLoading(true);
        
        try {
            // Verificar conectividade
            if (!isOnline) {
                toast.error('Sem conexão com a internet');
                return;
            }
            
            // Fazer login
            const userData = await authService.signIn(email, password);
            
            if (userData.status !== 'active') {
                toast.error('Sua conta não está ativa. Entre em contato com o suporte.');
                return;
            }
            
            // Salvar usuário
            await setUser(userData);
            
            // Salvar preferências
            await AsyncStorage.setItem(REMEMBER_ME_KEY, rememberMe.toString());
            
            // Salvar credenciais se solicitado
            if (rememberMe) {
                const encryptedCreds = await encrypt(JSON.stringify({ email, password }));
                await AsyncStorage.setItem(ENCRYPTED_CREDS_KEY, encryptedCreds);
            } else {
                await AsyncStorage.removeItem(ENCRYPTED_CREDS_KEY);
            }
            
            // Atualizar informações da sessão
            const session = authService.getCurrentSession();
            if (session) {
                setSessionInfo({
                    id: session.id,
                    createdAt: new Date(session.createdAt),
                    lastActivity: new Date(session.lastActivity),
                    refreshCount: session.refreshCount,
                });
            }
            
            toast.success('Login realizado com sucesso!');
            
            // Navegar para home
            router.replace('/(tabs)/(home)/');
            
        } catch (error: any) {
            console.error('Erro no login:', error);
            
            // Tratamento de erros específicos
            if (error.message?.includes('bloqueada')) {
                toast.error(error.message);
            } else if (error.message?.includes('Credenciais inválidas')) {
                toast.error(error.message);
            } else if (error.response?.status === 401) {
                toast.error('Email ou senha incorretos');
            } else if (error.response?.status === 500) {
                toast.error('Erro no servidor. Tente novamente mais tarde.');
            } else {
                toast.error('Erro ao fazer login. Verifique sua conexão.');
            }
        } finally {
            setLoading(false);
        }
    };

    // Logout melhorado
    const logout = async () => {
        try {
            setLoading(true);
            
            // Fazer logout no serviço
            await authService.signOut();
            
            // Limpar dados locais
            await AsyncStorage.multiRemove([
                USER_STORAGE_KEY,
                LAST_AUTH_CHECK_KEY
            ]);
            
            // Limpar estados
            setUserState(null);
            setSessionInfo(null);
            
            toast.info('Você foi desconectado');
            
            // Navegar para login
            router.replace('/(auth)/sign-in');
            
        } catch (error) {
            console.error('Erro ao fazer logout:', error);
            toast.error('Erro ao sair da conta');
        } finally {
            setLoading(false);
        }
    };

    // Verificar sessão
    const checkSession = async (): Promise<boolean> => {
        if (isAuthScreen || !user) return false;
        
        try {
            setIsRefreshing(true);
            
            const isValid = await authService.refreshToken();
            
            if (isValid) {
                // Atualizar informações da sessão
                const session = authService.getCurrentSession();
                if (session) {
                    setSessionInfo({
                        id: session.id,
                        createdAt: new Date(session.createdAt),
                        lastActivity: new Date(session.lastActivity),
                        refreshCount: session.refreshCount,
                    });
                }
            }
            
            return isValid;
        } catch (error) {
            console.error('Erro ao verificar sessão:', error);
            return false;
        } finally {
            setIsRefreshing(false);
        }
    };

    // Renovar sessão
    const refreshSession = async (): Promise<boolean> => {
        try {
            setIsRefreshing(true);
            return await authService.refreshToken();
        } catch (error) {
            console.error('Erro ao renovar sessão:', error);
            return false;
        } finally {
            setIsRefreshing(false);
        }
    };

    // Lidar com sessão expirada
    const handleSessionExpired = async () => {
        // Limpar dados
        await AsyncStorage.removeItem(USER_STORAGE_KEY);
        setUserState(null);
        setSessionInfo(null);
        
        // Mostrar mensagem apenas se não estiver na tela de login
        if (!isAuthScreen) {
            toast.warning('Sua sessão expirou. Faça login novamente.');
            router.replace('/(auth)/sign-in');
        }
    };

    // Salvar/atualizar usuário
    const setUser = async (userData: UserTypes | null) => {
        if (userData) {
            await AsyncStorage.setItem(USER_STORAGE_KEY, JSON.stringify(userData));
        } else {
            await AsyncStorage.removeItem(USER_STORAGE_KEY);
        }
        setUserState(userData);
    };

    // Atualizar dados do usuário
    const updateUser = async (updates: Partial<UserTypes>) => {
        if (!user) return;
        
        const updatedUser = { ...user, ...updates };
        await setUser(updatedUser);
    };

    // Carregar credenciais salvas
    const loadSavedCredentials = async () => {
        try {
            const rememberMe = await AsyncStorage.getItem(REMEMBER_ME_KEY);
            if (rememberMe !== 'true') return null;
            
            const encryptedCreds = await AsyncStorage.getItem(ENCRYPTED_CREDS_KEY);
            if (!encryptedCreds) return null;
            
            const decryptedCreds = await decrypt(encryptedCreds);
            const creds = JSON.parse(decryptedCreds);
            
            return {
                email: creds.email,
                password: creds.password,
                rememberMe: true
            };
        } catch (error) {
            console.error('Erro ao carregar credenciais:', error);
            return null;
        }
    };

    // Limpar credenciais salvas
    const clearSavedCredentials = async () => {
        await AsyncStorage.multiRemove([
            ENCRYPTED_CREDS_KEY,
            REMEMBER_ME_KEY
        ]);
    };

    // Obter sessões ativas
    const getActiveSessions = async () => {
        try {
            return await authService.getAllSessions();
        } catch (error) {
            console.error('Erro ao obter sessões:', error);
            return [];
        }
    };

    // Invalidar sessão específica
    const invalidateSession = async (sessionId: string) => {
        try {
            await authService.invalidateSession(sessionId);
            toast.info('Sessão encerrada');
        } catch (error) {
            console.error('Erro ao invalidar sessão:', error);
            toast.error('Erro ao encerrar sessão');
        }
    };

    // Recuperação de senha (placeholder - implementar com o serviço real)
    const requestPasswordReset = async (email: string) => {
        try {
            // Implementar chamada real ao serviço
            toast.success('Email de recuperação enviado');
        } catch (error) {
            toast.error('Erro ao enviar email de recuperação');
        }
    };

    const resetPassword = async (token: string, newPassword: string) => {
        try {
            // Implementar chamada real ao serviço
            toast.success('Senha alterada com sucesso');
        } catch (error) {
            toast.error('Erro ao alterar senha');
        }
    };

    // Listener para mudanças no storage
    useEffect(() => {
        const unsubscribe = storage.addListener(async (authData: any) => {
            if (!authData && !isAuthScreen && user) {
                await handleSessionExpired();
            }
        });
        
        return unsubscribe;
    }, [user, isAuthScreen]);

    // Verificar atualizações quando o app inicia
    useEffect(() => {
        if (!loading && user) {
            checkForUpdates();
        }
    }, [loading, user]);

    // Verificar atualizações do app
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
                        {
                            text: 'Reiniciar',
                            onPress: () => Updates.reloadAsync()
                        }
                    ]
                );
            }
        } catch (error) {
            console.log('Erro ao verificar atualizações:', error);
        }
    };

    return (
        <AuthContext.Provider
            value={{
                // Estados
                signed: !!user,
                user,
                loading,
                isRefreshing,
                isOnline,
                sessionInfo,
                
                // Métodos
                login,
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