import React, { useEffect, useState } from 'react';
import { StyleSheet, Pressable, Animated, Platform, Dimensions } from 'react-native';
import { BlurView } from 'expo-blur';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useNotifications } from '@/contexts/NotificationContext';
import {Box} from "@/components/ui/box";
import {HStack} from "@/components/ui/hstack";
import {Avatar, AvatarFallbackText} from "@/components/ui/avatar";
import {VStack} from "@/components/ui/vstack";
import {Text} from "@/components/ui/text";

const { width } = Dimensions.get('window');

interface NotificationToastProps {
    autoHideDuration?: number;
}

export function NotificationToast({ autoHideDuration = 5000 }: NotificationToastProps) {
    const { lastNotification, markAsRead } = useNotifications();
    const [visible, setVisible] = useState(false);
    const [currentNotification, setCurrentNotification] = useState<any>(null);

    // Animações
    const translateY = new Animated.Value(-100);
    const opacity = new Animated.Value(0);

    // Mostrar o toast com animação
    const showToast = () => {
        setVisible(true);
        Animated.parallel([
            Animated.timing(translateY, {
                toValue: 0,
                duration: 300,
                useNativeDriver: true,
            }),
            Animated.timing(opacity, {
                toValue: 1,
                duration: 300,
                useNativeDriver: true,
            }),
        ]).start();

        // Auto-esconder após o tempo definido
        if (autoHideDuration > 0) {
            setTimeout(hideToast, autoHideDuration);
        }
    };

    // Esconder o toast com animação
    const hideToast = () => {
        Animated.parallel([
            Animated.timing(translateY, {
                toValue: -100,
                duration: 300,
                useNativeDriver: true,
            }),
            Animated.timing(opacity, {
                toValue: 0,
                duration: 300,
                useNativeDriver: true,
            }),
        ]).start(() => {
            setVisible(false);
        });
    };

    // Lidar com clique na notificação
    const handlePress = () => {
        hideToast();

        // Extrair dados da notificação
        if (currentNotification) {
            const { data } = currentNotification.request.content;

            // Marcar como lida se tiver ID
            if (data && data.id) {
                markAsRead(data.id);
            }

            // Navegar para a rota especificada
            if (data && data.route) {
                router.push(data.route);
            }
        }
    };

    // Atualizar quando receber nova notificação
    useEffect(() => {
        if (lastNotification) {
            setCurrentNotification(lastNotification);
            showToast();
        }
    }, [lastNotification]);

    // Se não estiver visível, não renderizar nada
    if (!visible || !currentNotification) {
        return null;
    }

    // Extrair dados da notificação para exibição
    const { title, body } = currentNotification.request.content;

    return (
        <Animated.View
            style={[
                styles.container,
                {
                    transform: [{ translateY }],
                    opacity,
                },
            ]}
        >
            <Pressable onPress={handlePress}>
                <Box
                    style={styles.toastContent}
                    borderRadius="$lg"
                    overflow="hidden"
                >
                    {Platform.OS !== 'web' ? (
                        <BlurView
                            intensity={90}
                            tint="light"
                            style={StyleSheet.absoluteFill}
                        />
                    ) : null}

                    <HStack space="md" alignItems="center">
                        <Box
                            height={50}
                            width={50}
                            borderRadius={25}
                            justifyContent="center"
                            alignItems="center"
                            backgroundColor="$blue100"
                        >
                            <Avatar size="md" bgColor="$blue600">
                                <AvatarFallbackText>N</AvatarFallbackText>
                            </Avatar>
                        </Box>

                        <VStack flex={1}>
                            <HStack justifyContent="space-between" alignItems="center">
                                <Text style={styles.title} numberOfLines={1}>
                                    {title}
                                </Text>
                                <Pressable onPress={hideToast} hitSlop={10}>
                                    <Ionicons name="close" size={20} color="#999" />
                                </Pressable>
                            </HStack>

                            <Text style={styles.body} numberOfLines={2}>
                                {body}
                            </Text>
                        </VStack>
                    </HStack>
                </Box>
            </Pressable>
        </Animated.View>
    );
}

const styles = StyleSheet.create({
    container: {
        position: 'absolute',
        top: Platform.OS === 'ios' ? 50 : 20,
        left: 0,
        right: 0,
        zIndex: 9999,
        paddingHorizontal: 16,
        alignItems: 'center',
    },
    toastContent: {
        width: width - 32,
        padding: 16,
        backgroundColor: 'rgba(255, 255, 255, 0.9)',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 5,
    },
    title: {
        fontSize: 16,
        fontWeight: '600',
        color: '#333',
        flex: 1,
        marginRight: 8,
    },
    body: {
        fontSize: 14,
        color: '#666',
        marginTop: 4,
    },
});
