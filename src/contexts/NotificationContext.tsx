import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import * as Notifications from 'expo-notifications';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AppState, AppStateStatus } from 'react-native';

import {
    registerForPushNotifications,
    sendTokenToServer,
    fetchNotifications,
    markNotificationAsRead,
    markAllNotificationsAsRead,
    setupNotificationListeners,
    NotificationData,
    PushNotificationToken,
    areNotificationsEnabled
} from '@/services/notification';

import { storage } from '@/services/api';
import { useAuth } from "@/contexts/AuthContext";

// Definição do tipo do contexto
interface NotificationContextType {
    notifications: NotificationData[];
    unreadCount: number;
    registerDevice: () => Promise<void>;
    refreshNotifications: () => Promise<void>;
    markAsRead: (notificationId: string) => Promise<void>;
    markAllAsRead: () => Promise<void>;
    pushToken: PushNotificationToken;
    lastNotification: Notifications.Notification | null;
    notificationsEnabled: boolean;
    requestPermissions: () => Promise<boolean>;
    checkNotificationPermissions: () => Promise<boolean>;
    isLoading: boolean;
}

// Criação do contexto
const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

// Hook para usar o contexto
export function useNotifications() {
    const context = useContext(NotificationContext);
    if (!context) {
        throw new Error('useNotifications deve ser usado dentro de um NotificationProvider');
    }
    return context;
}

// Componente provedor
export function NotificationProvider({
                                         children
                                     }: {
    children: ReactNode;
}) {
    // Usar diretamente o contexto de autenticação
    const { user } = useAuth();
    const userId = user?.id;

    const [notifications, setNotifications] = useState<NotificationData[]>([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [pushToken, setPushToken] = useState<PushNotificationToken>(undefined);
    const [lastNotification, setLastNotification] = useState<Notifications.Notification | null>(null);
    const [notificationsEnabled, setNotificationsEnabled] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [appState, setAppState] = useState<AppStateStatus>(AppState.currentState);

    // Verificar permissões de notificações
    const checkNotificationPermissions = async () => {
        try {
            const { status } = await Notifications.getPermissionsAsync();
            console.log('Status atual das permissões:', status);
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
            console.log('Solicitando permissões para notificações...');
            const { status } = await Notifications.requestPermissionsAsync();
            console.log('Status após solicitação:', status);
            const enabled = status === 'granted';
            setNotificationsEnabled(enabled);

            // Se permissão concedida, registrar dispositivo
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
        if (!userId) {
            console.log('Não há usuário logado. Impossível registrar dispositivo.');
            return;
        }

        try {
            // Verificar se as notificações estão habilitadas
            const enabled = await checkNotificationPermissions();
            if (!enabled) {
                console.log('Notificações não estão habilitadas. Abortando registro do dispositivo.');
                return;
            }

            console.log('Obtendo token de push para o dispositivo...');
            const token = await registerForPushNotifications();
            console.log('Token obtido:', token);

            if (!token) {
                console.log('Não foi possível obter o token. Abortando registro.');
                return;
            }

            setPushToken(token);

            // Enviar token para o servidor
            console.log(`Enviando token para o servidor para o usuário ${userId}...`);
            await sendTokenToServer(token, userId);

            // Salvar no AsyncStorage que o token foi registrado
            console.log('Salvando registro no AsyncStorage...');
            await AsyncStorage.setItem(`pushTokenRegistered_${userId}`, 'true');

            console.log('Dispositivo registrado com sucesso para receber notificações!');
        } catch (error) {
            console.error('Erro ao registrar dispositivo para notificações:', error);
        }
    };

    // Carregar notificações do servidor
    const refreshNotifications = async () => {
        if (!userId) {
            console.log('Nenhum usuário logado. Ignorando atualização de notificações.');
            return;
        }

        try {
            setIsLoading(true);
            console.log(`Buscando notificações para o usuário ${userId}...`);
            const notifs = await fetchNotifications(userId);
            console.log(`${notifs.length} notificações encontradas.`);

            setNotifications(notifs);

            // Calcular contagem de não lidas
            const unread = notifs.filter(n => !n.read).length;
            console.log(`${unread} notificações não lidas.`);
            setUnreadCount(unread);
        } catch (error) {
            console.error('Erro ao atualizar notificações:', error);
        } finally {
            setIsLoading(false);
        }
    };

    // Marcar notificação como lida
    const markAsRead = async (notificationId: string) => {
        try {
            console.log(`Marcando notificação ${notificationId} como lida...`);
            await markNotificationAsRead(notificationId);

            // Atualizar o estado local
            setNotifications(prevNotifications =>
                prevNotifications.map(n =>
                    n.id === notificationId ? { ...n, read: true } : n
                )
            );

            // Recalcular contagem de não lidas
            setUnreadCount(prev => Math.max(0, prev - 1));
            console.log('Notificação marcada como lida com sucesso.');
        } catch (error) {
            console.error('Erro ao marcar notificação como lida:', error);
        }
    };

    // Marcar todas as notificações como lidas
    const markAllAsRead = async () => {
        if (!userId) {
            console.log('Nenhum usuário logado. Impossível marcar notificações como lidas.');
            return;
        }

        try {
            console.log('Marcando todas as notificações como lidas...');
            await markAllNotificationsAsRead(userId);

            // Atualizar o estado local
            setNotifications(prevNotifications =>
                prevNotifications.map(n => ({ ...n, read: true }))
            );

            // Zerar contagem de não lidas
            setUnreadCount(0);
            console.log('Todas as notificações marcadas como lidas com sucesso.');
        } catch (error) {
            console.error('Erro ao marcar todas notificações como lidas:', error);
        }
    };

    // Handler para mudanças de AppState
    const handleAppStateChange = (nextAppState: AppStateStatus) => {
        console.log('App state changed from', appState, 'to', nextAppState);

        // Se o app estava em background e volta para foreground (ativo)
        if (
            appState.match(/inactive|background/) &&
            nextAppState === 'active'
        ) {
            console.log('App voltou para o primeiro plano!');
            refreshNotifications();
        }

        setAppState(nextAppState);
    };

    // Verificar o estado das permissões ao iniciar
    useEffect(() => {
        checkNotificationPermissions();
    }, []);

    // Monitorar mudanças de estado do aplicativo (background/foreground)
    useEffect(() => {
        const subscription = AppState.addEventListener('change', handleAppStateChange);

        return () => {
            subscription.remove();
        };
    }, [appState]);

    // Efeito para gerenciar o registro do dispositivo e atualizar notificações quando o userId mudar
    useEffect(() => {
        if (userId) {
            console.log(`ID do usuário definido: ${userId}. Verificando registro de token...`);

            // Verificar se o token já foi registrado para este usuário
            AsyncStorage.getItem(`pushTokenRegistered_${userId}`).then(registered => {
                console.log(`Token registrado para o usuário ${userId}? ${registered === 'true' ? 'Sim' : 'Não'}`);

                if (registered !== 'true') {
                    console.log('Token não registrado ainda. Iniciando registro...');
                    registerDevice();
                }
            });

            // Atualizar notificações
            refreshNotifications();
        } else {
            console.log('Nenhum usuário logado. Limpando dados de notificações.');
            setNotifications([]);
            setUnreadCount(0);
        }
    }, [userId]);

    // Configurar listeners de notificação
    useEffect(() => {
        console.log('Configurando listeners de notificação...');

        // Configurar listeners de notificação
        const removeListeners = setupNotificationListeners(
            // Quando uma notificação é recebida
            notification => {
                console.log('Notificação recebida enquanto app está em primeiro plano:', notification);
                setLastNotification(notification);
                refreshNotifications();
            },
            // Quando o usuário interage com uma notificação
            response => {
                const notificationData = response.notification.request.content.data;
                console.log('Usuário interagiu com notificação:', notificationData);

                // Atualizar notificações após interação
                refreshNotifications();
            }
        );

        // Limpar listeners ao desmontar
        return () => {
            console.log('Removendo listeners de notificação...');
            removeListeners();
        };
    }, [userId]);

    // Fornecer o contexto para a árvore de componentes
    return (
        <NotificationContext.Provider
            value={{
                notifications,
                unreadCount,
                registerDevice,
                refreshNotifications,
                checkNotificationPermissions,
                markAsRead,
                markAllAsRead,
                pushToken,
                lastNotification,
                notificationsEnabled,
                requestPermissions,
                isLoading
            }}
        >
            {children}
        </NotificationContext.Provider>
    );
}
