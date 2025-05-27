import * as Notifications from 'expo-notifications';
import { eventsService } from './events';
import { EventsTypes } from '@/types/EventsTypes';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

const NOTIFICATION_KEY = 'unaadeb_event_notifications';

interface EventNotificationSettings {
  enabled: boolean;
  minutesBefore: number;
  subscribedEventsOnly: boolean;
}

const DEFAULT_SETTINGS: EventNotificationSettings = {
  enabled: true,
  minutesBefore: 60, // 1 hora antes
  subscribedEventsOnly: true,
};

class EventNotificationService {
  private static instance: EventNotificationService;
  
  private constructor() {
    this.initializeNotifications();
  }
  
  public static getInstance(): EventNotificationService {
    if (!EventNotificationService.instance) {
      EventNotificationService.instance = new EventNotificationService();
    }
    return EventNotificationService.instance;
  }

  private async initializeNotifications() {
    await Notifications.setNotificationHandler({
      handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: true,
        shouldSetBadge: true,
      }),
    });
  }

  async requestPermissions(): Promise<boolean> {
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;
    
    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }
    
    return finalStatus === 'granted';
  }

  async getSettings(): Promise<EventNotificationSettings> {
    try {
      const stored = await AsyncStorage.getItem(NOTIFICATION_KEY);
      return stored ? JSON.parse(stored) : DEFAULT_SETTINGS;
    } catch (error) {
      console.error('Error getting notification settings:', error);
      return DEFAULT_SETTINGS;
    }
  }

  async updateSettings(settings: Partial<EventNotificationSettings>): Promise<void> {
    try {
      const current = await this.getSettings();
      const updated = { ...current, ...settings };
      await AsyncStorage.setItem(NOTIFICATION_KEY, JSON.stringify(updated));
      
      if (updated.enabled) {
        await this.scheduleEventNotifications();
      } else {
        await this.cancelAllNotifications();
      }
    } catch (error) {
      console.error('Error updating notification settings:', error);
      throw error;
    }
  }

  async scheduleEventNotifications(userId?: string): Promise<void> {
    try {
      const settings = await this.getSettings();
      if (!settings.enabled) return;
      
      const hasPermission = await this.requestPermissions();
      if (!hasPermission) return;
      
      await this.cancelAllNotifications();
      
      const events = await eventsService.getUpcomingEvents(20);
      const now = new Date();
      
      for (const event of events) {
        const eventDate = new Date(event.start_date_time);
        const notificationDate = new Date(eventDate.getTime() - settings.minutesBefore * 60 * 1000);
        
        if (notificationDate > now) {
          if (settings.subscribedEventsOnly && userId) {
            const isSubscribed = await eventsService.isUserSubscribed(event.id, userId);
            if (!isSubscribed) continue;
          }
          
          await this.scheduleEventNotification(event, notificationDate);
        }
      }
    } catch (error) {
      console.error('Error scheduling event notifications:', error);
    }
  }

  private async scheduleEventNotification(event: EventsTypes, triggerDate: Date): Promise<void> {
    try {
      const notificationId = await Notifications.scheduleNotificationAsync({
        content: {
          title: `🎉 ${event.title}`,
          body: `O evento começa em breve! Local: ${event.location}`,
          data: { eventId: event.id },
          sound: 'default',
          priority: Notifications.AndroidNotificationPriority.HIGH,
        },
        trigger: {
          type: 'date' as const,
          date: triggerDate,
        },
      });
      
      console.log(`Notification scheduled for event ${event.id} at ${triggerDate}`);
    } catch (error) {
      console.error(`Error scheduling notification for event ${event.id}:`, error);
    }
  }

  async cancelEventNotification(eventId: string): Promise<void> {
    try {
      const scheduled = await Notifications.getAllScheduledNotificationsAsync();
      const eventNotifications = scheduled.filter(
        notification => notification.content.data?.eventId === eventId
      );
      
      for (const notification of eventNotifications) {
        await Notifications.cancelScheduledNotificationAsync(notification.identifier);
      }
    } catch (error) {
      console.error(`Error canceling notification for event ${eventId}:`, error);
    }
  }

  async cancelAllNotifications(): Promise<void> {
    try {
      await Notifications.cancelAllScheduledNotificationsAsync();
    } catch (error) {
      console.error('Error canceling all notifications:', error);
    }
  }

  async getScheduledNotifications(): Promise<Notifications.NotificationRequest[]> {
    try {
      return await Notifications.getAllScheduledNotificationsAsync();
    } catch (error) {
      console.error('Error getting scheduled notifications:', error);
      return [];
    }
  }

  async handleNotificationResponse(response: Notifications.NotificationResponse): Promise<void> {
    const eventId = response.notification.request.content.data?.eventId;
    if (eventId) {
      // TODO: Navigate to event details
      console.log(`Navigate to event ${eventId}`);
    }
  }
}

export const eventNotificationService = EventNotificationService.getInstance();