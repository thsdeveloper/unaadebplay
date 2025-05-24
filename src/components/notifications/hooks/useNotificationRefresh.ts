import { useEffect, useState, useCallback, useRef } from 'react';
import { AppState, AppStateStatus } from 'react-native';
import { useFocusEffect } from 'expo-router';

interface UseNotificationRefreshProps {
    refreshNotifications: () => Promise<void>;
}

export function useNotificationRefresh({ refreshNotifications }: UseNotificationRefreshProps) {
    const [refreshing, setRefreshing] = useState(false);
    const [focusCount, setFocusCount] = useState(0);
    const lastBackgroundTime = useRef(Date.now());

    // Atualizar quando a tela recebe foco (removido para evitar loops)
    // O NotificationContext já gerencia as atualizações
    useFocusEffect(
        useCallback(() => {
            // Incrementar contador de foco apenas para tracking
            setFocusCount(prev => prev + 1);
        }, [])
    );

    // Monitorar mudanças de estado do app
    useEffect(() => {
        const handleAppStateChange = (nextAppState: AppStateStatus) => {
            if (nextAppState === 'active') {
                const timeDiff = Date.now() - lastBackgroundTime.current;
                // Só atualiza se ficou mais de 30 segundos em background
                if (timeDiff > 30000) {
                    refreshNotifications();
                }
            } else if (nextAppState === 'background') {
                lastBackgroundTime.current = Date.now();
            }
        };

        const subscription = AppState.addEventListener('change', handleAppStateChange);
        return () => subscription.remove();
    }, [refreshNotifications]);

    const onRefresh = useCallback(async () => {
        setRefreshing(true);
        await refreshNotifications();
        setRefreshing(false);
    }, [refreshNotifications]);

    return {
        refreshing,
        onRefresh
    };
}