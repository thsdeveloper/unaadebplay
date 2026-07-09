import React, { useCallback, useMemo } from 'react';
import { FlatList, RefreshControl, View, Text as RNText, Pressable, StyleSheet } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { ArrowLeft } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { useNotifications } from '@/contexts/NotificationContext';
import { NotificationItem, NotificationHeader, EmptyNotifications, PERFORMANCE_CONFIG } from '@/components/notifications';
import { useNotificationHandlers, useNotificationRefresh } from '@/components/notifications/hooks';
import { SHEET } from '@/constants/sheetTokens';
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
    } = useNotifications();

    const router = useRouter();
    const insets = useSafeAreaInsets();

    const { refreshing, onRefresh } = useNotificationRefresh({ refreshNotifications });

    const { handleReadNotification, handleDeleteNotification, handleMarkAllAsRead } = useNotificationHandlers({
        markAsRead,
        deleteNotification,
        markAllAsRead,
        clearAllNotifications,
        unreadCount,
        notificationCount: notifications.length,
    });

    const keyExtractor = useCallback((item: NotificationData) => item.id, []);

    const renderNotificationItem = useCallback(
        ({ item }: { item: NotificationData }) => (
            <NotificationItem notification={item} onPress={handleReadNotification} onDelete={handleDeleteNotification} />
        ),
        [handleReadNotification, handleDeleteNotification],
    );

    const listHeaderComponent = useMemo(
        () => (
            <NotificationHeader
                notificationCount={notifications.length}
                unreadCount={unreadCount}
                onMarkAllAsRead={handleMarkAllAsRead}
            />
        ),
        [notifications.length, unreadCount, handleMarkAllAsRead],
    );

    const listEmptyComponent = useMemo(
        () => <EmptyNotifications isLoading={isLoading} onRefresh={refreshNotifications} />,
        [isLoading, refreshNotifications],
    );

    return (
        <View style={s.screen}>
            <Stack.Screen options={{ headerShown: false }} />
            <StatusBar style="light" />

            {/* Header de navegação (dark) — back + título + contador. */}
            <View style={[s.header, { paddingTop: insets.top + 6 }]}>
                <Pressable onPress={() => router.back()} hitSlop={8} style={s.backPill} accessibilityRole="button" accessibilityLabel="Voltar">
                    <ArrowLeft size={20} color={SHEET.textPrimary} strokeWidth={2.5} />
                </Pressable>
                <RNText style={s.headerTitle}>Notificações</RNText>
                {unreadCount > 0 ? (
                    <View style={s.countPill}>
                        <RNText style={s.countPillText}>{unreadCount > 99 ? '99+' : unreadCount}</RNText>
                    </View>
                ) : (
                    <View style={s.headerSpacer} />
                )}
            </View>

            <GestureHandlerRootView style={s.screen}>
                <FlatList
                    data={notifications}
                    keyExtractor={keyExtractor}
                    renderItem={renderNotificationItem}
                    ListHeaderComponent={listHeaderComponent}
                    ListEmptyComponent={listEmptyComponent}
                    contentContainerStyle={[s.listContent, { paddingBottom: insets.bottom + 90 }]}
                    refreshControl={
                        <RefreshControl
                            refreshing={refreshing}
                            onRefresh={onRefresh}
                            tintColor={SHEET.brand}
                            colors={[SHEET.brand]}
                            progressBackgroundColor={SHEET.surface}
                        />
                    }
                    showsVerticalScrollIndicator={false}
                    removeClippedSubviews
                    maxToRenderPerBatch={PERFORMANCE_CONFIG.MAX_RENDER_PER_BATCH}
                    updateCellsBatchingPeriod={PERFORMANCE_CONFIG.UPDATE_CELLS_BATCHING_PERIOD}
                    initialNumToRender={PERFORMANCE_CONFIG.INITIAL_NUM_TO_RENDER}
                    windowSize={PERFORMANCE_CONFIG.WINDOW_SIZE}
                />
            </GestureHandlerRootView>
        </View>
    );
}

const s = StyleSheet.create({
    screen: { flex: 1, backgroundColor: SHEET.bg },
    listContent: { flexGrow: 1, paddingTop: 4 },

    header: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        paddingHorizontal: 16,
        paddingBottom: 12,
        backgroundColor: SHEET.bgDeep,
        borderBottomWidth: StyleSheet.hairlineWidth,
        borderBottomColor: SHEET.border,
    },
    backPill: {
        width: 40,
        height: 40,
        borderRadius: 20,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: SHEET.glass,
        borderWidth: StyleSheet.hairlineWidth,
        borderColor: SHEET.border,
    },
    headerTitle: { flex: 1, color: SHEET.textPrimary, fontSize: 19, fontWeight: '800' },
    headerSpacer: { width: 40, height: 24 },
    countPill: {
        minWidth: 26,
        height: 24,
        borderRadius: 12,
        paddingHorizontal: 8,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: SHEET.brandTint,
        borderWidth: 1,
        borderColor: 'rgba(229,28,68,0.4)',
    },
    countPillText: { color: SHEET.brand, fontSize: 12.5, fontWeight: '800' },
});
