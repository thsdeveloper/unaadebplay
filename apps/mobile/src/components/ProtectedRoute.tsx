import React, { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'expo-router';
import { Spinner } from '@/components/ui/spinner';
import { Center } from '@/components/ui/center';
import { Text } from '@/components/ui/text';

interface ProtectedRouteProps {
    children: React.ReactNode;
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
    const { signed, loading, isRefreshing, checkSession } = useAuth();
    const [isCheckingSession, setIsCheckingSession] = useState(false);
    const router = useRouter();

    useEffect(() => {
        async function verifySession() {
            // Se já estiver carregando ou verificando, não fazer nada
            if (loading || isRefreshing || isCheckingSession) return;

            // Se não estiver logado, redirecionar para login
            if (!signed) {
                router.replace('/(auth)/sign-in');
                return;
            }

            // Verificar se a sessão é válida
            setIsCheckingSession(true);
            const isSessionValid = await checkSession();
            setIsCheckingSession(false);

            // Se a sessão não for válida, AuthContext já vai redirecionar para login
            if (!isSessionValid && signed) {
                router.replace('/(auth)/sign-in');
            }
        }

        verifySession();
    }, [signed, loading, router, checkSession]);

    // Exibir tela de carregamento enquanto verifica autenticação
    if (loading || isRefreshing || isCheckingSession) {
        return (
            <Center>
                <Spinner size="lg" color="$primary500" />
                <Text>
                    {isRefreshing ? 'Renovando sua sessão...' : 'Verificando autenticação...'}
                </Text>
            </Center>
        );
    }

    // Se não estiver autenticado, não renderizar nada (roteamento já vai redirecionar)
    if (!signed) {
        return null;
    }

    // Se estiver autenticado, renderizar o conteúdo
    return <>{children}</>;
}
