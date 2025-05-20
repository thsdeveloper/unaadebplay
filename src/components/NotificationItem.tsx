import React, { memo } from 'react';
import { StyleSheet, View } from 'react-native';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Box } from "@/components/ui/box";
import { Text } from "@/components/ui/text";
import colors from '@/constants/colors';
import { NotificationData } from '@/services/notification';
import {Pressable} from "@/components/ui/pressable";

interface NotificationItemProps {
    notification: NotificationData;
    onPress: (id: string) => void;
}

// Usando memo para evitar renderizações desnecessárias
export const NotificationItem = memo(({ notification, onPress }: NotificationItemProps) => {
    const formatDate = (dateString: string) => {
        try {
            return formatDistanceToNow(new Date(dateString), {
                addSuffix: true,
                locale: ptBR
            });
        } catch (error) {
            return '';
        }
    };

    return (
        <Pressable
            onPress={() => onPress(notification.id)}
            style={({pressed}) => [
                styles.container,
                !notification.read && styles.unreadItem,
                pressed && styles.pressedItem
            ]}
        >
            <Box style={styles.contentContainer}>
                <Box style={styles.iconContainer}>
                    <View style={[styles.iconCircle, !notification.read && styles.unreadIconCircle]}>
                        <Text style={styles.iconText}>
                            {notification.title.charAt(0).toUpperCase()}
                        </Text>
                    </View>
                </Box>

                <Box style={styles.content}>
                    <Text style={[styles.title, !notification.read && styles.unreadTitle]}>
                        {notification.title}
                    </Text>
                    <Text style={styles.body} numberOfLines={2}>
                        {notification.body}
                    </Text>
                    <Text style={styles.time}>
                        {formatDate(notification.created_at)}
                    </Text>
                </Box>

                {!notification.read && <View style={styles.unreadDot} />}
            </Box>
        </Pressable>
    );
}, (prevProps, nextProps) => {
    // Evita re-renderização se a notificação não mudou
    return (
        prevProps.notification.id === nextProps.notification.id &&
        prevProps.notification.read === nextProps.notification.read
    );
});

const styles = StyleSheet.create({
    container: {
        backgroundColor: '#fff',
        borderRadius: 12,
        marginBottom: 8,
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 1,
        },
        shadowOpacity: 0.12,
        shadowRadius: 2.22,
        elevation: 2,
    },
    contentContainer: {
        flexDirection: 'row',
        padding: 16,
    },
    unreadItem: {
        backgroundColor: 'rgba(240, 248, 255, 0.8)',
    },
    pressedItem: {
        opacity: 0.8,
    },
    iconContainer: {
        marginRight: 12,
    },
    iconCircle: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#e0e0e0',
        justifyContent: 'center',
        alignItems: 'center',
    },
    unreadIconCircle: {
        backgroundColor: colors.primary,
    },
    iconText: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#fff',
    },
    content: {
        flex: 1,
    },
    title: {
        fontSize: 16,
        color: '#333',
        marginBottom: 4,
    },
    unreadTitle: {
        fontWeight: 'bold',
    },
    body: {
        fontSize: 14,
        color: '#666',
        marginBottom: 8,
        lineHeight: 20,
    },
    time: {
        fontSize: 12,
        color: '#999',
    },
    unreadDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: colors.primary,
        alignSelf: 'center',
        marginLeft: 8,
    },
});
