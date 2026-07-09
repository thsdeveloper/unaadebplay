import { useCallback } from 'react';
import { Alert } from 'react-native';

interface UseNotificationHandlersProps {
    markAsRead: (id: string) => Promise<void>;
    deleteNotification: (id: string) => Promise<void>;
    markAllAsRead: () => Promise<void>;
    clearAllNotifications: () => Promise<void>;
    unreadCount: number;
    notificationCount: number;
}

export function useNotificationHandlers({
    markAsRead,
    deleteNotification,
    markAllAsRead,
    clearAllNotifications,
    unreadCount,
    notificationCount
}: UseNotificationHandlersProps) {
    const handleReadNotification = useCallback(async (id: string) => {
        await markAsRead(id);
    }, [markAsRead]);

    const handleDeleteNotification = useCallback(async (id: string) => {
        await deleteNotification(id);
    }, [deleteNotification]);

    const handleMarkAllAsRead = useCallback(async () => {
        if (unreadCount === 0) return;

        Alert.alert(
            'Marcar todas como lidas',
            `Deseja marcar todas as ${unreadCount} notificações não lidas como lidas?`,
            [
                { text: 'Cancelar', style: 'cancel' },
                {
                    text: 'Confirmar',
                    onPress: markAllAsRead
                }
            ]
        );
    }, [unreadCount, markAllAsRead]);

    const handleClearAll = useCallback(async () => {
        if (notificationCount === 0) return;

        Alert.alert(
            'Limpar todas as notificações',
            'Esta ação removerá todas as notificações. Deseja continuar?',
            [
                { text: 'Cancelar', style: 'cancel' },
                {
                    text: 'Limpar Tudo',
                    style: 'destructive',
                    onPress: clearAllNotifications
                }
            ]
        );
    }, [notificationCount, clearAllNotifications]);

    return {
        handleReadNotification,
        handleDeleteNotification,
        handleMarkAllAsRead,
        handleClearAll
    };
}