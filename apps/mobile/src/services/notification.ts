import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import Constants from 'expo-constants';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { api } from './apiClient';

// Configura o handler global de apresentação das notificações.
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

/**
 * Erros esperados quando o build NÃO pode registrar push remoto — sobretudo iOS assinado
 * com time Apple GRATUITO, que não pode carregar o entitlement "aps-environment". Nesses
 * casos getExpoPushTokenAsync lança "no valid 'aps-environment' entitlement…". Não é bug do
 * app: degradamos em silêncio (o app segue com a lista in-app). Quando for assinado por uma
 * conta Apple PAGA com o entitlement, a mesma chamada passa a funcionar sem alterar código.
 */
function isPushUnavailableError(error: unknown): boolean {
    const msg = (error instanceof Error ? error.message : String(error)).toLowerCase();
    return msg.includes('aps-environment') || msg.includes('entitlement') || msg.includes('remote notifications');
}

/** Falhas de rede TRANSITÓRIAS (blip de Wi-Fi/5G/túnel) — não são bugs; o app mantém o cache. */
export function isTransientNetworkError(error: unknown): boolean {
    const msg = (error instanceof Error ? error.message : String(error)).toLowerCase();
    return /network|fetch failed|connection was lost|timed out|timeout|aborted|failed to fetch|econn/.test(msg);
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
        // Build sem suporte a push remoto (ex.: time Apple gratuito, sem "aps-environment").
        // Degrada em silêncio — warn (não console.error → sem tela de erro vermelha no dev).
        if (isPushUnavailableError(error)) {
            console.warn(
                '[push] Push remoto indisponível neste build (falta o entitlement "aps-environment" — ' +
                'requer conta Apple paga). O app segue com as notificações in-app.',
            );
            return undefined;
        }
        console.error('Erro ao obter token push:', error);
        return undefined;
    }
}

// Enviar token para o servidor com verificação duplicada
export async function sendTokenToServer(token: string, userId: string): Promise<void> {
    try {
        // Verificar se já existe (via API — a RLS escopa ao próprio usuário)
        const existing = (await api
            .resource<{ id: string }>('device_tokens')
            .list({ filter: { user_id: { _eq: userId }, token: { _eq: token } }, limit: 1 })).data;

        if (existing.length > 0) {
            await api.resource('device_tokens').update(existing[0].id, { status: true });
            return;
        }

        // Criar novo token
        await api.resource('device_tokens').create({
            user_id: userId,
            token,
            platform: Platform.OS,
            status: true,
        });
    } catch (error) {
        console.error('Erro ao enviar token:', error);
        throw error;
    }
}

// Remover token do servidor (útil no logout)
export async function removeTokenFromServer(userId: string): Promise<void> {
    try {
        // Desativar todos os tokens do usuário (via API — RLS escopa ao próprio usuário)
        const tokens = (await api
            .resource<{ id: string }>('device_tokens')
            .list({ filter: { user_id: { _eq: userId }, status: { _eq: true } }, limit: 100 })).data;
        await Promise.all(tokens.map((tk) => api.resource('device_tokens').update(tk.id, { status: false })));
    } catch (error) {
        console.error('Erro ao remover tokens:', error);
    }
}

// Buscar notificações do usuário
export async function fetchNotifications(userId: string, limit = 50): Promise<NotificationData[]> {
    // Deixa o erro PROPAGAR — o contexto decide (mantém a lista/cai no cache) sem limpar a UI.
    const res = await api.resource<any>('notifications').list({
        filter: { user_id: { _eq: userId }, status: { _neq: false } }, // status=false => soft-deleted
        sort: '-created_at',
        limit,
    });
    return res.data.map((notification: any) => ({
        id: notification.id,
        title: notification.title || 'Sem título',
        body: notification.body || 'Sem mensagem',
        data: notification.data || {},
        read: notification.read || false,
        created_at: notification.created_at || new Date().toISOString(),
    }));
}

// Marcar notificação como lida
export async function markNotificationAsRead(notificationId: string): Promise<void> {
    try {
        await api.resource('notifications').update(notificationId, { read: true, read_at: new Date().toISOString() });
    } catch (error) {
        console.error('Erro ao marcar notificação como lida:', error);
        throw error;
    }
}

// Marcar todas notificações como lidas
export async function markAllNotificationsAsRead(userId: string): Promise<void> {
    try {
        const unread = (await api.resource<{ id: string }>('notifications').list({
            filter: { user_id: { _eq: userId }, read: { _eq: false }, status: { _neq: false } },
            limit: 500,
        })).data;
        await Promise.all(
            unread.map((n) => api.resource('notifications').update(n.id, { read: true, read_at: new Date().toISOString() })),
        );
    } catch (error) {
        console.error('Erro ao marcar todas notificações como lidas:', error);
        throw error;
    }
}

// Deletar notificação
export async function deleteNotification(notificationId: string): Promise<void> {
    try {
        // Soft delete - marcar como inativo (via API)
        await api.resource('notifications').update(notificationId, { status: false, deleted_at: new Date().toISOString() });
    } catch (error) {
        console.error('Erro ao deletar notificação:', error);
        throw error;
    }
}

// Configurar listeners de notificação (recebida em foreground + resposta ao tocar).
export function setupNotificationListeners(
    onNotificationReceived?: (notification: Notifications.Notification) => void,
    onNotificationResponse?: (response: Notifications.NotificationResponse) => void,
) {
    const received = Notifications.addNotificationReceivedListener((n) => onNotificationReceived?.(n));
    const response = Notifications.addNotificationResponseReceivedListener((r) => onNotificationResponse?.(r));
    return () => {
        received.remove();
        response.remove();
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
            trigger: scheduledDate ? { type: Notifications.SchedulableTriggerInputTypes.DATE, date: scheduledDate } : null,
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
