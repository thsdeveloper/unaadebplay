import { getItems, getItem, setCreateItem, updateItem, deleteItem } from './items';
import { EventsTypes } from '@/types/EventsTypes';
import AsyncStorage from '@react-native-async-storage/async-storage';

const CACHE_KEY = 'unaadeb_events_cache';
const CACHE_EXPIRY = 5 * 60 * 1000; // 5 minutos
const FAVORITES_KEY = 'unaadeb_favorite_events';

interface EventCache {
  data: EventsTypes[];
  timestamp: number;
}

interface EventFilters {
  eventType?: string;
  dateFrom?: Date;
  dateTo?: Date;
  location?: string;
  organizer?: string;
  search?: string;
  status?: string;
}

interface EventSubscription {
  event_id: string;
  user_id: string;
  date_created?: Date;
}

class EventsService {
  private static instance: EventsService;
  
  private constructor() {}
  
  public static getInstance(): EventsService {
    if (!EventsService.instance) {
      EventsService.instance = new EventsService();
    }
    return EventsService.instance;
  }

  async getEvents(filters?: EventFilters, forceRefresh = false): Promise<EventsTypes[]> {
    try {
      if (!forceRefresh) {
        const cachedEvents = await this.getCachedEvents();
        if (cachedEvents) {
          return this.applyFilters(cachedEvents, filters);
        }
      }

      const events = await getItems<EventsTypes>('events', {
        sort: ['start_date_time'],
        filter: this.buildDirectusFilter(filters),
      });

      await this.cacheEvents(events);
      return events;
    } catch (error) {
      console.error('Error fetching events:', error);
      const cachedEvents = await this.getCachedEvents();
      if (cachedEvents) {
        return this.applyFilters(cachedEvents, filters);
      }
      throw error;
    }
  }

  async getEventById(id: string): Promise<EventsTypes> {
    try {
      return await getItem<EventsTypes>('events', id);
    } catch (error) {
      console.error('Error fetching event by id:', error);
      throw error;
    }
  }

  async getUpcomingEvents(limit = 5): Promise<EventsTypes[]> {
    const now = new Date();
    return this.getEvents({
      dateFrom: now,
      status: 'active'
    }).then(events => events.slice(0, limit));
  }

  async getPastEvents(): Promise<EventsTypes[]> {
    const now = new Date();
    return this.getEvents({
      dateTo: now,
    });
  }

  async searchEvents(query: string): Promise<EventsTypes[]> {
    return this.getEvents({ search: query });
  }

  async subscribeToEvent(eventId: string, userId: string): Promise<void> {
    try {
      const subscription: EventSubscription = {
        event_id: eventId,
        user_id: userId,
      };
      await setCreateItem('event_subscriptions', subscription);
    } catch (error) {
      console.error('Error subscribing to event:', error);
      throw error;
    }
  }

  async unsubscribeFromEvent(subscriptionId: string): Promise<void> {
    try {
      await deleteItem('event_subscriptions', subscriptionId);
    } catch (error) {
      console.error('Error unsubscribing from event:', error);
      throw error;
    }
  }

  async getUserSubscriptions(userId: string): Promise<any[]> {
    try {
      return await getItems('event_subscriptions', {
        filter: {
          user_id: { _eq: userId }
        },
        fields: ['*', 'event_id.*']
      });
    } catch (error) {
      console.error('Error fetching user subscriptions:', error);
      throw error;
    }
  }

  async isUserSubscribed(eventId: string, userId: string): Promise<boolean> {
    try {
      const subscriptions = await getItems('event_subscriptions', {
        filter: {
          user_id: { _eq: userId },
          event_id: { _eq: eventId }
        }
      });
      return subscriptions.length > 0;
    } catch (error) {
      console.error('Error checking subscription status:', error);
      return false;
    }
  }

  async addToFavorites(eventId: string): Promise<void> {
    try {
      const favorites = await this.getFavorites();
      if (!favorites.includes(eventId)) {
        favorites.push(eventId);
        await AsyncStorage.setItem(FAVORITES_KEY, JSON.stringify(favorites));
      }
    } catch (error) {
      console.error('Error adding to favorites:', error);
      throw error;
    }
  }

  async removeFromFavorites(eventId: string): Promise<void> {
    try {
      const favorites = await this.getFavorites();
      const filtered = favorites.filter(id => id !== eventId);
      await AsyncStorage.setItem(FAVORITES_KEY, JSON.stringify(filtered));
    } catch (error) {
      console.error('Error removing from favorites:', error);
      throw error;
    }
  }

  async getFavorites(): Promise<string[]> {
    try {
      const stored = await AsyncStorage.getItem(FAVORITES_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.error('Error getting favorites:', error);
      return [];
    }
  }

  async isFavorite(eventId: string): Promise<boolean> {
    const favorites = await this.getFavorites();
    return favorites.includes(eventId);
  }

  async getFavoriteEvents(): Promise<EventsTypes[]> {
    try {
      const favoriteIds = await this.getFavorites();
      if (favoriteIds.length === 0) return [];
      
      return await getItems<EventsTypes>('events', {
        filter: {
          id: { _in: favoriteIds }
        }
      });
    } catch (error) {
      console.error('Error fetching favorite events:', error);
      return [];
    }
  }

  private async cacheEvents(events: EventsTypes[]): Promise<void> {
    try {
      const cache: EventCache = {
        data: events,
        timestamp: Date.now(),
      };
      await AsyncStorage.setItem(CACHE_KEY, JSON.stringify(cache));
    } catch (error) {
      console.error('Error caching events:', error);
    }
  }

  private async getCachedEvents(): Promise<EventsTypes[] | null> {
    try {
      const cached = await AsyncStorage.getItem(CACHE_KEY);
      if (!cached) return null;

      const cache: EventCache = JSON.parse(cached);
      const isExpired = Date.now() - cache.timestamp > CACHE_EXPIRY;
      
      return isExpired ? null : cache.data;
    } catch (error) {
      console.error('Error getting cached events:', error);
      return null;
    }
  }

  private buildDirectusFilter(filters?: EventFilters): any {
    if (!filters) return {};
    
    const directusFilter: any = {};

    if (filters.eventType) {
      directusFilter.event_type = { _eq: filters.eventType };
    }

    if (filters.dateFrom) {
      directusFilter.start_date_time = { 
        ...directusFilter.start_date_time,
        _gte: filters.dateFrom.toISOString() 
      };
    }

    if (filters.dateTo) {
      directusFilter.start_date_time = { 
        ...directusFilter.start_date_time,
        _lte: filters.dateTo.toISOString() 
      };
    }

    if (filters.location) {
      directusFilter.location = { _contains: filters.location };
    }

    if (filters.organizer) {
      directusFilter.organizer = { _contains: filters.organizer };
    }

    if (filters.status) {
      directusFilter.status = { _eq: filters.status };
    }

    if (filters.search) {
      directusFilter._or = [
        { title: { _contains: filters.search } },
        { description: { _contains: filters.search } },
        { location: { _contains: filters.search } },
        { organizer: { _contains: filters.search } }
      ];
    }

    return directusFilter;
  }

  private applyFilters(events: EventsTypes[], filters?: EventFilters): EventsTypes[] {
    if (!filters) return events;
    
    return events.filter(event => {
      if (filters.eventType && event.event_type !== filters.eventType) return false;
      
      if (filters.dateFrom) {
        const eventDate = new Date(event.start_date_time);
        if (eventDate < filters.dateFrom) return false;
      }
      
      if (filters.dateTo) {
        const eventDate = new Date(event.start_date_time);
        if (eventDate > filters.dateTo) return false;
      }
      
      if (filters.location && !event.location.toLowerCase().includes(filters.location.toLowerCase())) {
        return false;
      }
      
      if (filters.organizer && !event.organizer.toLowerCase().includes(filters.organizer.toLowerCase())) {
        return false;
      }
      
      if (filters.status && event.status !== filters.status) return false;
      
      if (filters.search) {
        const searchLower = filters.search.toLowerCase();
        return (
          event.title.toLowerCase().includes(searchLower) ||
          event.description?.toLowerCase().includes(searchLower) ||
          event.location.toLowerCase().includes(searchLower) ||
          event.organizer.toLowerCase().includes(searchLower)
        );
      }
      
      return true;
    });
  }

  async clearCache(): Promise<void> {
    try {
      await AsyncStorage.removeItem(CACHE_KEY);
    } catch (error) {
      console.error('Error clearing cache:', error);
    }
  }
}

export const eventsService = EventsService.getInstance();
export { EventFilters, EventSubscription };