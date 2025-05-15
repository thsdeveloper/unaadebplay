import React, { createContext, useContext, useEffect, useState, useRef } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { signOut, signIn, requestPassword, requestResetPassword, checkAndRefreshToken, refreshAuthToken } from "@/services/auth";
import { UserTypes } from "@/types/UserTypes";
import AlertContext from "./AlertContext";
import { handleErrors } from "@/utils/directus";
import { useRouter } from "expo-router";
import { storage } from '@/services/api';

interface Props {
    children: React.ReactNode;
}

interface AuthContextData {
    signed: boolean;
    user: UserTypes | null;
    login(email: string | null, password: string | null): Promise<void>;
    logout(): void;
    requestPasswordReset(email: string): Promise<void>;
    setUser(user: UserTypes | null): Promise<void>;
    resetPassword(token: string, newPassword: string): Promise<void>;
    loading: boolean;
    isRefreshing: boolean;
    checkSession(): Promise<boolean>;
}

const USER_STORAGE_KEY = '@UNAADEB:User';

const AuthContext = createContext<AuthContextData>({} as AuthContextData);

export const AuthProvider: React.FC<Props> = ({ children }) => {
    const [user, setUserState] = useState<UserTypes | null>(null);
    const [loading, setLoading] = useState(true);
    const [isRefreshing, setIsRefreshing] = useState(false);
    const alert = useContext(AlertContext);
    const router = useRouter();

    // Referência para o intervalo de verificação do token
    const tokenCheckIntervalRef = useRef<NodeJS.Timeout | null>(null);
    // Flag para evitar múltiplas renovações de token simultâneas
    const isRefreshingTokenRef = useRef(false);

    // Inicialização - carregar dados do usuário e configurar verificação de token
    useEffect(() => {
        async function loadStorageData() {
            try {
                const storedUser = await AsyncStorage.getItem(USER_STORAGE_KEY);
                if (storedUser) {
                    setUserState(JSON.parse(storedUser));

                    // Verificar se o token é válido
                    const isTokenValid = await checkAndRefreshToken();
                    if (!isTokenValid) {
                        await handleTokenExpired();
                    }
                }
            } catch (e) {
                console.error("Erro ao carregar dados do storage:", e);
                alert.error('Falha ao restaurar informações de autenticação.');
            } finally {
                setLoading(false);
            }
        }

        loadStorageData();

        // Adicionar ouvinte para mudanças nos dados de autenticação do Directus
        const unsubscribe = storage.addListener(async (authData) => {
            // Se não houver dados de autenticação, o usuário foi deslogado
            if (!authData) {
                await handleTokenExpired();
            }
        });

        // Configurar verificação periódica de token
        setupTokenCheck();

        // Limpeza na desmontagem
        return () => {
            unsubscribe();
            if (tokenCheckIntervalRef.current) {
                clearInterval(tokenCheckIntervalRef.current);
            }
        };
    }, []);

    // Configurar verificação periódica do token
    const setupTokenCheck = () => {
        // Limpar intervalo anterior se existir
        if (tokenCheckIntervalRef.current) {
            clearInterval(tokenCheckIntervalRef.current);
        }

        // Verificar a cada 5 minutos
        tokenCheckIntervalRef.current = setInterval(async () => {
            // Pular se já estiver verificando
            if (isRefreshingTokenRef.current) return;

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
        // Limpar dados do usuário no AsyncStorage
        await AsyncStorage.removeItem(USER_STORAGE_KEY);

        // Limpar estado do usuário
        setUserState(null);

        // Redirecionar para tela de login
        router.replace('/(auth)/sign-in');

        // Mostrar mensagem
        alert.error('Sua sessão expirou. Por favor, faça login novamente.');
    };

    // Verificar se a sessão ainda é válida
    async function checkSession(): Promise<boolean> {
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

    async function login(email: string, password: string) {
        setLoading(true);
        try {
            const user = await signIn(email, password);
            if (user.status === 'active') {
                await setUser(user);
                setupTokenCheck(); // Reiniciar verificação de token após login
                router.push('/(tabs)/(home)/');
            }
        } catch (error) {
            const message = handleErrors(error.errors);
            alert.error(message);
        } finally {
            setLoading(false);
        }
    }

    async function logout() {
        try {
            await setUser(null);
            // await signOut();
            router.replace('/(auth)/sign-in');
        } catch (error) {
            const message = handleErrors(error.errors);
            alert.error(message);
        }
    }

    async function requestPasswordReset(email: string): Promise<void> {
        try {
            await requestPassword(email);
            alert.success(`Solicitação de redefinição de senha enviada para ${email}`);
        } catch (error) {
            const message = handleErrors(error.errors);
            alert.error(message);
        }
    }

    async function resetPassword(token: string, newPassword: string): Promise<void> {
        try {
            await requestResetPassword(token, newPassword);
        } catch (error) {
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
                checkSession
            }}>
            {children}
        </AuthContext.Provider>
    );
};

export default AuthContext;

export function useAuth() {
    return useContext(AuthContext);
}
