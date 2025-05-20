import React, { useEffect, useRef } from 'react';
import { TouchableOpacity, StyleSheet } from 'react-native';
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
    withTiming
} from 'react-native-reanimated';

interface NotificationBellProps {
    color?: string;
}

export function NotificationBell({ color = colors.white }: NotificationBellProps) {
    const { unreadCount, refreshNotifications, isLoading } = useNotifications();
    const router = useRouter();

    // Animation values
    const scale = useSharedValue(1);
    const rotation = useSharedValue(0);
    const prevUnreadCount = useRef(unreadCount);

    // Animate when unread count changes
    useEffect(() => {
        if (unreadCount > prevUnreadCount.current) {
            // Bell shake animation
            scale.value = withSequence(
                withSpring(1.2, { damping: 2 }),
                withSpring(1, { damping: 3 })
            );

            rotation.value = withSequence(
                withTiming(-0.1, { duration: 100 }),
                withTiming(0.1, { duration: 100 }),
                withTiming(-0.1, { duration: 100 }),
                withTiming(0, { duration: 100 })
            );
        }

        prevUnreadCount.current = unreadCount;
    }, [unreadCount]);

    // Refresh notifications on component mount
    useEffect(() => {
        // Força uma atualização imediata quando o componente é montado
        refreshNotifications();

        // Set up interval to refresh notifications periodically (com intervalo menor)
        const intervalId = setInterval(() => {
            // Não atualiza se já estiver carregando para evitar requisições múltiplas
            if (!isLoading) {
                refreshNotifications();
            }
        }, 30000); // Reduzido para 30 segundos para maior responsividade

        return () => clearInterval(intervalId);
    }, []);

    const animatedStyle = useAnimatedStyle(() => {
        return {
            transform: [
                { scale: scale.value },
                { rotate: `${rotation.value}rad` }
            ]
        };
    });

    const handleNotificationPress = () => {
        // Atualizar as notificações antes de navegar para garantir dados atualizados
        refreshNotifications().then(() => {
            router.push('/notifications');
        });
    };

    return (
        <Box>
            <TouchableOpacity
                activeOpacity={0.7}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                onPress={handleNotificationPress}
            >
                <Box style={styles.container}>
                    <Animated.View style={animatedStyle}>
                        {isLoading ? (
                            // Indicador de carregamento animado sutil quando estiver atualizando
                            <Feather name="bell" size={22} color={color} style={{opacity: 0.7}} />
                        ) : (
                            <Feather name="bell" size={22} color={color} />
                        )}
                    </Animated.View>

                    {unreadCount > 0 && (
                        <Box style={styles.badge}>
                            <Text style={styles.badgeText}>
                                {unreadCount > 99 ? '99+' : unreadCount}
                            </Text>
                        </Box>
                    )}
                </Box>
            </TouchableOpacity>
        </Box>
    );
}

const styles = StyleSheet.create({
    container: {
        position: 'relative',
        padding: 5,
    },
    badge: {
        position: 'absolute',
        top: -5,
        right: -5,
        backgroundColor: colors.danger || '#FF3B30',
        borderRadius: 10,
        minWidth: 18,
        height: 18,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 4,
        borderWidth: 1.5,
        borderColor: 'rgba(255, 255, 255, 0.8)',
    },
    badgeText: {
        color: 'white',
        fontSize: 10,
        fontWeight: 'bold',
    }
});
