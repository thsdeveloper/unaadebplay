import React, { useEffect, useState, useCallback } from 'react';
import { StyleSheet, FlatList, RefreshControl, AppState, AppStateStatus } from 'react-native';
import { useNotifications } from '@/contexts/NotificationContext';
import { Box } from '@/components/ui/box';
import { Text } from '@/components/ui/text';
import { Stack, useFocusEffect } from 'expo-router';
import colors from '@/constants/colors';
import { NotificationItem } from '@/components/NotificationItem';
import LottieView from 'lottie-react-native';
import {Button} from "@/components/ui/button";
import {Spinner} from "@/components/ui/spinner";

export default function NotificationsScreen() {
    const {
        notifications,
        refreshNotifications,
        markAsRead,
        markAllAsRead,
        unreadCount,
        isLoading
    } = useNotifications();

    const [refreshing, setRefreshing] = useState(false);
    const [appState, setAppState] = useState<AppStateStatus>(AppState.currentState);

    // Atualiza as notificações quando a tela recebe foco
    useFocusEffect(
        useCallback(() => {
            console.log('Tela de notificações recebeu foco - atualizando notificações');
            refreshNotifications();

            return () => {
                // Cleanup se necessário
            };
        }, [])
    );

    // Monitora mudanças no estado do aplicativo
    useEffect(() => {
        const subscription = AppState.addEventListener('change', nextAppState => {
            console.log('App state changed in notification screen:', nextAppState);
            if (
                appState.match(/inactive|background/) &&
                nextAppState === 'active'
            ) {
                console.log('App voltou para o primeiro plano na tela de notificações - atualizando');
                refreshNotifications();
            }
            setAppState(nextAppState);
        });

        return () => {
            subscription.remove();
        };
    }, [appState]);

    const onRefresh = async () => {
        setRefreshing(true);
        await refreshNotifications();
        setRefreshing(false);
    };

    const handleReadNotification = async (id: string) => {
        await markAsRead(id);
        // Atualiza a lista após marcar como lida
        refreshNotifications();
    };

    const renderEmptyComponent = () => {
        if (isLoading) {
            return (
                <Box style={styles.loadingContainer}>
                    <Spinner size="large" color={colors.primary} />
                    <Text style={styles.loadingText}>Carregando notificações...</Text>
                </Box>
            );
        }

        return (
            <Box style={styles.emptyContainer}>
                {/* Componente de estado vazio - animação */}
                <Box style={styles.emptyImageContainer}>
                    <LottieView
                        source={require('@/assets/empty-notifications.json')}
                        autoPlay
                        loop
                        style={styles.emptyAnimation}
                    />
                </Box>
                <Text style={styles.emptyTitle}>Sem notificações</Text>
                <Text style={styles.emptyText}>
                    Você não tem nenhuma notificação no momento. Novas atividades aparecerão aqui.
                </Text>
                <Button
                    onPress={refreshNotifications}
                    style={styles.refreshButton}
                    size="md"
                >
                    <Text style={styles.refreshButtonText}>Atualizar</Text>
                </Button>
            </Box>
        );
    };

    const handleMarkAllAsRead = async () => {
        await markAllAsRead();
        // Atualiza a lista após marcar todas como lidas
        refreshNotifications();
    };

    return (
        <>
            <Stack.Screen
                options={{
                    title: 'Notificações',
                    headerStyle: {
                        backgroundColor: colors.primary,
                    },
                    headerTintColor: colors.white,
                    headerRight: () => (
                        unreadCount > 0 ? (
                            <Button
                                size="sm"
                                variant="link"
                                onPress={handleMarkAllAsRead}
                                style={styles.markAllButton}
                            >
                                <Text style={styles.markAllText}>Marcar todas como lidas</Text>
                            </Button>
                        ) : null
                    ),
                }}
            />

            <Box style={styles.container}>
                <FlatList
                    data={notifications}
                    keyExtractor={(item) => item.id}
                    renderItem={({ item }) => (
                        <NotificationItem
                            notification={item}
                            onPress={handleReadNotification}
                        />
                    )}
                    contentContainerStyle={[
                        styles.listContent,
                        notifications.length === 0 && styles.emptyListContent
                    ]}
                    ListEmptyComponent={renderEmptyComponent}
                    refreshControl={
                        <RefreshControl
                            refreshing={refreshing}
                            onRefresh={onRefresh}
                            colors={[colors.primary]}
                            tintColor={colors.primary}
                        />
                    }
                />
            </Box>
        </>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f5f5f5',
    },
    listContent: {
        padding: 16,
        flexGrow: 1,
    },
    emptyListContent: {
        flex: 1,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingTop: 100,
    },
    loadingText: {
        marginTop: 16,
        fontSize: 16,
        color: '#666',
    },
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 32,
        paddingTop: 100,
    },
    emptyImageContainer: {
        marginBottom: 20,
    },
    emptyAnimation: {
        width: 200,
        height: 200,
    },
    emptyTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 8,
    },
    emptyText: {
        fontSize: 16,
        color: '#666',
        textAlign: 'center',
        marginBottom: 24,
        lineHeight: 22,
    },
    refreshButton: {
        backgroundColor: colors.primary,
        borderRadius: 8,
        paddingHorizontal: 24,
    },
    refreshButtonText: {
        color: '#fff',
        fontWeight: '600',
    },
    markAllButton: {
        marginRight: 8,
    },
    markAllText: {
        color: colors.white,
        fontSize: 14,
    },
});
