import React, { useEffect, useRef, memo, useCallback, useMemo } from 'react';
import { StyleSheet, Pressable } from 'react-native';
import { Feather } from "@expo/vector-icons";
import { Box } from "@/components/ui/box";
import { Text } from "@/components/ui/text";
import { useRouter } from 'expo-router';
import { useNotifications } from '@/contexts/NotificationContext';
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
    color = colors.white
}: NotificationBellProps) {
    const {
        unreadCount,
        refreshNotifications,
        isLoading,
        realtimeConnected
    } = useNotifications();

    const router = useRouter();

    // Animation values
    const bellScale = useSharedValue(1);
    const bellRotation = useSharedValue(0);
    const badgeScale = useSharedValue(1);
    const pulseScale = useSharedValue(1);

    // Referencias para controle de animações
    const prevUnreadCount = useRef(unreadCount);
    const animationTimeoutRef = useRef<NodeJS.Timeout>();
    const refreshIntervalRef = useRef<NodeJS.Timeout>();

    // Callback para cancelar animação de pulso
    const cancelPulseAnimation = useCallback(() => {
        'worklet';
        cancelAnimation(pulseScale);
        pulseScale.value = withTiming(1, { duration: 300 });
    }, []);

    // Animação quando unread count muda
    useEffect(() => {
        if (unreadCount === prevUnreadCount.current) return;

        if (unreadCount > prevUnreadCount.current) {
            // Nova notificação recebida - animação mais dramática
            bellScale.value = withSequence(
                withSpring(1.3, { damping: 3, stiffness: 400 }),
                withSpring(1, { damping: 8, stiffness: 200 })
            );

            bellRotation.value = withSequence(
                withTiming(-15, { duration: 100, easing: Easing.out(Easing.quad) }),
                withTiming(15, { duration: 100, easing: Easing.inOut(Easing.quad) }),
                withTiming(-10, { duration: 80, easing: Easing.inOut(Easing.quad) }),
                withTiming(0, { duration: 100, easing: Easing.out(Easing.quad) })
            );

            badgeScale.value = withSequence(
                withSpring(1.4, { damping: 2, stiffness: 300 }),
                withSpring(1, { damping: 4, stiffness: 200 })
            );

            // Efeito de pulso contínuo por alguns segundos
            pulseScale.value = withRepeat(
                withSequence(
                    withTiming(1.1, { duration: 800 }),
                    withTiming(1, { duration: 800 })
                ),
                3, // 3 repetições
                false
            );

            // Parar a animação de pulso após um tempo
            if (animationTimeoutRef.current) {
                clearTimeout(animationTimeoutRef.current);
            }

            animationTimeoutRef.current = setTimeout(() => {
                runOnJS(cancelPulseAnimation)();
            }, 5000);

        } else if (unreadCount < prevUnreadCount.current) {
            // Notificação lida - animação sutil
            badgeScale.value = withSequence(
                withSpring(0.8, { damping: 3, stiffness: 200 }),
                withSpring(1, { damping: 6, stiffness: 150 })
            );
        }

        prevUnreadCount.current = unreadCount;
    }, [unreadCount, cancelPulseAnimation]);


    // Função de refresh otimizada
    const refreshIfNeeded = useCallback(() => {
        if (!isLoading) {
            refreshNotifications();
        }
    }, [isLoading, refreshNotifications]);

    // Cálculo do intervalo de refresh memoizado
    const refreshInterval = useMemo(() => {
        if (!realtimeConnected) return 15000; // 15s se offline
        if (unreadCount > 0) return 45000; // 45s se há não lidas
        return 90000; // 90s se tudo ok
    }, [realtimeConnected, unreadCount]);

    // Refresh automático mais inteligente
    useEffect(() => {
        // Removido refresh automático ao montar para evitar loops
        // O NotificationContext já faz isso quando o usuário loga
        
        // Setup do intervalo para atualizações periódicas
        refreshIntervalRef.current = setInterval(refreshIfNeeded, refreshInterval);

        return () => {
            if (refreshIntervalRef.current) {
                clearInterval(refreshIntervalRef.current);
            }
            if (animationTimeoutRef.current) {
                clearTimeout(animationTimeoutRef.current);
            }
        };
    }, [refreshInterval, refreshIfNeeded]);

    // Estilos animados
    const bellAnimatedStyle = useAnimatedStyle(() => ({
        transform: [
            { scale: bellScale.value * pulseScale.value },
            { rotate: `${bellRotation.value}deg` }
        ]
    }), []);

    const badgeAnimatedStyle = useAnimatedStyle(() => {
        const scale = badgeScale.value;
        const opacity = unreadCount > 0 ? 1 : 0;

        return {
            transform: [{ scale }],
            opacity: withTiming(opacity, { duration: 200 })
        };
    }, [unreadCount]);

    // Callbacks memoizados
    const handleNotificationPress = useCallback(() => {
        // Pequena animação de feedback
        bellScale.value = withSequence(
            withSpring(0.9, { damping: 8, stiffness: 400 }),
            withSpring(1, { damping: 6, stiffness: 200 })
        );

        // Navegar imediatamente para melhor UX
        router.push('/notifications');

        // Refresh em background
        refreshNotifications();
    }, [router, refreshNotifications]);

    const bellIcon = useMemo(() => "bell", []);

    const accessibilityLabel = useMemo(() => {
        if (unreadCount === 0) {
            return "Notificações - Nenhuma nova notificação";
        }
        return `Notificações - ${unreadCount} ${unreadCount === 1 ? 'nova notificação' : 'novas notificações'}`;
    }, [unreadCount]);

    // Badge de contagem memoizado
    const Badge = useMemo(() => {
        if (unreadCount === 0) return null;

        return (
            <Animated.View style={[styles.badge, badgeAnimatedStyle]}>
                <Text style={styles.badgeText}>
                    {unreadCount > 99 ? '99+' : unreadCount}
                </Text>
            </Animated.View>
        );
    }, [unreadCount, badgeAnimatedStyle]);

    return (
        <Box style={styles.container}>
            <AnimatedPressable
                style={styles.pressable}
                hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
                onPress={handleNotificationPress}
                accessible={true}
                accessibilityLabel={accessibilityLabel}
                accessibilityRole="button"
                accessibilityHint="Toque para ver suas notificações"
            >
                <Box style={styles.bellContainer}>
                    <Animated.View style={bellAnimatedStyle}>
                        <Feather
                            name={bellIcon}
                            size={24}
                            color={color}
                        />
                    </Animated.View>

                    {Badge}
                </Box>
            </AnimatedPressable>
        </Box>
    );
});

const styles = StyleSheet.create({
    container: {
        position: 'relative',
    },
    pressable: {
        // Adicionar estilo para o pressable se necessário
    },
    bellContainer: {
        position: 'relative',
        padding: 8,
    },
    badge: {
        position: 'absolute',
        top: 2,
        right: 2,
        backgroundColor: colors.primary || '#FF3B30',
        borderRadius: 12,
        minWidth: 20,
        height: 20,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 6,
        borderWidth: 2,
        borderColor: 'rgba(255, 255, 255, 0.9)',
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 1,
        },
        shadowOpacity: 0.3,
        shadowRadius: 2,
        elevation: 3,
    },
    badgeText: {
        color: 'white',
        fontSize: 11,
        fontWeight: 'bold',
        lineHeight: 14,
    },
});
