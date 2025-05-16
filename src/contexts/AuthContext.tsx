import React, { createContext, useContext, useEffect, useState, useRef } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AppState, AppStateStatus } from 'react-native';
import { signOut, signIn, requestPassword, requestResetPassword, checkAndRefreshToken, refreshAuthToken } from "@/services/auth";
import { UserTypes } from "@/types/UserTypes";
import AlertContext from "./AlertContext";
import { handleErrors } from "@/utils/directus";
import { useRouter, useSegments } from "expo-router";
import { storage } from '@/services/api';

interface Props {
    children: React.ReactNode;
}

interface AuthContextData {
    signed: boolean;
    user: UserTypes | null;
    login(email: string, password: string, rememberMe?: boolean): Promise<void>;
    logout(): void;
    requestPasswordReset(email: string): Promise<void>;
    setUser(user: UserTypes | null): Promise<void>;
    resetPassword(token: string, newPassword: string): Promise<void>;
    loading: boolean;
    isRefreshing: boolean;
    checkSession(): Promise<boolean>;
    loadSavedCredentials(): Promise<{ email: string, password: string, rememberMe: boolean } | null>;
}

const USER_STORAGE_KEY = '@UNAADEB:User';
const REMEMBER_ME_KEY = '@UNAADEB:RememberMe';
const CREDS_STORAGE_KEY = '@UNAADEB:SavedCredentials';
// Flag para controlar redirecionamentos
const REDIRECT_IN_PROGRESS_KEY = '@UNAADEB:RedirectInProgress';

const AuthContext = createContext<AuthContextData>({} as AuthContextData);

export const AuthProvider: React.FC<Props> = ({ children }) => {
    const [user, setUserState] = useState<UserTypes | null>(null);
    const [loading, setLoading] = useState(true);
    const [isRefreshing, setIsRefreshing] = useState(false);
    const alert = useContext(AlertContext);
    const router = useRouter();
    const segments = useSegments();
    const appState = useRef(AppState.currentState);

    // Determina se estamos na tela de login
    const isAuthScreen = segments[0] === '(auth)';

    // Referência para o intervalo de verificação do token
    const tokenCheckIntervalRef = useRef<NodeJS.Timeout | null>(null);
    // Flag para evitar múltiplas renovações de token simultâneas
    const isRefreshingTokenRef = useRef(false);
    // Flag para evitar loops de redirecionamento
    const redirectInProgressRef = useRef(false);

    // Função para salvar/recuperar estado de redirecionamento
    const setRedirectInProgress = async (inProgress: boolean) => {
        redirectInProgressRef.current = inProgress;
        await AsyncStorage.setItem(REDIRECT_IN_PROGRESS_KEY, String(inProgress));
    };

    const getRedirectInProgress = async (): Promise<boolean> => {
        const value = await AsyncStorage.getItem(REDIRECT_IN_PROGRESS_KEY);
        return value === 'true';
    };

    // Inicialização - carregar dados do usuário e configurar verificação de token
    useEffect(() => {
        async function loadStorageData() {
            try {
                // Verificar se há um redirecionamento em andamento
                const redirectInProgress = await getRedirectInProgress();
                if (redirectInProgress) {
                    // Resetar o estado para evitar loops
                    await setRedirectInProgress(false);
                    setLoading(false);
                    return;
                }

                const storedUser = await AsyncStorage.getItem(USER_STORAGE_KEY);
                if (storedUser) {
                    setUserState(JSON.parse(storedUser));

                    // Não verificar token na tela de login para evitar loops
                    if (!isAuthScreen) {
                        // Verificar se o token é válido
                        const isTokenValid = await checkAndRefreshToken();
                        if (!isTokenValid) {
                            await handleTokenExpired();
                        }
                    }
                }
            } catch (e) {
                console.error("Erro ao carregar dados do storage:", e);
                // Não mostrar erro na tela de login para evitar loops
                if (!isAuthScreen) {
                    alert.error('Falha ao restaurar informações de autenticação.');
                }
            } finally {
                setLoading(false);
            }
        }

        loadStorageData();

        // Adicionar ouvinte para mudanças nos dados de autenticação do Directus
        const unsubscribe = storage.addListener(async (authData: any) => {
            // Se não houver dados de autenticação, o usuário foi deslogado
            if (!authData && !isAuthScreen) {
                await handleTokenExpired();
            }
        });

        // Configurar verificação periódica de token apenas se não estivermos na tela de login
        if (!isAuthScreen) {
            setupTokenCheck();
        }

        // Adicionar listener para mudanças no estado do app
        const subscription = AppState.addEventListener('change', handleAppStateChange);

        // Limpeza na desmontagem
        return () => {
            unsubscribe();
            subscription.remove();
            if (tokenCheckIntervalRef.current) {
                clearInterval(tokenCheckIntervalRef.current);
            }
        };
    }, [segments]);

    // Handler para mudanças de estado do app
    const handleAppStateChange = async (nextAppState: AppStateStatus) => {
        // Quando o app voltar para o primeiro plano
        if (
            appState.current.match(/inactive|background/) &&
            nextAppState === 'active' &&
            user &&
            !isAuthScreen // Não verificar na tela de login
        ) {
            console.log('App voltou para o primeiro plano, verificando token...');

            try {
                const isValid = await checkAndRefreshToken();
                if (!isValid) {
                    await handleTokenExpired();
                }
            } catch (error) {
                console.error('Erro ao verificar token ao retornar para primeiro plano:', error);
            }
        }

        appState.current = nextAppState;
    };

    // Configurar verificação periódica do token
    const setupTokenCheck = () => {
        // Limpar intervalo anterior se existir
        if (tokenCheckIntervalRef.current) {
            clearInterval(tokenCheckIntervalRef.current);
        }

        // Verificar a cada 5 minutos
        tokenCheckIntervalRef.current = setInterval(async () => {
            // Pular se já estiver verificando ou se estiver na tela de login
            if (isRefreshingTokenRef.current || isAuthScreen || !user) return;

            try {
                isRefreshingTokenRef.current = true;

                // Verificar se está logado
                const authData = await storage.get();
                if (!authData) return;

                // Verificar e renovar token se necessário
                const isTokenValid = await checkAndRefreshToken();
                if (!isTokenValid) {
                    await handleTokenExpired();
                }
            } catch (error) {
                console.error("Erro ao verificar token:", error);
            } finally {
                isRefreshingTokenRef.current = false;
            }
        }, 5 * 60 * 1000); // 5 minutos
    };

    // Função para lidar com token expirado
    const handleTokenExpired = async () => {
        // Evitar múltiplos redirecionamentos simultâneos
        if (redirectInProgressRef.current || isAuthScreen) return;

        try {
            await setRedirectInProgress(true);

            // Limpar dados do usuário no AsyncStorage
            await AsyncStorage.removeItem(USER_STORAGE_KEY);

            // Limpar estado do usuário
            setUserState(null);

            // Limpar dados de autenticação do storage interno
            await storage.clear();

            // Redirecionar para tela de login
            router.replace('/(auth)/sign-in');

            // Mostrar mensagem apenas uma vez
            alert.error('Sua sessão expirou. Por favor, faça login novamente.');
        } finally {
            // Resetar flag após um pequeno delay
            setTimeout(async () => {
                await setRedirectInProgress(false);
            }, 2000);
        }
    };

    // Verificar se a sessão ainda é válida
    async function checkSession(): Promise<boolean> {
        // Não verificar se estivermos na tela de login
        if (isAuthScreen) return false;

        try {
            setIsRefreshing(true);

            // Verificar e renovar token se necessário
            return await checkAndRefreshToken();
        } catch (error) {
            console.error("Erro ao verificar sessão:", error);
            return false;
        } finally {
            setIsRefreshing(false);
        }
    }

    async function login(email: string, password: string, rememberMe: boolean = false) {
        setLoading(true);
        try {
            const user = await signIn(email, password);
            if (user.status === 'active') {
                await setUser(user);

                // Armazenar preferência de "lembrar-me"
                await AsyncStorage.setItem(REMEMBER_ME_KEY, rememberMe.toString());

                // Armazenar credentials se rememberMe for true
                if (rememberMe) {
                    // Armazenar em formato seguro ou criptografado
                    await AsyncStorage.setItem(CREDS_STORAGE_KEY,
                        JSON.stringify({ email, password: btoa(password) }));
                } else {
                    await AsyncStorage.removeItem(CREDS_STORAGE_KEY);
                }

                setupTokenCheck();
                router.push('/(tabs)/(home)/');
            }
        } catch (error: any) {
            // Tratamento mais robusto para diferentes tipos de erro
            let errorMessage;

            if (error.errors) {
                // Erros no formato Directus
                errorMessage = handleErrors(error.errors);
            } else if (error.message) {
                // Erro simples com message
                errorMessage = error.message;
            } else {
                // Fallback
                errorMessage = "Falha ao fazer login. Tente novamente mais tarde.";
            }

            alert.error(errorMessage);
        } finally {
            setLoading(false);
        }
    }

    async function logout() {
        try {
            // Evitar múltiplos redirecionamentos simultâneos
            if (redirectInProgressRef.current) return;
            await setRedirectInProgress(true);

            // Primeiro, limpar o armazenamento local
            await AsyncStorage.removeItem(USER_STORAGE_KEY);
            setUserState(null);

            try {
                // Tentar fazer o logout no servidor (pode falhar se o token estiver inválido)
                await signOut();
            } catch (error) {
                console.log('Erro ao fazer logout no servidor, continuando com logout local:', error);
            }

            // Garantir que o storage interno seja limpo
            await storage.clear();

            // Redirecionar para a tela de login
            router.replace('/(auth)/sign-in');
        } catch (error: any) {
            console.error('Erro ao fazer logout:', error);
        } finally {
            // Resetar flag após um pequeno delay
            setTimeout(async () => {
                await setRedirectInProgress(false);
            }, 1000);
        }
    }

    async function requestPasswordReset(email: string): Promise<void> {
        try {
            await requestPassword(email);
            alert.success(`Solicitação de redefinição de senha enviada para ${email}`);
        } catch (error: any) {
            const message = handleErrors(error.errors);
            alert.error(message);
        }
    }

    async function resetPassword(token: string, newPassword: string): Promise<void> {
        try {
            await requestResetPassword(token, newPassword);
        } catch (error: any) {
            const message = handleErrors(error.errors);
            alert.error(message);
        }
    }

    async function setUser(user: UserTypes | null) {
        if (user) {
            await AsyncStorage.setItem(USER_STORAGE_KEY, JSON.stringify(user));
        } else {
            await AsyncStorage.removeItem(USER_STORAGE_KEY);
        }
        setUserState(user);
    }

    // Função para carregar credenciais salvas
    async function loadSavedCredentials() {
        try {
            const rememberMeStr = await AsyncStorage.getItem(REMEMBER_ME_KEY);
            const rememberMe = rememberMeStr === 'true';

            if (rememberMe) {
                const savedCredsStr = await AsyncStorage.getItem(CREDS_STORAGE_KEY);
                if (savedCredsStr) {
                    const savedCreds = JSON.parse(savedCredsStr);
                    return {
                        email: savedCreds.email,
                        password: atob(savedCreds.password),
                        rememberMe: true
                    };
                }
            }
        } catch (error) {
            console.error('Erro ao carregar credenciais salvas:', error);
        }
        return null;
    }

    return (
        <AuthContext.Provider
            value={{
                signed: !!user,
                user,
                login,
                logout,
                requestPasswordReset,
                resetPassword,
                setUser,
                loading,
                isRefreshing,
                checkSession,
                loadSavedCredentials
            }}>
            {children}
        </AuthContext.Provider>
    );
};

export default AuthContext;

export function useAuth() {
    return useContext(AuthContext);
}
