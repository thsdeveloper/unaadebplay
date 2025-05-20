import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import Constants from 'expo-constants';
import {Platform} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {readItems, createItem, updateItem} from '@directus/sdk';

// Importar o cliente Directus já configurado
import {directusClient} from './api';

// Configure as notificações para como elas devem aparecer para o usuário
Notifications.setNotificationHandler({
    handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: true,
        shouldSetBadge: true,
    }),
});

// Tipo para o token de notificação push
export type PushNotificationToken = string | undefined;

// Interfaces para notificações
export interface NotificationData {
    id: string;
    title: string;
    body: string;
    data?: Record<string, any>;
    read: boolean;
    created_at: string;
}

// Directus schema para notificação
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

// Função para registrar o dispositivo para receber notificações push
export async function registerForPushNotifications(): Promise<PushNotificationToken> {
    if (!Device.isDevice) {
        console.log('Notificações push não funcionam em emuladores/simuladores');
        return undefined;
    }

    // Verificar permissões existentes
    const {status: existingStatus} = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    // Se não temos permissão ainda, solicitar ao usuário
    if (existingStatus !== 'granted') {
        const {status} = await Notifications.requestPermissionsAsync();
        finalStatus = status;
    }

    // Se o usuário não deu permissão, não podemos continuar
    if (finalStatus !== 'granted') {
        console.log('Permissão para notificações não concedida!');
        return undefined;
    }

    // Obter o token do Expo para este dispositivo
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
        });
    }

    // Salvar o token localmente para uso futuro
    await AsyncStorage.setItem('pushNotificationToken', tokenData.data);

    return tokenData.data;
}

// Enviar o token para o servidor Directus
// Adicione mais logs em sendTokenToServer:
export async function sendTokenToServer(token: string, userId: string): Promise<void> {
    try {
        console.log(`Tentando registrar token para usuário ${userId}: ${token}`);

        // Verificar collection existente
        try {
            const existingTokens = await directusClient.request(
                readItems('device_tokens', {
                    filter: {
                        user_id: {_eq: userId},
                        token: {_eq: token}
                    }
                })
            );
            console.log('Tokens existentes:', existingTokens);

            if (existingTokens.length > 0) {
                console.log('Token já registrado');
                return;
            }
        } catch (error) {
            console.error('Erro ao verificar tokens existentes:', error);
            // Continuar tentando registrar mesmo se houver erro na verificação
        }

        // Criar token
        try {
            const result = await directusClient.request(
                createItem('device_tokens', {
                    user_id: userId,
                    token: token,
                    platform: Platform.OS,
                    created_at: new Date().toISOString()
                })
            );
            console.log('Token registrado com sucesso:', result);
        } catch (createError) {
            console.error('Erro ao criar token:', createError);
            throw createError;
        }
    } catch (error) {
        console.error('Erro geral ao enviar token:', error);
    }
}

// Obter notificações do Directus para o usuário atual
export async function fetchNotifications(userId: string): Promise<NotificationData[]> {
    try {
        // Buscar notificações do usuário
        const notifications = await directusClient.request(
            readItems('notifications', {
                filter: {
                    user_id: {_eq: userId},
                    status: {_eq: true}
                },
                sort: ['-created_at']
            })
        );

        // Converter para o formato da aplicação
        return notifications.map(notification => ({
            id: notification.id,
            title: notification.title,
            body: notification.message,
            data: notification.data,
            read: notification.read,
            created_at: notification.created_at,
        }));
    } catch (error) {
        console.error('Erro ao buscar notificações:', error);
        return [];
    }
}

// Marcar uma notificação como lida
export async function markNotificationAsRead(notificationId: string): Promise<void> {
    try {
        await directusClient.request(
            updateItem('notifications', notificationId, {
                read: true
            })
        );
    } catch (error) {
        console.error('Erro ao marcar notificação como lida:', error);
        throw error;
    }
}

// Marcar todas notificações como lidas para um usuário
export async function markAllNotificationsAsRead(userId: string): Promise<void> {
    try {
        // Buscar todas as notificações não lidas do usuário
        const unreadNotifications = await directusClient.request(
            readItems('notifications', {
                filter: {
                    user_id: {_eq: userId},
                    read: {_eq: false}
                }
            })
        );

        // Atualizar cada notificação para marcá-la como lida
        for (const notification of unreadNotifications) {
            await directusClient.request(
                updateItem('notifications', notification.id, {
                    read: true
                })
            );
        }
    } catch (error) {
        console.error('Erro ao marcar todas notificações como lidas:', error);
        throw error;
    }
}

// Configurar os listeners de notificação
export function setupNotificationListeners(
    onNotificationReceived?: (notification: Notifications.Notification) => void,
    onNotificationResponse?: (response: Notifications.NotificationResponse) => void
) {
    // Listener para quando uma notificação é recebida enquanto o app está em primeiro plano
    const notificationListener = Notifications.addNotificationReceivedListener(notification => {
        if (onNotificationReceived) {
            onNotificationReceived(notification);
        }
    });

    // Listener para quando o usuário toca em uma notificação
    const responseListener = Notifications.addNotificationResponseReceivedListener(response => {
        if (onNotificationResponse) {
            onNotificationResponse(response);
        }
    });

    // Retornar função que remove corretamente os listeners
    return () => {
        notificationListener.remove();
        responseListener.remove();
    };
}

// Enviar uma notificação local (útil para testes ou notificações que não vêm do servidor)
export async function sendLocalNotification(
    title: string,
    body: string,
    data?: Record<string, any>
): Promise<void> {
    await Notifications.scheduleNotificationAsync({
        content: {
            title,
            body,
            data: data || {},
        },
        trigger: null, // null significa enviar imediatamente
    });
}

// Função utilitária para checar se o usuário habilitou notificações
export async function areNotificationsEnabled(): Promise<boolean> {
    try {
        const {status} = await Notifications.getPermissionsAsync();
        console.log('Status atual das permissões:', status);
        return status === 'granted';
    } catch (error) {
        console.error('Erro ao verificar permissões:', error);
        return false;
    }
}
