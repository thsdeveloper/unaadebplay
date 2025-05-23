import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback, useRef } from 'react';
import * as Notifications from 'expo-notifications';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AppState, AppStateStatus } from 'react-native';
import * as Ably from 'ably';

import {
    registerForPushNotifications,
    sendTokenToServer,
    fetchNotifications,
    markNotificationAsRead,
    markAllNotificationsAsRead,
    deleteNotification,
    setupNotificationListeners,
    NotificationData,
    PushNotificationToken,
    areNotificationsEnabled
} from '@/services/notification';

import { storage } from '@/services/api';
import { useAuth } from "@/contexts/AuthContext";
import AlertContext from "./AlertContext";

// Chave API do Ably (use a chave Subscribe only para o cliente)
const ABLY_API_KEY = process.env.EXPO_PUBLIC_ABLY_API_KEY;

// Constantes para armazenamento local
const NOTIFICATIONS_CACHE_KEY = '@UNAADEB:NotificationsCache';
const NOTIFICATIONS_TIMESTAMP_KEY = '@UNAADEB:NotificationsTimestamp';

// Interface para notificação em tempo real
interface RealtimeNotificationData {
    id: string;
    title: string;
    message: string;
    data?: Record<string, any>;
    user_id: string;
    created_at: string;
    type: 'single' | 'broadcast' | 'group';
    target_users?: string[];
}

// Interface do contexto aprimorada
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
    // Novas funcionalidades
    sendTestNotification: () => Promise<void>;
    clearAllNotifications: () => Promise<void>;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

// Hook para usar o contexto
export function useNotifications() {
    const context = useContext(NotificationContext);
    if (!context) {
        throw new Error('useNotifications deve ser usado dentro de um NotificationProvider');
    }
    return context;
}

// Enhanced notification storage class
class NotificationStorage {
    private readonly CACHE_TTL = 30000; // 30 segundos
    private cachedData: NotificationData[] | null = null;
    private lastCacheUpdate = 0;

    async get(): Promise<NotificationData[]> {
        const now = Date.now();
        if (this.cachedData && now - this.lastCacheUpdate < this.CACHE_TTL) {
            return this.cachedData;
        }

        try {
            const item = await AsyncStorage.getItem(NOTIFICATIONS_CACHE_KEY);
            const parsedData = JSON.parse(item || '[]');

            this.cachedData = parsedData;
            this.lastCacheUpdate = now;

            return parsedData;
        } catch (error) {
            console.error('Erro ao acessar cache de notificações:', error);
            return [];
        }
    }

    async set(data: NotificationData[]) {
        this.cachedData = data;
        this.lastCacheUpdate = Date.now();

        try {
            await AsyncStorage.setItem(NOTIFICATIONS_CACHE_KEY, JSON.stringify(data));
            await AsyncStorage.setItem(NOTIFICATIONS_TIMESTAMP_KEY, new Date().toISOString());
        } catch (error) {
            console.error('Erro ao salvar cache de notificações:', error);
        }
    }

    async clear() {
        this.cachedData = null;
        this.lastCacheUpdate = 0;

        try {
            await AsyncStorage.removeItem(NOTIFICATIONS_CACHE_KEY);
            await AsyncStorage.removeItem(NOTIFICATIONS_TIMESTAMP_KEY);
        } catch (error) {
            console.error('Erro ao limpar cache de notificações:', error);
        }
    }
}

export function NotificationProvider({ children }: { children: ReactNode }) {
    const { user } = useAuth();
    const alert = useContext(AlertContext);
    const userId = user?.id;

    // Estados existentes
    const [notifications, setNotifications] = useState<NotificationData[]>([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [pushToken, setPushToken] = useState<PushNotificationToken>(undefined);
    const [lastNotification, setLastNotification] = useState<Notifications.Notification | null>(null);
    const [notificationsEnabled, setNotificationsEnabled] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [appState, setAppState] = useState<AppStateStatus>(AppState.currentState);

    // Novos estados para Ably
    const [realtimeConnected, setRealtimeConnected] = useState(false);
    const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

    // Referências para Ably
    const ablyClientRef = useRef<Ably.Realtime | null>(null);
    const ablyChannelRef = useRef<Ably.Types.RealtimeChannelPromise | null>(null);
    const isAppActive = useRef<boolean>(true);

    // Storage para cache de notificações
    const notificationStorage = useRef(new NotificationStorage());

    // Conectar ao Ably
    const connectToAbly = useCallback(() => {
        if (ablyClientRef.current || !userId) return;

        try {
            console.log('Conectando ao Ably para notificações...');

            ablyClientRef.current = new Ably.Realtime({
                key: ABLY_API_KEY,
                echoMessages: false,
                clientId: userId // Importante para identificar o usuário
            });

            // Eventos de conexão
            ablyClientRef.current.connection.on('connected', () => {
                console.log('Ably notificações conectado');
                setRealtimeConnected(true);
            });

            ablyClientRef.current.connection.on('disconnected', () => {
                console.log('Ably notificações desconectado');
                setRealtimeConnected(false);
            });

            ablyClientRef.current.connection.on('failed', (err) => {
                console.error('Falha na conexão Ably notificações:', err);
                setRealtimeConnected(false);
            });

            // Canal principal para todas as notificações
            ablyChannelRef.current = ablyClientRef.current.channels.get('notifications');

            // Evento para notificações direcionadas ao usuário específico
            ablyChannelRef.current.subscribe(`user:${userId}`, (message: any) => {
                console.log('Nova notificação recebida via Ably:', message.data);
                handleRealtimeNotification(message.data);
            });

            // Evento para notificações broadcast (para todos)
            ablyChannelRef.current.subscribe('broadcast', (message: any) => {
                console.log('Notificação broadcast recebida via Ably:', message.data);
                handleRealtimeNotification(message.data);
            });

            // Evento para notificações de grupo
            ablyChannelRef.current.subscribe('group', (message: any) => {
                const notificationData: RealtimeNotificationData = message.data;

                // Verificar se o usuário está na lista de destinatários
                if (notificationData.target_users?.includes(userId)) {
                    console.log('Notificação de grupo recebida via Ably:', notificationData);
                    handleRealtimeNotification(notificationData);
                }
            });

        } catch (error) {
            console.error('Erro ao conectar ao Ably:', error);
        }
    }, [userId]);

    // Desconectar do Ably
    const disconnectFromAbly = useCallback(() => {
        if (!ablyClientRef.current) return;

        try {
            console.log('Desconectando do Ably notificações...');

            if (ablyChannelRef.current) {
                ablyChannelRef.current.unsubscribe();
            }

            ablyClientRef.current.close();
            ablyClientRef.current = null;
            ablyChannelRef.current = null;

            setRealtimeConnected(false);
        } catch (error) {
            console.error('Erro ao desconectar do Ably:', error);
        }
    }, []);

    // Tratar notificação em tempo real
    const handleRealtimeNotification = useCallback(async (notificationData: RealtimeNotificationData) => {
        try {
            // Converter para formato da aplicação
            const newNotification: NotificationData = {
                id: notificationData.id,
                title: notificationData.title,
                body: notificationData.message,
                data: notificationData.data,
                read: false,
                created_at: notificationData.created_at,
            };

            // Adicionar à lista de notificações
            setNotifications(prev => [newNotification, ...prev]);
            setUnreadCount(prev => prev + 1);

            // Atualizar cache
            const currentNotifications = await notificationStorage.current.get();
            const updatedNotifications = [newNotification, ...currentNotifications];
            await notificationStorage.current.set(updatedNotifications);

            // Mostrar notificação local se o app estiver ativo
            if (isAppActive.current && AppState.currentState === 'active') {
                await Notifications.scheduleNotificationAsync({
                    content: {
                        title: notificationData.title,
                        body: notificationData.message,
                        data: notificationData.data || {},
                    },
                    trigger: null,
                });

                // Mostrar toast de notificação
                alert.info(`Nova notificação: ${notificationData.title}`);
            }

            setLastUpdated(new Date());
        } catch (error) {
            console.error('Erro ao processar notificação em tempo real:', error);
        }
    }, [alert]);

    // Verificar permissões de notificações
    const checkNotificationPermissions = async () => {
        try {
            const { status } = await Notifications.getPermissionsAsync();
            const enabled = status === 'granted';
            setNotificationsEnabled(enabled);
            return enabled;
        } catch (error) {
            console.error('Erro ao verificar permissões:', error);
            setNotificationsEnabled(false);
            return false;
        }
    };

    // Solicitar permissões de notificações
    const requestPermissions = async () => {
        try {
            const { status } = await Notifications.requestPermissionsAsync();
            const enabled = status === 'granted';
            setNotificationsEnabled(enabled);

            if (enabled && userId) {
                await registerDevice();
            }

            return enabled;
        } catch (error) {
            console.error('Erro ao solicitar permissões:', error);
            return false;
        }
    };

    // Registrar dispositivo para notificações push
    const registerDevice = async () => {
        if (!userId) return;

        try {
            const enabled = await checkNotificationPermissions();
            if (!enabled) return;

            const token = await registerForPushNotifications();
            if (!token) return;

            setPushToken(token);
            await sendTokenToServer(token, userId);
            await AsyncStorage.setItem(`pushTokenRegistered_${userId}`, 'true');

            console.log('Dispositivo registrado com sucesso!');
        } catch (error) {
            console.error('Erro ao registrar dispositivo:', error);
        }
    };

    // Carregar notificações do cache
    const loadFromCache = async () => {
        try {
            const cachedNotifications = await notificationStorage.current.get();
            if (cachedNotifications.length > 0) {
                setNotifications(cachedNotifications);
                const unread = cachedNotifications.filter(n => !n.read).length;
                setUnreadCount(unread);

                const timestamp = await AsyncStorage.getItem(NOTIFICATIONS_TIMESTAMP_KEY);
                if (timestamp) {
                    setLastUpdated(new Date(timestamp));
                }

                return true;
            }
            return false;
        } catch (error) {
            console.error('Erro ao carregar cache de notificações:', error);
            return false;
        }
    };

    // Carregar notificações do servidor
    const refreshNotifications = async (silent = false) => {
        if (!userId) return;

        try {
            if (!silent) setIsLoading(true);
            setIsRefreshing(true);

            const notifs = await fetchNotifications(userId);
            setNotifications(notifs);

            const unread = notifs.filter(n => !n.read).length;
            setUnreadCount(unread);

            // Atualizar cache
            await notificationStorage.current.set(notifs);
            setLastUpdated(new Date());

            if (silent && isAppActive.current) {
                // Mostrar feedback sutil apenas se for atualização silenciosa
                console.log('Notificações atualizadas silenciosamente');
            }
        } catch (error) {
            console.error('Erro ao atualizar notificações:', error);
            if (!silent) {
                alert.error('Erro ao carregar notificações');
            }

            // Tentar usar cache em caso de erro
            await loadFromCache();
        } finally {
            setIsLoading(false);
            setIsRefreshing(false);
        }
    };

    // Marcar notificação como lida
    const markAsRead = async (notificationId: string) => {
        try {
            await markNotificationAsRead(notificationId);

            setNotifications(prevNotifications =>
                prevNotifications.map(n =>
                    n.id === notificationId ? { ...n, read: true } : n
                )
            );

            setUnreadCount(prev => Math.max(0, prev - 1));

            // Atualizar cache
            const updatedNotifications = notifications.map(n =>
                n.id === notificationId ? { ...n, read: true } : n
            );
            await notificationStorage.current.set(updatedNotifications);

        } catch (error) {
            console.error('Erro ao marcar notificação como lida:', error);
        }
    };

    // Marcar todas as notificações como lidas
    const markAllAsRead = async () => {
        if (!userId) return;

        try {
            await markAllNotificationsAsRead(userId);

            setNotifications(prevNotifications =>
                prevNotifications.map(n => ({ ...n, read: true }))
            );

            setUnreadCount(0);

            // Atualizar cache
            const updatedNotifications = notifications.map(n => ({ ...n, read: true }));
            await notificationStorage.current.set(updatedNotifications);

        } catch (error) {
            console.error('Erro ao marcar todas notificações como lidas:', error);
        }
    };

    // Deletar notificação
    const deleteNotificationFunc = async (notificationId: string) => {
        try {
            // Otimização: Atualizar UI primeiro para resposta imediata
            const notificationToDelete = notifications.find(n => n.id === notificationId);
            const updatedNotifications = notifications.filter(n => n.id !== notificationId);
            setNotifications(updatedNotifications);

            // Atualizar contador se a notificação não estava lida
            if (notificationToDelete && !notificationToDelete.read) {
                setUnreadCount(prev => Math.max(0, prev - 1));
            }

            // Executar delete no servidor em background
            deleteNotification(notificationId).catch(error => {
                console.error('Erro ao deletar no servidor:', error);
                // Reverter em caso de erro
                setNotifications(notifications);
                if (notificationToDelete && !notificationToDelete.read) {
                    setUnreadCount(prev => prev + 1);
                }
                alert.error('Erro ao deletar notificação');
            });

            // Atualizar cache
            await notificationStorage.current.set(updatedNotifications);

        } catch (error) {
            console.error('Erro ao deletar notificação:', error);
            alert.error('Erro ao deletar notificação');
        }
    };

    // Limpar todas as notificações
    const clearAllNotifications = async () => {
        try {
            // Aqui você poderia adicionar uma chamada API para limpar do servidor
            setNotifications([]);
            setUnreadCount(0);
            await notificationStorage.current.clear();

            alert.success('Todas as notificações foram removidas');
        } catch (error) {
            console.error('Erro ao limpar notificações:', error);
            alert.error('Erro ao limpar notificações');
        }
    };

    // Enviar notificação de teste
    const sendTestNotification = async () => {
        try {
            await Notifications.scheduleNotificationAsync({
                content: {
                    title: 'Notificação de Teste',
                    body: 'Esta é uma notificação de teste do seu app!',
                    data: { test: true },
                },
                trigger: null,
            });

            alert.success('Notificação de teste enviada!');
        } catch (error) {
            console.error('Erro ao enviar notificação de teste:', error);
            alert.error('Erro ao enviar notificação de teste');
        }
    };

    // Handler para mudanças de AppState
    const handleAppStateChange = useCallback(async (nextAppState: AppStateStatus) => {
        if (
            appState.match(/inactive|background/) &&
            nextAppState === 'active'
        ) {
            console.log('App voltou para o primeiro plano!');
            isAppActive.current = true;

            // Reconectar Ably se necessário
            if (!realtimeConnected && userId) {
                connectToAbly();
            }

            // Verificar por atualizações
            if (lastUpdated) {
                const now = new Date();
                const diffMinutes = (now.getTime() - lastUpdated.getTime()) / (1000 * 60);

                if (diffMinutes >= 2) { // Atualizar se passou mais de 2 minutos
                    await refreshNotifications(true);
                }
            }
        } else if (nextAppState === 'background') {
            isAppActive.current = false;
        }

        setAppState(nextAppState);
    }, [appState, realtimeConnected, lastUpdated, userId, connectToAbly]);

    // Verificar permissões ao iniciar
    useEffect(() => {
        checkNotificationPermissions();
    }, []);

    // Monitorar mudanças de estado do aplicativo
    useEffect(() => {
        const subscription = AppState.addEventListener('change', handleAppStateChange);
        return () => subscription.remove();
    }, [handleAppStateChange]);

    // Gerenciar registro do dispositivo e Ably quando userId mudar
    useEffect(() => {
        if (userId) {
            console.log(`Usuário logado: ${userId}`);

            // Carregar cache primeiro
            loadFromCache();

            // Conectar ao Ably
            connectToAbly();

            // Verificar registro de token
            AsyncStorage.getItem(`pushTokenRegistered_${userId}`).then(registered => {
                if (registered !== 'true') {
                    registerDevice();
                }
            });

            // Atualizar notificações
            refreshNotifications();
        } else {
            console.log('Usuário deslogado. Limpando dados de notificações.');
            disconnectFromAbly();
            setNotifications([]);
            setUnreadCount(0);
            notificationStorage.current.clear();
        }

        return () => {
            if (!userId) {
                disconnectFromAbly();
            }
        };
    }, [userId]);

    // Configurar listeners de notificação do Expo
    useEffect(() => {
        if (!userId) return;

        console.log('Configurando listeners de notificação Expo...');

        const removeListeners = setupNotificationListeners(
            notification => {
                console.log('Notificação Expo recebida:', notification);
                setLastNotification(notification);
                refreshNotifications(true);
            },
            response => {
                const notificationData = response.notification.request.content.data;
                console.log('Usuário interagiu com notificação:', notificationData);
                refreshNotifications(true);
            }
        );

        return () => {
            console.log('Removendo listeners de notificação Expo...');
            removeListeners();
        };
    }, [userId]);

    return (
        <NotificationContext.Provider
            value={{
                notifications,
                unreadCount,
                registerDevice,
                refreshNotifications: () => refreshNotifications(false),
                checkNotificationPermissions,
                markAsRead,
                markAllAsRead,
                deleteNotification: deleteNotificationFunc,
                pushToken,
                lastNotification,
                notificationsEnabled,
                requestPermissions,
                isLoading,
                isRefreshing,
                realtimeConnected,
                lastUpdated,
                sendTestNotification,
                clearAllNotifications
            }}
        >
            {children}
        </NotificationContext.Provider>
    );
}
