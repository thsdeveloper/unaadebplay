import { useEffect, useContext } from 'react';
import { eventNotificationService } from '@/services/eventNotifications';
import AuthContext from '@/contexts/AuthContext';
import NotificationContext from '@/contexts/NotificationContext';
import * as Notifications from 'expo-notifications';

export const useEventNotifications = () => {
  const { user } = useContext(AuthContext);
  const { registerToken } = useContext(NotificationContext);

  useEffect(() => {
    if (!user?.id) return;

    // Registra o handler de resposta a notificações
    const subscription = Notifications.addNotificationResponseReceivedListener(response => {
      eventNotificationService.handleNotificationResponse(response);
    });

    // Agenda notificações para eventos próximos
    eventNotificationService.scheduleEventNotifications(user.id);

    // Atualiza notificações a cada 30 minutos
    const interval = setInterval(() => {
      eventNotificationService.scheduleEventNotifications(user.id);
    }, 30 * 60 * 1000);

    return () => {
      subscription.remove();
      clearInterval(interval);
    };
  }, [user?.id]);

  const updateSettings = async (settings: any) => {
    await eventNotificationService.updateSettings(settings);
    if (user?.id) {
      await eventNotificationService.scheduleEventNotifications(user.id);
    }
  };

  const getSettings = () => eventNotificationService.getSettings();

  return {
    updateSettings,
    getSettings,
  };
};