import React, {
    createContext,
    useContext,
    useState,
    useEffect,
    useMemo,
    useCallback,
    useRef,
    type ReactNode,
} from 'react';
import * as Notifications from 'expo-notifications';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AppState, type AppStateStatus } from 'react-native';
import type { RealtimeChannel } from '@supabase/supabase-js';
import { supabase } from '@/services/supabase';

import {
    registerForPushNotifications,
    sendTokenToServer,
    fetchNotifications,
    markNotificationAsRead,
    markAllNotificationsAsRead,
    deleteNotification,
    setupNotificationListeners,
    isTransientNetworkError,
    type NotificationData,
    type PushNotificationToken,
} from '@/services/notification';
import { useAuth } from '@/contexts/AuthContext';
import AlertContext from './AlertContext';

const NOTIFICATIONS_CACHE_KEY = '@UNAADEB:NotificationsCache';
const NOTIFICATIONS_TIMESTAMP_KEY = '@UNAADEB:NotificationsTimestamp';

/** Linha da tabela `notifications` recebida via Supabase Realtime (postgres_changes). */
interface NotificationRow {
    id: string;
    user_id: string;
    title: string;
    body: string;
    data?: Record<string, any> | null;
    read: boolean;
    read_at?: string | null;
    status?: boolean | null;
    deleted_at?: string | null;
    type?: string | null;
    created_at: string;
    updated_at?: string | null;
}

interface NotificationContextType {
    notifications: NotificationData[];
    unreadCount: number;
    registerDevice: () => Promise<void>;
    refreshNotifications: () => Promise<void>;
    markAsRead: (notificationId: string) => Promise<void>;
    markAllAsRead: () => Promise<void>;
    deleteNotification: (notificationId: string) => Promise<void>;
    pushToken: PushNotificationToken;
    lastNotification: Notifications.Notification | null;
    notificationsEnabled: boolean;
    requestPermissions: () => Promise<boolean>;
    checkNotificationPermissions: () => Promise<boolean>;
    isLoading: boolean;
    isRefreshing: boolean;
    realtimeConnected: boolean;
    lastUpdated: Date | null;
    sendTestNotification: () => Promise<void>;
    clearAllNotifications: () => Promise<void>;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export function useNotifications() {
    const context = useContext(NotificationContext);
    if (!context) throw new Error('useNotifications deve ser usado dentro de um NotificationProvider');
    return context;
}

const countUnread = (list: NotificationData[]) => list.reduce((acc, n) => acc + (n.read ? 0 : 1), 0);

/** Cache local de notificações (AsyncStorage) com TTL em memória. */
class NotificationStorage {
    private readonly CACHE_TTL = 30000;
    private cachedData: NotificationData[] | null = null;
    private lastCacheUpdate = 0;

    async get(): Promise<NotificationData[]> {
        const now = Date.now();
        if (this.cachedData && now - this.lastCacheUpdate < this.CACHE_TTL) return this.cachedData;
        try {
            const item = await AsyncStorage.getItem(NOTIFICATIONS_CACHE_KEY);
            const parsed = JSON.parse(item || '[]');
            this.cachedData = parsed;
            this.lastCacheUpdate = now;
            return parsed;
        } catch {
            return [];
        }
    }

    async set(data: NotificationData[]) {
        this.cachedData = data;
        this.lastCacheUpdate = Date.now();
        try {
            await AsyncStorage.multiSet([
                [NOTIFICATIONS_CACHE_KEY, JSON.stringify(data)],
                [NOTIFICATIONS_TIMESTAMP_KEY, new Date().toISOString()],
            ]);
        } catch {
            /* cache best-effort */
        }
    }

    async clear() {
        this.cachedData = null;
        this.lastCacheUpdate = 0;
        try {
            await AsyncStorage.multiRemove([NOTIFICATIONS_CACHE_KEY, NOTIFICATIONS_TIMESTAMP_KEY]);
        } catch {
            /* best-effort */
        }
    }
}

export function NotificationProvider({ children }: { children: ReactNode }) {
    const { user } = useAuth();
    const alert = useContext(AlertContext);
    const userId = user?.id;

    const [notifications, setNotifications] = useState<NotificationData[]>([]);
    const [pushToken, setPushToken] = useState<PushNotificationToken>(undefined);
    const [lastNotification, setLastNotification] = useState<Notifications.Notification | null>(null);
    const [notificationsEnabled, setNotificationsEnabled] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [realtimeConnected, setRealtimeConnected] = useState(false);
    const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

    // unreadCount é DERIVADO da lista — nunca sincronizado à mão (elimina uma classe de bugs).
    const unreadCount = useMemo(() => countUnread(notifications), [notifications]);

    // Espelho da lista atual para uso em callbacks estáveis (sem depender de `notifications`).
    const notificationsRef = useRef<NotificationData[]>([]);
    useEffect(() => {
        notificationsRef.current = notifications;
    }, [notifications]);

    // Refs de "último valor" — lidas dentro do handler de AppState sem forçá-lo a re-inscrever.
    const realtimeConnectedRef = useRef(realtimeConnected);
    realtimeConnectedRef.current = realtimeConnected;
    const lastUpdatedRef = useRef(lastUpdated);
    lastUpdatedRef.current = lastUpdated;

    // Refs de infra (canal Realtime, AppState, dedup de refresh).
    const channelRef = useRef<RealtimeChannel | null>(null);
    const appStateRef = useRef<AppStateStatus>(AppState.currentState);
    const refreshPromiseRef = useRef<Promise<void> | null>(null);
    const storageRef = useRef(new NotificationStorage());

    // Atualiza estado + cache numa única passagem.
    const commit = useCallback((list: NotificationData[]) => {
        setNotifications(list);
        setLastUpdated(new Date());
        storageRef.current.set(list);
    }, []);

    // INSERT: nova notificação chegou (fan-out por usuário → cada linha é 1 destinatário).
    const handleRealtimeNotification = useCallback(
        (row: NotificationRow) => {
            if (row.deleted_at) return;                                         // ignora soft-deletes
            if (notificationsRef.current.some((n) => n.id === row.id)) return;  // dedupe c/ o refresh
            const incoming: NotificationData = {
                id: row.id,
                title: row.title,
                body: row.body,
                data: row.data ?? undefined,
                read: !!row.read,
                created_at: row.created_at,
            };
            commit([incoming, ...notificationsRef.current]);

            if (appStateRef.current === 'active') {
                Notifications.scheduleNotificationAsync({
                    content: { title: row.title, body: row.body, data: row.data || {} },
                    trigger: null,
                });
                alert.success(`Nova notificação: ${row.title}`);
            }
        },
        [alert, commit],
    );

    // UPDATE: sincroniza leitura/remoção feitas em OUTRO aparelho.
    const handleRemoteUpdate = useCallback(
        (row: NotificationRow) => {
            const current = notificationsRef.current;
            if (!current.some((n) => n.id === row.id)) return;
            const next = row.deleted_at
                ? current.filter((n) => n.id !== row.id)
                : current.map((n) => (n.id === row.id ? { ...n, read: !!row.read } : n));
            commit(next);
        },
        [commit],
    );

    const connectRealtime = useCallback(async () => {
        if (channelRef.current || !userId) return;
        try {
            // Autoriza o Realtime com o JWT do usuário → a RLS entrega só as linhas dele.
            const { data: { session } } = await supabase.auth.getSession();
            if (session?.access_token) await supabase.realtime.setAuth(session.access_token);

            const filter = `user_id=eq.${userId}`;
            const channel = supabase
                .channel(`notifications:${userId}`)
                .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'notifications', filter },
                    (payload) => handleRealtimeNotification(payload.new as NotificationRow))
                .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'notifications', filter },
                    (payload) => handleRemoteUpdate(payload.new as NotificationRow))
                .subscribe((status) => setRealtimeConnected(status === 'SUBSCRIBED'));

            channelRef.current = channel;
        } catch {
            /* realtime é best-effort — o refresh/polling cobre a falha */
        }
    }, [userId, handleRealtimeNotification, handleRemoteUpdate]);

    const disconnectRealtime = useCallback(() => {
        if (!channelRef.current) return;
        supabase.removeChannel(channelRef.current);
        channelRef.current = null;
        setRealtimeConnected(false);
    }, []);

    const checkNotificationPermissions = useCallback(async () => {
        try {
            const { status } = await Notifications.getPermissionsAsync();
            const enabled = status === 'granted';
            setNotificationsEnabled(enabled);
            return enabled;
        } catch {
            setNotificationsEnabled(false);
            return false;
        }
    }, []);

    const registerDevice = useCallback(async () => {
        if (!userId) return;
        const enabled = await checkNotificationPermissions();
        if (!enabled) return;
        const token = await registerForPushNotifications();
        if (!token) return;
        setPushToken(token);
        await sendTokenToServer(token, userId);
        await AsyncStorage.setItem(`pushTokenRegistered_${userId}`, 'true');
    }, [userId, checkNotificationPermissions]);

    const requestPermissions = useCallback(async () => {
        try {
            const { status } = await Notifications.requestPermissionsAsync();
            const enabled = status === 'granted';
            setNotificationsEnabled(enabled);
            if (enabled && userId) await registerDevice();
            return enabled;
        } catch {
            return false;
        }
    }, [userId, registerDevice]);

    const loadFromCache = useCallback(async () => {
        const cached = await storageRef.current.get();
        if (cached.length === 0) return false;
        setNotifications(cached);
        const ts = await AsyncStorage.getItem(NOTIFICATIONS_TIMESTAMP_KEY);
        if (ts) setLastUpdated(new Date(ts));
        return true;
    }, []);

    // Busca no servidor com dedup de requisições concorrentes.
    const refreshNotifications = useCallback(
        async (silent = false) => {
            if (!userId) return;
            if (refreshPromiseRef.current) return refreshPromiseRef.current;

            refreshPromiseRef.current = (async () => {
                if (!silent) setIsLoading(true);
                setIsRefreshing(true);
                try {
                    const notifs = await fetchNotifications(userId);
                    commit(notifs);
                } catch (e) {
                    // Falha de rede transitória: NÃO limpa a lista — mantém o que já está na tela.
                    if (isTransientNetworkError(e)) {
                        if (__DEV__) console.warn('[notifications] rede instável — mantendo lista/cache.');
                    } else if (!silent) {
                        alert.error('Erro ao carregar notificações');
                    }
                    if (notificationsRef.current.length === 0) await loadFromCache();
                } finally {
                    setIsLoading(false);
                    setIsRefreshing(false);
                    refreshPromiseRef.current = null;
                }
            })();

            return refreshPromiseRef.current;
        },
        [userId, alert, commit, loadFromCache],
    );

    // Mutações OTIMISTAS: aplica na UI/cache na hora e reverte se o servidor falhar.
    const markAsRead = useCallback(async (id: string) => {
        const prev = notificationsRef.current;
        if (!prev.some((n) => n.id === id && !n.read)) return;
        commit(prev.map((n) => (n.id === id ? { ...n, read: true } : n)));
        try {
            await markNotificationAsRead(id);
        } catch {
            commit(prev);
        }
    }, [commit]);

    const markAllAsRead = useCallback(async () => {
        if (!userId) return;
        const prev = notificationsRef.current;
        if (!prev.some((n) => !n.read)) return;
        commit(prev.map((n) => ({ ...n, read: true })));
        try {
            await markAllNotificationsAsRead(userId);
        } catch {
            commit(prev);
        }
    }, [userId, commit]);

    const deleteNotificationFunc = useCallback(async (id: string) => {
        const prev = notificationsRef.current;
        commit(prev.filter((n) => n.id !== id));
        try {
            await deleteNotification(id);
        } catch {
            commit(prev);
            alert.error('Erro ao excluir notificação');
        }
    }, [alert, commit]);

    const clearAllNotifications = useCallback(async () => {
        setNotifications([]);
        await storageRef.current.clear();
        alert.success('Todas as notificações foram removidas');
    }, [alert]);

    // Notificação de teste — banner local (usado na tela de configurações).
    const sendTestNotification = useCallback(async () => {
        try {
            await Notifications.scheduleNotificationAsync({
                content: { title: 'Notificação de teste', body: 'Esta é uma notificação de teste do app.', data: { test: true } },
                trigger: null,
            });
            alert.success('Notificação de teste enviada!');
        } catch {
            alert.error('Erro ao enviar notificação de teste');
        }
    }, [alert]);

    // Verificar permissões ao montar.
    useEffect(() => {
        checkNotificationPermissions();
    }, [checkNotificationPermissions]);

    // AppState: reconectar Realtime + refresh silencioso ao voltar do background.
    useEffect(() => {
        const sub = AppState.addEventListener('change', (next: AppStateStatus) => {
            const wasBackground = appStateRef.current.match(/inactive|background/);
            appStateRef.current = next;
            if (wasBackground && next === 'active') {
                if (!realtimeConnectedRef.current && userId) connectRealtime();
                const last = lastUpdatedRef.current;
                if (last && (Date.now() - last.getTime()) / 60000 >= 2) refreshNotifications(true);
            }
        });
        return () => sub.remove();
    }, [userId, connectRealtime, refreshNotifications]);

    // Login/logout: cache → Realtime → registro → refresh; limpa tudo no logout.
    useEffect(() => {
        if (userId) {
            loadFromCache();
            connectRealtime();
            AsyncStorage.getItem(`pushTokenRegistered_${userId}`).then((registered) => {
                if (registered !== 'true') registerDevice();
            });
            refreshNotifications();
        } else {
            disconnectRealtime();
            setNotifications([]);
            storageRef.current.clear();
        }
        return () => {
            if (!userId) disconnectRealtime();
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [userId]);

    // Listeners do Expo (foreground receive + tap) → refresh silencioso.
    useEffect(() => {
        if (!userId) return;
        return setupNotificationListeners(
            (notification) => {
                setLastNotification(notification);
                refreshNotifications(true);
            },
            () => refreshNotifications(true),
        );
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [userId]);

    const value = useMemo<NotificationContextType>(
        () => ({
            notifications,
            unreadCount,
            registerDevice,
            refreshNotifications,
            markAsRead,
            markAllAsRead,
            deleteNotification: deleteNotificationFunc,
            pushToken,
            lastNotification,
            notificationsEnabled,
            requestPermissions,
            checkNotificationPermissions,
            isLoading,
            isRefreshing,
            realtimeConnected,
            lastUpdated,
            sendTestNotification,
            clearAllNotifications,
        }),
        [
            notifications,
            unreadCount,
            registerDevice,
            refreshNotifications,
            markAsRead,
            markAllAsRead,
            deleteNotificationFunc,
            pushToken,
            lastNotification,
            notificationsEnabled,
            requestPermissions,
            checkNotificationPermissions,
            isLoading,
            isRefreshing,
            realtimeConnected,
            lastUpdated,
            sendTestNotification,
            clearAllNotifications,
        ],
    );

    return <NotificationContext.Provider value={value}>{children}</NotificationContext.Provider>;
}
