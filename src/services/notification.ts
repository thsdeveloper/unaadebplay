import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import Constants from 'expo-constants';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase } from './supabase';

// Função de debug temporária
export async function debugNotifications(userId: string) {
    try {
        const { data, error } = await supabase
            .from('notifications')
            .select('id,user_id,title,status,deleted_at')
            .eq('user_id', userId)
            .limit(10);
        console.log('[debugNotifications]', error ? error.message : `${data?.length ?? 0} notificações`);
    } catch (error) {
        console.error('Erro no debug:', error);
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
        const { data: existingTokens } = await supabase
            .from('device_tokens')
            .select('id')
            .eq('user_id', userId)
            .eq('token', token);

        if (existingTokens && existingTokens.length > 0) {
            await supabase
                .from('device_tokens')
                .update({ updated_at: new Date().toISOString(), status: true })
                .eq('id', existingTokens[0].id);
            return;
        }

        // Criar novo token
        await supabase.from('device_tokens').insert({
            user_id: userId,
            token,
            platform: Platform.OS,
            status: true,
        });

        console.log('Token registrado com sucesso!');
    } catch (error) {
        console.error('Erro ao enviar token:', error);
        throw error;
    }
}

// Remover token do servidor (útil no logout)
export async function removeTokenFromServer(userId: string): Promise<void> {
    try {
        // Desativar todos os tokens do usuário numa única query
        await supabase
            .from('device_tokens')
            .update({ status: false, updated_at: new Date().toISOString() })
            .eq('user_id', userId);

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
        
        const { data: notifications, error } = await supabase
            .from('notifications')
            .select('*')
            .eq('user_id', userId)
            .neq('status', false) // status=false => soft-deleted
            .order('created_at', { ascending: false })
            .limit(limit);

        if (error) throw error;

        return (notifications ?? []).map((notification: any) => ({
            id: notification.id,
            title: notification.title || 'Sem título',
            body: notification.body || 'Sem mensagem',
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
        const { error } = await supabase
            .from('notifications')
            .update({ read: true, read_at: new Date().toISOString() })
            .eq('id', notificationId);
        if (error) throw error;
    } catch (error) {
        console.error('Erro ao marcar notificação como lida:', error);
        throw error;
    }
}

// Marcar todas notificações como lidas
export async function markAllNotificationsAsRead(userId: string): Promise<void> {
    try {
        const { error } = await supabase
            .from('notifications')
            .update({ read: true, read_at: new Date().toISOString() })
            .eq('user_id', userId)
            .eq('read', false);
        if (error) throw error;
    } catch (error) {
        console.error('Erro ao marcar todas notificações como lidas:', error);
        throw error;
    }
}

// Deletar notificação
export async function deleteNotification(notificationId: string): Promise<void> {
    try {
        // Soft delete - marcar como inativo
        const { error } = await supabase
            .from('notifications')
            .update({ status: false, deleted_at: new Date().toISOString() })
            .eq('id', notificationId);
        if (error) throw error;
    } catch (error) {
        console.error('Erro ao deletar notificação:', error);
        throw error;
    }
}

// Criação de notificação em massa é uma operação ADMIN (servidor/Edge Function):
// o cliente não tem permissão para inserir notifications nem ler todos os usuários.
export async function createBulkNotification(_data: BulkNotificationData): Promise<void> {
    throw new Error('Envio em massa de notificações deve ser feito pelo backend (não suportado no cliente).');
}

// Estatísticas de notificações do usuário (contagens via Supabase).
export async function getNotificationStats(userId: string) {
    try {
        const countFor = async (build: (q: any) => any) => {
            const { count } = await build(
                supabase.from('notifications').select('id', { count: 'exact', head: true })
                    .eq('user_id', userId).neq('status', false)
            );
            return count ?? 0;
        };
        const [total, unread, read] = await Promise.all([
            countFor((q) => q),
            countFor((q) => q.eq('read', false)),
            countFor((q) => q.eq('read', true)),
        ]);
        return { total, unread, read };
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
