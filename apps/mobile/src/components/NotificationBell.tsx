import React, { useEffect, useRef, memo, useCallback, useMemo } from 'react';
import { StyleSheet, Pressable, View, Text as RNText } from 'react-native';
import { Bell } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { useNotifications } from '@/contexts/NotificationContext';
import { REFRESH_INTERVALS } from '@/components/notifications';
import { SHEET } from '@/constants/sheetTokens';
import colors from '@/constants/colors';
import Animated, {
    useSharedValue,
    useAnimatedStyle,
    withSpring,
    withSequence,
    withTiming,
    withRepeat,
    Easing,
    cancelAnimation,
    runOnJS,
} from 'react-native-reanimated';

interface NotificationBellProps {
    color?: string;
}

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export const NotificationBell = memo(function NotificationBell({
    color = colors.white,
}: NotificationBellProps) {
    const { unreadCount, refreshNotifications, isLoading, realtimeConnected } = useNotifications();
    const router = useRouter();

    // Valores de animação
    const bellScale = useSharedValue(1);
    const bellRotation = useSharedValue(0);
    const badgeScale = useSharedValue(1);
    const pulseScale = useSharedValue(1);

    const prevUnreadCount = useRef(unreadCount);
    const animationTimeoutRef = useRef<NodeJS.Timeout | undefined>(undefined);
    const refreshIntervalRef = useRef<NodeJS.Timeout | undefined>(undefined);

    const cancelPulseAnimation = useCallback(() => {
        cancelAnimation(pulseScale);
        pulseScale.value = withTiming(1, { duration: 300 });
    }, []);

    // Animação de "toque de sino" quando chega notificação nova.
    useEffect(() => {
        if (unreadCount === prevUnreadCount.current) return;

        if (unreadCount > prevUnreadCount.current) {
            bellScale.value = withSequence(
                withSpring(1.25, { damping: 3, stiffness: 400 }),
                withSpring(1, { damping: 8, stiffness: 200 }),
            );
            bellRotation.value = withSequence(
                withTiming(-14, { duration: 100, easing: Easing.out(Easing.quad) }),
                withTiming(14, { duration: 100, easing: Easing.inOut(Easing.quad) }),
                withTiming(-9, { duration: 80, easing: Easing.inOut(Easing.quad) }),
                withTiming(0, { duration: 100, easing: Easing.out(Easing.quad) }),
            );
            badgeScale.value = withSequence(
                withSpring(1.35, { damping: 2, stiffness: 300 }),
                withSpring(1, { damping: 4, stiffness: 200 }),
            );
            pulseScale.value = withRepeat(
                withSequence(withTiming(1.08, { duration: 800 }), withTiming(1, { duration: 800 })),
                3,
                false,
            );
            if (animationTimeoutRef.current) clearTimeout(animationTimeoutRef.current);
            animationTimeoutRef.current = setTimeout(() => runOnJS(cancelPulseAnimation)(), 5000);
        } else if (unreadCount < prevUnreadCount.current) {
            badgeScale.value = withSequence(
                withSpring(0.8, { damping: 3, stiffness: 200 }),
                withSpring(1, { damping: 6, stiffness: 150 }),
            );
        }
        prevUnreadCount.current = unreadCount;
    }, [unreadCount, cancelPulseAnimation]);

    const refreshIfNeeded = useCallback(() => {
        if (!isLoading) refreshNotifications();
    }, [isLoading, refreshNotifications]);

    const refreshInterval = useMemo(() => {
        if (!realtimeConnected) return REFRESH_INTERVALS.OFFLINE;
        if (unreadCount > 0) return REFRESH_INTERVALS.WITH_UNREAD;
        return REFRESH_INTERVALS.NORMAL;
    }, [realtimeConnected, unreadCount]);

    useEffect(() => {
        refreshIntervalRef.current = setInterval(refreshIfNeeded, refreshInterval);
        return () => {
            if (refreshIntervalRef.current) clearInterval(refreshIntervalRef.current);
            if (animationTimeoutRef.current) clearTimeout(animationTimeoutRef.current);
        };
    }, [refreshInterval, refreshIfNeeded]);

    const bellAnimatedStyle = useAnimatedStyle(
        () => ({
            // `as any`: RN tipa transform como união estrita; o array misto (scale+rotate) não casa.
            transform: [{ scale: bellScale.value * pulseScale.value }, { rotate: `${bellRotation.value}deg` }] as any,
        }),
        [],
    );

    const badgeAnimatedStyle = useAnimatedStyle(
        () => ({
            transform: [{ scale: badgeScale.value }],
            opacity: withTiming(unreadCount > 0 ? 1 : 0, { duration: 200 }),
        }),
        [unreadCount],
    );

    const handleNotificationPress = useCallback(() => {
        bellScale.value = withSequence(
            withSpring(0.9, { damping: 8, stiffness: 400 }),
            withSpring(1, { damping: 6, stiffness: 200 }),
        );
        router.push('/notifications');
        refreshNotifications();
    }, [router, refreshNotifications]);

    const accessibilityLabel = useMemo(() => {
        if (unreadCount === 0) return 'Notificações - Nenhuma nova notificação';
        return `Notificações - ${unreadCount} ${unreadCount === 1 ? 'nova notificação' : 'novas notificações'}`;
    }, [unreadCount]);

    return (
        <View style={styles.container}>
            <AnimatedPressable
                hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
                onPress={handleNotificationPress}
                accessible
                accessibilityLabel={accessibilityLabel}
                accessibilityRole="button"
                accessibilityHint="Toque para ver suas notificações"
            >
                <View style={styles.bellContainer}>
                    <Animated.View style={bellAnimatedStyle}>
                        <Bell size={22} color={color} strokeWidth={2.2} />
                    </Animated.View>

                    {unreadCount > 0 && (
                        <Animated.View style={[styles.badge, badgeAnimatedStyle]}>
                            <RNText style={styles.badgeText} numberOfLines={1}>
                                {unreadCount > 9 ? '9+' : unreadCount}
                            </RNText>
                        </Animated.View>
                    )}
                </View>
            </AnimatedPressable>
        </View>
    );
});

const styles = StyleSheet.create({
    container: { position: 'relative' },
    bellContainer: { position: 'relative', padding: 6 },
    // Badge compacto e elegante: círculo pequeno com borda que "recorta" do fundo escuro.
    badge: {
        position: 'absolute',
        top: 1,
        right: 1,
        minWidth: 16,
        height: 16,
        borderRadius: 8,
        paddingHorizontal: 4,
        backgroundColor: SHEET.brand,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1.5,
        borderColor: SHEET.bgDeep,
    },
    badgeText: {
        color: '#FFFFFF',
        fontSize: 9.5,
        fontWeight: '800',
        lineHeight: 12,
        includeFontPadding: false,
        textAlign: 'center',
    },
});
