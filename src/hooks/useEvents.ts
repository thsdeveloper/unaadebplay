import { useState, useEffect, useCallback, useMemo, useContext } from 'react';
import { eventsService, EventFilters } from '@/services/events';
import { EventsTypes } from '@/types/EventsTypes';
import AlertContext from '@/contexts/AlertContext';
import AuthContext from '@/contexts/AuthContext';
import { handleErrors } from '@/utils/directus';

interface UseEventsOptions {
  filters?: EventFilters;
  autoLoad?: boolean;
  initialData?: EventsTypes[];
}

interface UseEventsReturn {
  events: EventsTypes[];
  loading: boolean;
  error: string | null;
  refreshing: boolean;
  loadEvents: (forceRefresh?: boolean) => Promise<void>;
  refresh: () => Promise<void>;
  searchEvents: (query: string) => Promise<void>;
  applyFilters: (filters: EventFilters) => void;
  clearFilters: () => void;
  activeFilters: EventFilters;
}

export const useEvents = (options: UseEventsOptions = {}): UseEventsReturn => {
  const { filters: initialFilters = {}, autoLoad = true, initialData = [] } = options;
  
  const [events, setEvents] = useState<EventsTypes[]>(initialData);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeFilters, setActiveFilters] = useState<EventFilters>(initialFilters);
  
  const alert = useContext(AlertContext);

  const loadEvents = useCallback(async (forceRefresh = false) => {
    if (loading) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const data = await eventsService.getEvents(activeFilters, forceRefresh);
      setEvents(data);
    } catch (err: any) {
      const message = handleErrors(err.errors);
      setError(message);
      alert.error(`Erro ao carregar eventos: ${message}`);
    } finally {
      setLoading(false);
    }
  }, [activeFilters, loading, alert]);

  const refresh = useCallback(async () => {
    setRefreshing(true);
    await loadEvents(true);
    setRefreshing(false);
  }, [loadEvents]);

  const searchEvents = useCallback(async (query: string) => {
    setActiveFilters(prev => ({ ...prev, search: query }));
  }, []);

  const applyFilters = useCallback((filters: EventFilters) => {
    setActiveFilters(prev => ({ ...prev, ...filters }));
  }, []);

  const clearFilters = useCallback(() => {
    setActiveFilters({});
  }, []);

  useEffect(() => {
    if (autoLoad) {
      loadEvents();
    }
  }, [activeFilters, autoLoad]);

  return {
    events,
    loading,
    error,
    refreshing,
    loadEvents,
    refresh,
    searchEvents,
    applyFilters,
    clearFilters,
    activeFilters,
  };
};

interface UseEventDetailsOptions {
  eventId: string;
  autoLoad?: boolean;
}

interface UseEventDetailsReturn {
  event: EventsTypes | null;
  loading: boolean;
  error: string | null;
  isSubscribed: boolean;
  isFavorite: boolean;
  loadEvent: () => Promise<void>;
  subscribe: () => Promise<void>;
  unsubscribe: () => Promise<void>;
  toggleFavorite: () => Promise<void>;
  subscribing: boolean;
}

export const useEventDetails = (options: UseEventDetailsOptions): UseEventDetailsReturn => {
  const { eventId, autoLoad = true } = options;
  
  const [event, setEvent] = useState<EventsTypes | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);
  const [subscribing, setSubscribing] = useState(false);
  
  const alert = useContext(AlertContext);
  const { user } = useContext(AuthContext);

  const loadEvent = useCallback(async () => {
    if (!eventId || loading) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const [eventData, subscribed, favorite] = await Promise.all([
        eventsService.getEventById(eventId),
        user?.id ? eventsService.isUserSubscribed(eventId, user.id) : false,
        eventsService.isFavorite(eventId),
      ]);
      
      setEvent(eventData);
      setIsSubscribed(subscribed);
      setIsFavorite(favorite);
    } catch (err: any) {
      const message = handleErrors(err.errors);
      setError(message);
      alert.error(`Erro ao carregar evento: ${message}`);
    } finally {
      setLoading(false);
    }
  }, [eventId, user?.id, loading, alert]);

  const subscribe = useCallback(async () => {
    if (!user?.id || !eventId || subscribing) return;
    
    setSubscribing(true);
    try {
      await eventsService.subscribeToEvent(eventId, user.id);
      setIsSubscribed(true);
      alert.success('Inscrição realizada com sucesso!');
    } catch (err: any) {
      const message = handleErrors(err.errors);
      alert.error(`Erro ao inscrever: ${message}`);
    } finally {
      setSubscribing(false);
    }
  }, [eventId, user?.id, subscribing, alert]);

  const unsubscribe = useCallback(async () => {
    // TODO: Implementar quando tivermos ID da inscrição
    alert.info('Funcionalidade em desenvolvimento');
  }, [alert]);

  const toggleFavorite = useCallback(async () => {
    if (!eventId) return;
    
    try {
      if (isFavorite) {
        await eventsService.removeFromFavorites(eventId);
        setIsFavorite(false);
        alert.success('Removido dos favoritos');
      } else {
        await eventsService.addToFavorites(eventId);
        setIsFavorite(true);
        alert.success('Adicionado aos favoritos');
      }
    } catch (err: any) {
      alert.error('Erro ao atualizar favoritos');
    }
  }, [eventId, isFavorite, alert]);

  useEffect(() => {
    if (autoLoad) {
      loadEvent();
    }
  }, [eventId, autoLoad]);

  return {
    event,
    loading,
    error,
    isSubscribed,
    isFavorite,
    loadEvent,
    subscribe,
    unsubscribe,
    toggleFavorite,
    subscribing,
  };
};

interface UseEventFiltersReturn {
  eventTypes: string[];
  locations: string[];
  organizers: string[];
  loading: boolean;
}

export const useEventFilters = (): UseEventFiltersReturn => {
  const [eventTypes, setEventTypes] = useState<string[]>([]);
  const [locations, setLocations] = useState<string[]>([]);
  const [organizers, setOrganizers] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  const loadFilterOptions = useCallback(async () => {
    setLoading(true);
    try {
      const events = await eventsService.getEvents();
      
      const uniqueTypes = [...new Set(events.map(e => e.event_type).filter(Boolean))];
      const uniqueLocations = [...new Set(events.map(e => e.location).filter(Boolean))];
      const uniqueOrganizers = [...new Set(events.map(e => e.organizer).filter(Boolean))];
      
      setEventTypes(uniqueTypes);
      setLocations(uniqueLocations);
      setOrganizers(uniqueOrganizers);
    } catch (error) {
      console.error('Error loading filter options:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadFilterOptions();
  }, []);

  return {
    eventTypes,
    locations,
    organizers,
    loading,
  };
};

export const useUpcomingEvents = (limit = 5) => {
  const [events, setEvents] = useState<EventsTypes[]>([]);
  const [loading, setLoading] = useState(false);
  const alert = useContext(AlertContext);

  const loadUpcomingEvents = useCallback(async () => {
    setLoading(true);
    try {
      const data = await eventsService.getUpcomingEvents(limit);
      setEvents(data);
    } catch (err: any) {
      const message = handleErrors(err.errors);
      alert.error(`Erro ao carregar próximos eventos: ${message}`);
    } finally {
      setLoading(false);
    }
  }, [limit, alert]);

  useEffect(() => {
    loadUpcomingEvents();
  }, []);

  return { events, loading, refresh: loadUpcomingEvents };
};

export const useFavoriteEvents = () => {
  const [events, setEvents] = useState<EventsTypes[]>([]);
  const [loading, setLoading] = useState(false);
  const alert = useContext(AlertContext);

  const loadFavoriteEvents = useCallback(async () => {
    setLoading(true);
    try {
      const data = await eventsService.getFavoriteEvents();
      setEvents(data);
    } catch (err: any) {
      alert.error('Erro ao carregar eventos favoritos');
    } finally {
      setLoading(false);
    }
  }, [alert]);

  useEffect(() => {
    loadFavoriteEvents();
  }, []);

  return { events, loading, refresh: loadFavoriteEvents };
};