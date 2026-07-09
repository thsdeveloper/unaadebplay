import { useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Platform } from 'react-native';
import {useTokenRefresh} from "@/contexts/TokenRefreshContext";
import {useNetwork} from "@/contexts/NetworkContext";
import {retryWithBackoff} from "@/utils/retry";

// Função para verificar se o erro é de token expirado
function isTokenExpiredError(error: any): boolean {
    return (
        error.status === 401 ||
        error.message?.includes('token expired') ||
        error.message?.includes('not authenticated')
    );
}

// Hook para adicionar tratamento global de erros de API
export function useApiErrorHandler() {
    const { checkSession, logout } = useAuth();
    const { isConnected } = useNetwork();
    const { showRefreshIndicator, hideRefreshIndicator } = useTokenRefresh();

    useEffect(() => {
        // Função para tratar erros de API
        const handleApiError = async (error: any) => {
            // Se estiver offline, não tente renovar token
            if (!isConnected) {
                console.log('Dispositivo offline, ignorando erros de autenticação');
                return;
            }

            // Verificar se é um erro de token expirado
            if (isTokenExpiredError(error)) {
                console.log('Token expirado detectado, tentando renovar...');

                // Mostrar indicador visual
                showRefreshIndicator();

                try {
                    // Tentativa com backoff exponencial
                    await retryWithBackoff(async () => {
                        const isSessionValid = await checkSession();
                        if (!isSessionValid) {
                            throw new Error('Falha ao renovar sessão');
                        }
                        return true;
                    }, 2);  // Máximo de 2 tentativas

                    console.log('Token renovado com sucesso');
                } catch (refreshError) {
                    console.log('Não foi possível renovar o token, fazendo logout...');
                    await logout();
                } finally {
                    hideRefreshIndicator();
                }
            }
        };

        // No React Native, não temos o objeto window
        // Vamos usar o ErrorUtils do React Native para capturar erros globais, quando disponível
        if (Platform.OS !== 'web' && global.ErrorUtils) {
            const originalGlobalHandler = global.ErrorUtils.getGlobalHandler();

            // Configurar um novo handler global
            global.ErrorUtils.setGlobalHandler(async (error, isFatal) => {
                // Primeiro, tentar tratar erros de token
                try {
                    await handleApiError(error);
                } catch (handlerError) {
                    console.error('Erro no handler de API:', handlerError);
                }

                // Em seguida, chamar o handler original
                originalGlobalHandler(error, isFatal);
            });
        }

        // Este hook não precisa retornar uma função de cleanup em ambientes React Native
        // pois o ErrorUtils é global
    }, [checkSession, logout]);

    // Este hook não retorna nada, apenas configura o tratamento de erros
    return null;
}
