import React, { memo } from 'react';
import { View, Pressable } from 'react-native';
import { Text } from '@/components/ui/text';
import { Feather } from '@expo/vector-icons';
import colors from '@/constants/colors';

interface NotificationHeaderProps {
    notificationCount: number;
    unreadCount: number;
    onMarkAllAsRead: () => void;
}

export const NotificationHeader = memo<NotificationHeaderProps>(({ 
    notificationCount, 
    unreadCount, 
    onMarkAllAsRead 
}) => {
    if (notificationCount === 0) return null;

    return (
        <View className="bg-white px-4 pt-4 pb-3 border-b border-gray-200">
            <View className="flex-row justify-between items-center mb-3">
                <Text className="text-2xl font-bold text-gray-900">
                    Notificações
                </Text>
                
                {unreadCount > 0 && (
                    <NotificationBadge count={unreadCount} />
                )}
            </View>

            {unreadCount > 0 && (
                <MarkAllAsReadButton onPress={onMarkAllAsRead} />
            )}
        </View>
    );
});

NotificationHeader.displayName = 'NotificationHeader';

// Sub-componentes
const NotificationBadge = memo<{ count: number }>(({ count }) => (
    <View className="bg-primary-500 rounded-full px-3 py-1">
        <Text className="text-white text-sm font-semibold">
            {count} {count === 1 ? 'nova' : 'novas'}
        </Text>
    </View>
));

NotificationBadge.displayName = 'NotificationBadge';

const MarkAllAsReadButton = memo<{ onPress: () => void }>(({ onPress }) => (
    <Pressable
        onPress={onPress}
        className="flex-row items-center justify-center border border-primary-500 rounded-lg px-3 py-2 active:bg-primary-50"
    >
        <Feather name="check-circle" size={16} color={colors.primary} />
        <Text className="ml-2 text-primary-600 font-semibold text-sm">
            Marcar todas como lidas
        </Text>
    </Pressable>
));

MarkAllAsReadButton.displayName = 'MarkAllAsReadButton';