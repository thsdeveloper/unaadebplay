import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import Constants from 'expo-constants';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { readItems, createItem, updateItem, deleteItem, readMe } from '@directus/sdk';

import { directusClient } from './api';

// Função de debug temporária
export async function debugNotifications(userId: string) {
    try {
        console.log('=== DEBUG NOTIFICAÇÕES ===');
        console.log('UserId fornecido:', userId);
        
        // Teste 0: Verificar se está autenticado
        try {
            const me = await directusClient.request(readMe());
            console.log('Usuário autenticado:', me?.id, me?.email);
        } catch (authError) {
            console.error('Erro de autenticação:', authError);
        }
        
        // Teste 1: Buscar sem nenhum filtro
        const allData = await directusClient.request(
            readItems('notifications' as any, {
                limit: 10
            })
        );
        console.log('Todas as notificações (sem filtro):', allData?.length || 0);
        if (allData?.length > 0) {
            console.log('Primeira notificação (sem filtro):', {
                id: allData[0].id,
                user_id: allData[0].user_id,
                title: allData[0].title,
                campos: Object.keys(allData[0])
            });
        }
        
        // Teste 2: Buscar apenas pelo user_id
        const userNotifications = await directusClient.request(
            readItems('notifications' as any, {
                filter: {
                    user_id: { _eq: userId }
                },
                limit: 10
            })
        );
        console.log('Notificações do usuário:', userNotifications?.length || 0);
        
        // Teste 3: Verificar estrutura da primeira notificação
        if (userNotifications?.length > 0) {
            console.log('Estrutura da notificação:', Object.keys(userNotifications[0]));
            console.log('Primeira notificação completa:', userNotifications[0]);
        }
        
        // Teste 4: Tentar diferentes formas de filtro
        try {
            const altFilter = await directusClient.request(
                readItems('notifications' as any, {
                    filter: {
                        _and: [
                            { user_id: { _eq: userId } }
                        ]
                    },
                    limit: 5
                })
            );
            console.log('Filtro alternativo:', altFilter?.length || 0);
        } catch (filterError) {
            console.error('Erro no filtro alternativo:', filterError);
        }
        
        console.log('=== FIM DEBUG ===');
    } catch (error) {
        console.error('Erro no debug:', error);
        console.error('Stack:', error.stack);
    }
}

// Configure as notificações
Notifications.setNotificationHandler({
    handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: true,
        shouldSetBadge: true,
        shouldShowBanner: true,
        shouldShowList: true,
    }),
});

// Tipos
export type PushNotificationToken = string | undefined;

export interface NotificationData {
    id: string;
    title: string;
    body: string;
    data?: Record<string, any>;
    read: boolean;
    created_at: string;
}

// Interface para criação de notificação em massa
export interface BulkNotificationData {
    title: string;
    message: string;
    data?: Record<string, any>;
    target_type: 'all' | 'users' | 'groups';
    target_users?: string[];
    target_groups?: string[];
}

// Interface para notificação no Directus
interface DirectusNotification {
    id: string;
    status: string;
    title: string;
    message: string;
    data?: Record<string, any>;
    user_id: string;
    created_at: string;
    read: boolean;
}

// Registrar dispositivo para push notifications
export async function registerForPushNotifications(): Promise<PushNotificationToken> {
    if (!Device.isDevice) {
        console.log('Push notifications não funcionam em emuladores');
        return undefined;
    }

    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
    }

    if (finalStatus !== 'granted') {
        console.log('Permissão para notificações não concedida!');
        return undefined;
    }

    try {
        const tokenData = await Notifications.getExpoPushTokenAsync({
            projectId: Constants.expoConfig?.extra?.eas?.projectId,
        });

        // Configurações específicas da plataforma
        if (Platform.OS === 'android') {
            await Notifications.setNotificationChannelAsync('default', {
                name: 'default',
                importance: Notifications.AndroidImportance.MAX,
                vibrationPattern: [0, 250, 250, 250],
                lightColor: '#FF231F7C',
                showBadge: true,
            });
        }

        await AsyncStorage.setItem('pushNotificationToken', tokenData.data);
        return tokenData.data;
    } catch (error) {
        console.error('Erro ao obter token push:', error);
        return undefined;
    }
}

// Enviar token para o servidor com verificação duplicada
export async function sendTokenToServer(token: string, userId: string): Promise<void> {
    try {
        console.log(`Registrando token para usuário ${userId}`);

        // Verificar se já existe
        const existingTokens = await directusClient.request(
            readItems('device_tokens', {
                filter: {
                    user_id: { _eq: userId },
                    token: { _eq: token }
                }
            })
        );

        if (existingTokens.length > 0) {
            console.log('Token já registrado');

            // Atualizar timestamp do token existente
            await directusClient.request(
                updateItem('device_tokens', existingTokens[0].id, {
                    updated_at: new Date().toISOString(),
                    status: true
                })
            );
            return;
        }

        // Criar novo token
        await directusClient.request(
            createItem('device_tokens', {
                user_id: userId,
                token: token,
                platform: Platform.OS,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
                status: true
            })
        );

        console.log('Token registrado com sucesso!');
    } catch (error) {
        console.error('Erro ao enviar token:', error);
        throw error;
    }
}

// Remover token do servidor (útil no logout)
export async function removeTokenFromServer(userId: string): Promise<void> {
    try {
        const tokens = await directusClient.request(
            readItems('device_tokens', {
                filter: {
                    user_id: { _eq: userId }
                }
            })
        );

        // Desativar todos os tokens do usuário
        for (const token of tokens) {
            await directusClient.request(
                updateItem('device_tokens', token.id, {
                    status: false,
                    updated_at: new Date().toISOString()
                })
            );
        }

        console.log('Tokens removidos com sucesso');
    } catch (error) {
        console.error('Erro ao remover tokens:', error);
    }
}

// Buscar notificações do usuário
export async function fetchNotifications(userId: string, limit = 50): Promise<NotificationData[]> {
    try {
        // Buscar notificações do usuário
        console.log('[fetchNotifications] Buscando notificações para userId:', userId);
        
        const notifications = await directusClient.request(
            readItems('notifications' as any, {
                filter: {
                    user_id: { _eq: userId }
                },
                sort: ['-created_at'],
                limit
            })
        );
        
        console.log('[fetchNotifications] Notificações encontradas:', notifications.length);
        
        // Debug: ver estrutura da primeira notificação
        if (notifications.length > 0) {
            console.log('[fetchNotifications] Primeira notificação:', {
                id: notifications[0].id,
                user_id: notifications[0].user_id,
                status: notifications[0].status,
                deleted_at: notifications[0].deleted_at,
                campos: Object.keys(notifications[0])
            });
        }
        
        // Filtrar notificações deletadas no cliente
        const activeNotifications = notifications.filter(n => {
            // Se não tem campo status ou status é true, mostrar
            const shouldShow = n.status !== false;
            if (!shouldShow) {
                console.log('[fetchNotifications] Notificação filtrada (deletada):', n.id);
            }
            return shouldShow;
        });
        
        console.log('[fetchNotifications] Notificações ativas:', activeNotifications.length);

        // Mapear notificações verificando se os campos existem
        return activeNotifications.map(notification => ({
            id: notification.id,
            title: notification.title || 'Sem título',
            body: notification.message || notification.body || 'Sem mensagem',
            data: notification.data || {},
            read: notification.read || false,
            created_at: notification.created_at || new Date().toISOString(),
        }));
    } catch (error) {
        console.error('Erro ao buscar notificações:', error);
        return [];
    }
}

// Marcar notificação como lida
export async function markNotificationAsRead(notificationId: string): Promise<void> {
    try {
        await directusClient.request(
            updateItem('notifications' as any, notificationId, {
                read: true,
                read_at: new Date().toISOString()
            })
        );
    } catch (error) {
        console.error('Erro ao marcar notificação como lida:', error);
        throw error;
    }
}

// Marcar todas notificações como lidas
export async function markAllNotificationsAsRead(userId: string): Promise<void> {
    try {
        const unreadNotifications = await directusClient.request(
            readItems('notifications' as any, {
                filter: {
                    user_id: { _eq: userId },
                    read: { _eq: false },
                    status: { _eq: true }
                }
            })
        );

        // Usar Promise.all para melhor performance
        const updatePromises = unreadNotifications.map(notification =>
            directusClient.request(
                updateItem('notifications' as any, notification.id, {
                    read: true,
                    read_at: new Date().toISOString()
                })
            )
        );

        await Promise.all(updatePromises);
    } catch (error) {
        console.error('Erro ao marcar todas notificações como lidas:', error);
        throw error;
    }
}

// Deletar notificação
export async function deleteNotification(notificationId: string): Promise<void> {
    try {
        // Soft delete - marcar como inativo
        await directusClient.request(
            updateItem('notifications' as any, notificationId, {
                status: false,
                deleted_at: new Date().toISOString()
            })
        );
    } catch (error) {
        console.error('Erro ao deletar notificação:', error);
        throw error;
    }
}

// Nova função: Criar notificação em massa
export async function createBulkNotification(data: BulkNotificationData): Promise<void> {
    try {
        let targetUsers: string[] = [];

        switch (data.target_type) {
            case 'all':
                // Buscar todos os usuários ativos
                const allUsers = await directusClient.request(
                    readItems('directus_users', {
                        filter: { status: { _eq: 'active' } },
                        fields: ['id']
                    })
                );
                targetUsers = allUsers.map(user => user.id);
                break;

            case 'users':
                targetUsers = data.target_users || [];
                break;

            case 'groups':
                // Buscar usuários dos grupos especificados
                if (data.target_groups && data.target_groups.length > 0) {
                    const groupUsers = await directusClient.request(
                        readItems('directus_users', {
                            filter: {
                                role: { _in: data.target_groups },
                                status: { _eq: 'active' }
                            },
                            fields: ['id']
                        })
                    );
                    targetUsers = groupUsers.map(user => user.id);
                }
                break;
        }

        if (targetUsers.length === 0) {
            throw new Error('Nenhum usuário encontrado para enviar notificações');
        }

        // Criar notificações para cada usuário (em lotes para performance)
        const batchSize = 50;
        const batches = [];

        for (let i = 0; i < targetUsers.length; i += batchSize) {
            const batch = targetUsers.slice(i, i + batchSize);
            batches.push(batch);
        }

        for (const batch of batches) {
            const notificationPromises = batch.map(userId =>
                directusClient.request(
                    createItem('notifications' as any, {
                        user_id: userId,
                        title: data.title,
                        message: data.message,
                        data: data.data,
                        read: false,
                        status: true,
                        created_at: new Date().toISOString()
                    })
                )
            );

            await Promise.all(notificationPromises);
        }

        console.log(`Notificações criadas para ${targetUsers.length} usuários`);
    } catch (error) {
        console.error('Erro ao criar notificações em massa:', error);
        throw error;
    }
}

// Nova função: Buscar estatísticas de notificações
export async function getNotificationStats(userId: string) {
    try {
        const [total, unread, read] = await Promise.all([
            directusClient.request(
                readItems('notifications' as any, {
                    filter: {
                        user_id: { _eq: userId },
                        status: { _eq: true }
                    },
                    aggregate: { count: 'id' }
                })
            ),
            directusClient.request(
                readItems('notifications' as any, {
                    filter: {
                        user_id: { _eq: userId },
                        status: { _eq: true },
                        read: { _eq: false }
                    },
                    aggregate: { count: 'id' }
                })
            ),
            directusClient.request(
                readItems('notifications' as any, {
                    filter: {
                        user_id: { _eq: userId },
                        status: { _eq: true },
                        read: { _eq: true }
                    },
                    aggregate: { count: 'id' }
                })
            )
        ]);

        return {
            total: total[0]?.count || 0,
            unread: unread[0]?.count || 0,
            read: read[0]?.count || 0
        };
    } catch (error) {
        console.error('Erro ao buscar estatísticas:', error);
        return { total: 0, unread: 0, read: 0 };
    }
}

// Configurar listeners de notificação
export function setupNotificationListeners(
    onNotificationReceived?: (notification: Notifications.Notification) => void,
    onNotificationResponse?: (response: Notifications.NotificationResponse) => void
) {
    const notificationListener = Notifications.addNotificationReceivedListener(notification => {
        console.log('Notificação recebida:', notification);
        if (onNotificationReceived) {
            onNotificationReceived(notification);
        }
    });

    const responseListener = Notifications.addNotificationResponseReceivedListener(response => {
        console.log('Resposta à notificação:', response);
        if (onNotificationResponse) {
            onNotificationResponse(response);
        }
    });

    return () => {
        notificationListener.remove();
        responseListener.remove();
    };
}

// Enviar notificação local
export async function sendLocalNotification(
    title: string,
    body: string,
    data?: Record<string, any>,
    scheduledDate?: Date
): Promise<void> {
    try {
        await Notifications.scheduleNotificationAsync({
            content: {
                title,
                body,
                data: data || {},
                sound: true,
                priority: Notifications.AndroidNotificationPriority.HIGH,
            },
            trigger: scheduledDate ? { date: scheduledDate } : null,
        });
    } catch (error) {
        console.error('Erro ao enviar notificação local:', error);
        throw error;
    }
}

// Verificar se notificações estão habilitadas
export async function areNotificationsEnabled(): Promise<boolean> {
    try {
        const { status } = await Notifications.getPermissionsAsync();
        return status === 'granted';
    } catch (error) {
        console.error('Erro ao verificar permissões:', error);
        return false;
    }
}

// Limpar badge de notificações
export async function clearNotificationBadge(): Promise<void> {
    try {
        await Notifications.setBadgeCountAsync(0);
    } catch (error) {
        console.error('Erro ao limpar badge:', error);
    }
}

// Cancelar todas as notificações locais pendentes
export async function cancelAllScheduledNotifications(): Promise<void> {
    try {
        await Notifications.cancelAllScheduledNotificationsAsync();
    } catch (error) {
        console.error('Erro ao cancelar notificações:', error);
    }
}
