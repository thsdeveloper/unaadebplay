import React, { memo } from 'react';
import { View, Pressable, Text as RNText, StyleSheet } from 'react-native';
import { CheckCheck } from 'lucide-react-native';
import { SHEET } from '@/constants/sheetTokens';

interface NotificationHeaderProps {
    notificationCount: number;
    unreadCount: number;
    onMarkAllAsRead: () => void;
}

export const NotificationHeader = memo<NotificationHeaderProps>(({ notificationCount, unreadCount, onMarkAllAsRead }) => {
    if (notificationCount === 0) return null;

    return (
        <View style={s.wrap}>
            <RNText style={s.count}>
                {unreadCount > 0 ? `${unreadCount} não lida${unreadCount > 1 ? 's' : ''}` : 'Tudo em dia'}
            </RNText>

            {unreadCount > 0 && (
                <Pressable onPress={onMarkAllAsRead} style={s.markBtn} hitSlop={8}>
                    <CheckCheck size={15} color={SHEET.brand} strokeWidth={2.4} />
                    <RNText style={s.markText}>Marcar todas como lidas</RNText>
                </Pressable>
            )}
        </View>
    );
});

NotificationHeader.displayName = 'NotificationHeader';

const s = StyleSheet.create({
    wrap: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 12,
        paddingHorizontal: 16,
        paddingTop: 8,
        paddingBottom: 12,
    },
    count: { color: SHEET.textMuted, fontSize: 13, fontWeight: '700', letterSpacing: 0.2 },
    markBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 999,
        backgroundColor: SHEET.brandTint,
        borderWidth: 1,
        borderColor: 'rgba(229,28,68,0.35)',
    },
    markBtnPressed: { opacity: 0.7 },
    markText: { color: SHEET.brand, fontSize: 12.5, fontWeight: '700' },
});
