// src/utils/apiErrorHandler.ts
import { useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Platform } from 'react-native';

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

    useEffect(() => {
        // Função para tratar erros de API
        const handleApiError = async (error: any) => {
            // Verificar se é um erro de token expirado
            if (isTokenExpiredError(error)) {
                console.log('Token expirado detectado, tentando renovar...');

                // Verificar se o refresh token ainda é válido
                const isSessionValid = await checkSession();

                // Se não for possível renovar o token, fazer logout
                if (!isSessionValid) {
                    console.log('Não foi possível renovar o token, fazendo logout...');
                    await logout();
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
