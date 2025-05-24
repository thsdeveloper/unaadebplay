import React, { useCallback, useMemo } from 'react';
import { FlatList, RefreshControl, View, Text } from 'react-native';
import { Stack } from 'expo-router';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { useNotifications } from '@/contexts/NotificationContext';
import { useAuth } from '@/contexts/AuthContext';
import { 
    NotificationItem, 
    NotificationHeader, 
    EmptyNotifications,
    PERFORMANCE_CONFIG 
} from '@/components/notifications';
import { 
    useNotificationHandlers, 
    useNotificationRefresh 
} from '@/components/notifications/hooks';
import { debugNotifications } from '@/services/notification';
import colors from '@/constants/colors';
import type { NotificationData } from '@/services/notification';

export default function NotificationsScreen() {
    const {
        notifications,
        refreshNotifications,
        markAsRead,
        markAllAsRead,
        deleteNotification,
        unreadCount,
        isLoading,
        clearAllNotifications,
        sendTestNotification
    } = useNotifications();
    
    const { user } = useAuth();

    // Custom hooks
    const { refreshing, onRefresh } = useNotificationRefresh({ refreshNotifications });
    
    const {
        handleReadNotification,
        handleDeleteNotification,
        handleMarkAllAsRead,
        handleClearAll
    } = useNotificationHandlers({
        markAsRead,
        deleteNotification,
        markAllAsRead,
        clearAllNotifications,
        unreadCount,
        notificationCount: notifications.length
    });

    // Memoized values
    const keyExtractor = useCallback((item: NotificationData) => item.id, []);

    const renderNotificationItem = useCallback(({ item }: { item: NotificationData }) => (
        <NotificationItem
            notification={item}
            onPress={handleReadNotification}
            onDelete={handleDeleteNotification}
        />
    ), [handleReadNotification, handleDeleteNotification]);

    const listHeaderComponent = useMemo(() => (
        <NotificationHeader
            notificationCount={notifications.length}
            unreadCount={unreadCount}
            onMarkAllAsRead={handleMarkAllAsRead}
        />
    ), [notifications.length, unreadCount, handleMarkAllAsRead]);

    const listEmptyComponent = useMemo(() => (
        <EmptyNotifications
            isLoading={isLoading}
            onRefresh={refreshNotifications}
            onSendTest={sendTestNotification}
            onDebug={() => debugNotifications(user?.id || '')}
            userId={user?.id}
        />
    ), [isLoading, refreshNotifications, sendTestNotification, user?.id]);

    return (
        <>
            <Stack.Screen
                options={{
                    title: 'Notificações',
                    headerStyle: {
                        backgroundColor: colors.primary,
                    },
                    headerTintColor: colors.white,
                    headerShadowVisible: false,
                }}
            />

            <GestureHandlerRootView className="flex-1 bg-white">
                <FlatList
                    data={notifications}
                    keyExtractor={keyExtractor}
                    renderItem={renderNotificationItem}
                    ListHeaderComponent={listHeaderComponent}
                    ListEmptyComponent={listEmptyComponent}
                    contentContainerStyle={{
                        flexGrow: 1,
                        backgroundColor: '#FFFFFF',
                        minHeight: '100%'
                    }}
                    refreshControl={
                        <RefreshControl
                            refreshing={refreshing}
                            onRefresh={onRefresh}
                            colors={[colors.primary]}
                            tintColor={colors.primary}
                        />
                    }
                    showsVerticalScrollIndicator={false}
                    // Performance optimizations
                    removeClippedSubviews={true}
                    maxToRenderPerBatch={PERFORMANCE_CONFIG.MAX_RENDER_PER_BATCH}
                    updateCellsBatchingPeriod={PERFORMANCE_CONFIG.UPDATE_CELLS_BATCHING_PERIOD}
                    initialNumToRender={PERFORMANCE_CONFIG.INITIAL_NUM_TO_RENDER}
                    windowSize={PERFORMANCE_CONFIG.WINDOW_SIZE}
                    maintainVisibleContentPosition={{
                        minIndexForVisible: 0,
                    }}
                />
            </GestureHandlerRootView>
        </>
    );
}