import React, { memo, useCallback, useState } from 'react';
import { Alert, Pressable, View, Text as RNText, StyleSheet } from 'react-native';
import { Bell, Check, Trash2 } from 'lucide-react-native';
import { Swipeable } from 'react-native-gesture-handler';
import Animated, {
    FadeIn,
    FadeOut,
    Layout,
    useAnimatedStyle,
    withTiming,
    useSharedValue,
} from 'react-native-reanimated';
import { NotificationData } from '@/services/notification';
import { SHEET } from '@/constants/sheetTokens';
import { formatNotificationDate } from './utils';
import { SWIPE_ACTION_WIDTH } from './constants';

interface NotificationItemProps {
    notification: NotificationData;
    onPress: (id: string) => void;
    onDelete: (id: string) => void;
}

export const NotificationItem = memo<NotificationItemProps>(({ notification, onPress, onDelete }) => {
    const swipeableRef = React.useRef<Swipeable>(null);
    const [isDeleting, setIsDeleting] = useState(false);
    const opacity = useSharedValue(1);
    const scale = useSharedValue(1);

    const formattedDate = React.useMemo(() => formatNotificationDate(notification.created_at), [notification.created_at]);

    const handlePress = useCallback(() => {
        if (!notification.read) onPress(notification.id);
        swipeableRef.current?.close();
    }, [notification.id, notification.read, onPress]);

    const handleDelete = useCallback(() => {
        Alert.alert('Excluir notificação', 'Tem certeza que deseja excluir esta notificação?', [
            { text: 'Cancelar', style: 'cancel', onPress: () => swipeableRef.current?.close() },
            {
                text: 'Excluir',
                style: 'destructive',
                onPress: () => {
                    setIsDeleting(true);
                    opacity.value = withTiming(0, { duration: 260 });
                    scale.value = withTiming(0.85, { duration: 260 });
                    setTimeout(() => onDelete(notification.id), 260);
                },
            },
        ]);
    }, [notification.id, onDelete, opacity, scale]);

    const animatedContainerStyle = useAnimatedStyle(() => ({
        opacity: opacity.value,
        transform: [{ scale: scale.value }],
    }));

    if (isDeleting) return <Animated.View style={[animatedContainerStyle, { height: 0 }]} />;

    return (
        <Animated.View
            entering={FadeIn.duration(280)}
            exiting={FadeOut.duration(260)}
            layout={Layout.springify()}
            style={animatedContainerStyle}
        >
            <Swipeable
                ref={swipeableRef}
                renderLeftActions={() => <SwipeLeftAction onPress={handlePress} isRead={notification.read} />}
                renderRightActions={() => <SwipeRightAction onPress={handleDelete} />}
                overshootLeft={false}
                overshootRight={false}
                leftThreshold={40}
                rightThreshold={40}
                friction={2}
                shouldCancelWhenOutside
            >
                <NotificationContent notification={notification} formattedDate={formattedDate} onPress={handlePress} />
            </Swipeable>
        </Animated.View>
    );
});

NotificationItem.displayName = 'NotificationItem';

const SwipeLeftAction = memo<{ onPress: () => void; isRead: boolean }>(({ onPress, isRead }) => {
    if (isRead) return null;
    return (
        <Pressable onPress={onPress} style={[s.swipe, s.swipeRead]}>
            <Check size={22} color="#FFFFFF" strokeWidth={2.5} />
            <RNText style={s.swipeText}>Lido</RNText>
        </Pressable>
    );
});
SwipeLeftAction.displayName = 'SwipeLeftAction';

const SwipeRightAction = memo<{ onPress: () => void }>(({ onPress }) => (
    <Pressable onPress={onPress} style={[s.swipe, s.swipeDelete]}>
        <Trash2 size={21} color="#FFFFFF" strokeWidth={2.2} />
        <RNText style={s.swipeText}>Excluir</RNText>
    </Pressable>
));
SwipeRightAction.displayName = 'SwipeRightAction';

const NotificationContent = memo<{ notification: NotificationData; formattedDate: string; onPress: () => void }>(
    ({ notification, formattedDate, onPress }) => {
        const read = notification.read;
        const [pressed, setPressed] = useState(false);
        return (
            <Pressable
                onPress={onPress}
                onPressIn={() => setPressed(true)}
                onPressOut={() => setPressed(false)}
                android_ripple={{ color: SHEET.glass }}
                // Array ESTÁTICO (não função) — a forma `({pressed})=>[...]` some com o layout sob NativeWind.
                style={[s.row, !read && s.rowUnread, pressed && s.rowPressed]}
            >
                {!read && <View style={s.unreadBar} />}

                <View style={[s.iconWrap, read ? s.iconWrapRead : s.iconWrapUnread]}>
                    {read ? <Check size={18} color={SHEET.textMuted} strokeWidth={2.4} /> : <Bell size={17} color={SHEET.brand} strokeWidth={2.4} />}
                </View>

                <View style={s.textCol}>
                    <View style={s.topLine}>
                        <RNText style={[s.title, read ? s.titleRead : s.titleUnread]} numberOfLines={1}>
                            {notification.title}
                        </RNText>
                        <RNText style={s.date}>{formattedDate}</RNText>
                    </View>
                    <RNText style={[s.body, read ? s.bodyRead : s.bodyUnread]} numberOfLines={2}>
                        {notification.body}
                    </RNText>
                </View>
            </Pressable>
        );
    },
);
NotificationContent.displayName = 'NotificationContent';

const s = StyleSheet.create({
    row: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        paddingVertical: 14,
        paddingHorizontal: 16,
        minHeight: 68,
        backgroundColor: SHEET.bg,
        borderBottomWidth: StyleSheet.hairlineWidth,
        borderBottomColor: SHEET.hairline,
    },
    // OPACO (não translúcido) — senão a ação de swipe atrás vaza através da linha.
    rowUnread: { backgroundColor: '#1A1526' },
    rowPressed: { backgroundColor: SHEET.surface },
    unreadBar: { position: 'absolute', left: 0, top: 0, bottom: 0, width: 3, backgroundColor: SHEET.brand },

    iconWrap: { width: 40, height: 40, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
    iconWrapUnread: { backgroundColor: SHEET.brandTint },
    iconWrapRead: { backgroundColor: SHEET.glass },

    textCol: { flex: 1, gap: 3 },
    topLine: { flexDirection: 'row', alignItems: 'center', gap: 8 },
    title: { flex: 1, fontSize: 14.5 },
    titleUnread: { color: SHEET.textPrimary, fontWeight: '800' },
    titleRead: { color: SHEET.textSecondary, fontWeight: '600' },
    date: { color: SHEET.textFaint, fontSize: 11.5, fontWeight: '600' },
    body: { fontSize: 13.5, lineHeight: 19 },
    bodyUnread: { color: SHEET.textSecondary },
    bodyRead: { color: SHEET.textMuted },

    swipe: { width: SWIPE_ACTION_WIDTH, alignItems: 'center', justifyContent: 'center', gap: 4 },
    swipeRead: { backgroundColor: SHEET.success },
    swipeDelete: { backgroundColor: '#EF4444' },
    swipeText: { color: '#FFFFFF', fontSize: 12, fontWeight: '700' },
});
