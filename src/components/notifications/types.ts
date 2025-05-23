import type { NotificationData } from '@/services/notification';

export interface NotificationItemProps {
    notification: NotificationData;
    onPress: (id: string) => void;
    onDelete: (id: string) => void;
}

export interface NotificationHeaderProps {
    notificationCount: number;
    unreadCount: number;
    onMarkAllAsRead: () => void;
}

export interface EmptyNotificationsProps {
    isLoading: boolean;
    onRefresh: () => void;
    onSendTest?: () => void;
    onDebug?: () => void;
    userId?: string;
    isDevelopment?: boolean;
}

export interface NotificationHandlers {
    handleReadNotification: (id: string) => Promise<void>;
    handleDeleteNotification: (id: string) => Promise<void>;
    handleMarkAllAsRead: () => Promise<void>;
    handleClearAll: () => Promise<void>;
}