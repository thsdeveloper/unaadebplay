import React, { useContext, useCallback, useMemo, useState } from 'react';
import { RefreshControl, SectionList, Dimensions, SectionListData, ScrollView } from 'react-native';
import TranslationContext from "@/contexts/TranslationContext";
import AuthContext from "@/contexts/AuthContext";
import { MaterialIcons, Ionicons } from '@expo/vector-icons';
import { useThemedColors } from "@/hooks/useThemedColors";
import { EventsTypes } from "@/types/EventsTypes";
import { HStack } from "@/components/ui/hstack";
import { Box } from "@/components/ui/box";
import { Text } from "@/components/ui/text";
import { Heading } from "@/components/ui/heading";
import { Center } from "@/components/ui/center";
import { Pressable } from "@/components/ui/pressable";
import { Icon } from "@/components/ui/icon";
import { VStack } from "@/components/ui/vstack";
import { Badge, BadgeText } from "@/components/ui/badge";
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { LinearGradient } from 'expo-linear-gradient';
import EventCard from '@/components/events/EventCard';
import EventListSkeletons from '@/components/Skeletons/EventListSkeletons';
import EventSearchBar from '@/components/events/EventSearchBar';
import EventFiltersSheet from '@/components/events/EventFiltersSheet';
import { useEvents } from '@/hooks/useEvents';
import { eventsService } from '@/services/events';
import { useFocusEffect } from 'expo-router';

const { width } = Dimensions.get('window');

type EventSection = {
    title: string;
    data: EventsTypes[];
    formattedDate: string;
    isToday?: boolean;
    isPast?: boolean;
}

interface TabItem {
    id: 'all' | 'upcoming' | 'favorites';
    label: string;
    icon: string;
    badge?: number;
}

const EventPage = React.memo(() => {
    const { t } = useContext(TranslationContext);
    const { user } = useContext(AuthContext);
    const [activeTab, setActiveTab] = useState<'all' | 'upcoming' | 'favorites'>('all');
    const [favoriteEvents, setFavoriteEvents] = useState<Set<string>>(new Set());
    const [showFilters, setShowFilters] = useState(false);
    
    const {
        events,
        loading,
        refreshing,
        refresh,
        searchEvents,
        applyFilters,
        clearFilters,
        activeFilters,
    } = useEvents({ autoLoad: true });

    const loadFavorites = useCallback(async () => {
        try {
            const favorites = await eventsService.getFavorites();
            setFavoriteEvents(new Set(favorites));
        } catch (error) {
            console.error('Error loading favorites:', error);
        }
    }, []);

    useFocusEffect(
        useCallback(() => {
            loadFavorites();
        }, [])
    );

    const handleFavoriteToggle = useCallback(async (eventId: string) => {
        try {
            if (favoriteEvents.has(eventId)) {
                await eventsService.removeFromFavorites(eventId);
                setFavoriteEvents(prev => {
                    const newSet = new Set(prev);
                    newSet.delete(eventId);
                    return newSet;
                });
            } else {
                await eventsService.addToFavorites(eventId);
                setFavoriteEvents(prev => new Set(prev).add(eventId));
            }
        } catch (error) {
            console.error('Error toggling favorite:', error);
        }
    }, [favoriteEvents]);

    const filteredEvents = useMemo(() => {
        let filtered = events;
        
        if (activeTab === 'upcoming') {
            const now = new Date();
            filtered = events.filter(event => new Date(event.start_date_time) >= now);
        } else if (activeTab === 'favorites') {
            filtered = events.filter(event => favoriteEvents.has(event.id));
        }
        
        return filtered;
    }, [events, activeTab, favoriteEvents]);
    
    const sections = useMemo<EventSection[]>(() => {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        const eventsByDate = filteredEvents.reduce<Record<string, { events: EventsTypes[], formattedDate: string, date: Date }>>((groups, event) => {
            const eventDate = new Date(event.start_date_time);
            const formattedDate = format(eventDate, "EEEE, dd 'de' MMMM", { locale: ptBR });
            const dateKey = eventDate.toISOString().split('T')[0];

            if (!groups[dateKey]) {
                groups[dateKey] = {
                    events: [],
                    formattedDate: formattedDate.charAt(0).toUpperCase() + formattedDate.slice(1),
                    date: eventDate
                };
            }

            groups[dateKey].events.push(event);
            return groups;
        }, {});

        return Object.entries(eventsByDate)
            .sort(([, a], [, b]) => a.date.getTime() - b.date.getTime())
            .map(([dateKey, group]) => {
                const sectionDate = new Date(dateKey);
                sectionDate.setHours(0, 0, 0, 0);
                
                return {
                    title: dateKey,
                    formattedDate: group.formattedDate,
                    data: group.events,
                    isToday: sectionDate.getTime() === today.getTime(),
                    isPast: sectionDate < today
                };
            });
    }, [filteredEvents]);

    const tabs = useMemo<TabItem[]>(() => [
        { id: 'all', label: t('all_events') || 'Todos', icon: 'event' },
        { id: 'upcoming', label: t('upcoming_events') || 'Próximos', icon: 'update' },
        { id: 'favorites', label: t('favorite_events') || 'Favoritos', icon: 'favorite', badge: favoriteEvents.size },
    ], [t, favoriteEvents.size]);
    
    const renderItem = useCallback(({ item }: { item: EventsTypes }) => (
        <EventCard
            event={item}
            isFavorite={favoriteEvents.has(item.id)}
            onFavoriteToggle={handleFavoriteToggle}
        />
    ), [favoriteEvents, handleFavoriteToggle]);

    const renderSectionHeader = useCallback(({ section }: { section: SectionListData<EventsTypes, EventSection> }) => (
        <Box className={`px-5 py-3 mb-2 ${section.isPast ? 'bg-gray-100' : 'bg-white'}`}>
            <HStack className="items-center space-x-2">
                <Icon 
                    as={MaterialIcons} 
                    name={section.isToday ? "today" : "event"} 
                    size="sm" 
                    className={section.isToday ? "text-purple-600" : section.isPast ? "text-gray-500" : "text-gray-700"} 
                />
                <Text className={`font-semibold text-base ${section.isToday ? "text-purple-700" : section.isPast ? "text-gray-600" : "text-gray-800"}`}>
                    {section.isToday ? `Hoje - ${section.formattedDate}` : section.formattedDate}
                </Text>
                {section.isToday && (
                    <Badge className="bg-purple-100">
                        <BadgeText className="text-purple-700 text-xs">Hoje</BadgeText>
                    </Badge>
                )}
            </HStack>
        </Box>
    ), []);

    const renderEmptyComponent = useCallback(() => {
        const emptyMessages = {
            all: {
                title: t('text_no_events') || 'Nenhum evento disponível',
                description: t('text_no_events_description') || 'Não há eventos agendados.',
                icon: 'event-busy',
            },
            upcoming: {
                title: t('no_upcoming_events') || 'Sem eventos próximos',
                description: t('no_upcoming_events_desc') || 'Não há eventos futuros agendados.',
                icon: 'schedule',
            },
            favorites: {
                title: t('no_favorite_events') || 'Sem favoritos',
                description: t('no_favorite_events_desc') || 'Você ainda não adicionou eventos aos favoritos.',
                icon: 'favorite-border',
            },
        };
        
        const message = emptyMessages[activeTab];
        
        return (
            <Center className="flex-1 p-10">
                <Box className="bg-gray-100 rounded-full p-6 mb-6">
                    <Icon
                        as={MaterialIcons}
                        name={message.icon as any}
                        size="6xl"
                        className="text-gray-400"
                    />
                </Box>
                <Heading className="text-lg text-gray-700 mb-2 text-center">
                    {message.title}
                </Heading>
                <Text className="text-center text-gray-500 mb-6 px-4">
                    {message.description}
                </Text>
                {activeTab === 'all' && (
                    <Pressable
                        className="bg-purple-600 px-6 py-3 rounded-full"
                        onPress={refresh}
                    >
                        <HStack className="items-center space-x-2">
                            <Icon as={MaterialIcons} name="refresh" size="sm" className="text-white" />
                            <Text className="text-white font-semibold">
                                {t('text_refresh') || "Atualizar"}
                            </Text>
                        </HStack>
                    </Pressable>
                )}
            </Center>
        );
    }, [t, activeTab, refresh]);

    const keyExtractor = useCallback((item: EventsTypes) => item.id, []);

    const getItemLayout = useCallback((_: any, index: number) => ({
        length: 300,
        offset: 300 * index,
        index,
    }), []);

    const contentContainerStyle = useMemo(() =>
        sections.length === 0 ? { flex: 1 } : { paddingBottom: 100 },
        [sections.length]
    );
    
    const ListHeaderComponent = useCallback(() => (
        <VStack className="bg-white pt-4">
            <EventSearchBar onSearch={searchEvents} />
            
            {Object.keys(activeFilters).filter(key => activeFilters[key as keyof typeof activeFilters]).length > 0 && (
                <ScrollView horizontal showsHorizontalScrollIndicator={false} className="px-4 mb-2">
                    <HStack className="space-x-2">
                        {activeFilters.eventType && (
                            <Badge variant="outline" className="border-purple-600">
                                <BadgeText className="text-purple-600 text-xs">
                                    {activeFilters.eventType}
                                </BadgeText>
                            </Badge>
                        )}
                        {activeFilters.status && (
                            <Badge variant="outline" className="border-purple-600">
                                <BadgeText className="text-purple-600 text-xs">
                                    {activeFilters.status}
                                </BadgeText>
                            </Badge>
                        )}
                        {activeFilters.location && (
                            <Badge variant="outline" className="border-purple-600">
                                <BadgeText className="text-purple-600 text-xs">
                                    {activeFilters.location}
                                </BadgeText>
                            </Badge>
                        )}
                        {activeFilters.dateFrom && (
                            <Badge variant="outline" className="border-purple-600">
                                <BadgeText className="text-purple-600 text-xs">
                                    Desde {new Date(activeFilters.dateFrom).toLocaleDateString()}
                                </BadgeText>
                            </Badge>
                        )}
                        <Pressable onPress={clearFilters}>
                            <Badge className="bg-gray-200">
                                <HStack className="items-center space-x-1">
                                    <Icon as={MaterialIcons} name="clear" size="xs" className="text-gray-600" />
                                    <BadgeText className="text-gray-600 text-xs">Limpar</BadgeText>
                                </HStack>
                            </Badge>
                        </Pressable>
                    </HStack>
                </ScrollView>
            )}
            
            <ScrollView horizontal showsHorizontalScrollIndicator={false} className="px-4 mb-6">
                <HStack className="space-x-3" space={'sm'}>
                    {tabs.map(tab => (
                        <Pressable
                            key={tab.id}
                            onPress={() => setActiveTab(tab.id)}
                            className={`px-4 py-2 rounded-full flex-row items-center space-x-2 ${
                                activeTab === tab.id ? 'bg-purple-600' : 'bg-gray-100'
                            }`}
                        >
                            <Icon
                                as={MaterialIcons}
                                name={tab.icon as any}
                                size="sm"
                                className={` ${
                                    activeTab === tab.id ? 'text-amber-600' : 'text-gray-600'
                                }`}
                            />
                            <Text
                                className={`font-medium ml-2 ${
                                    activeTab === tab.id ? 'text-white' : 'text-gray-700'
                                }`}
                            >
                                {tab.label}
                            </Text>
                            {tab.badge && tab.badge > 0 && (
                                <Badge className={activeTab === tab.id ? 'bg-white' : 'bg-purple-600'}>
                                    <BadgeText className={activeTab === tab.id ? 'text-purple-600 text-xs' : 'text-white text-xs'}>
                                        {tab.badge}
                                    </BadgeText>
                                </Badge>
                            )}
                        </Pressable>
                    ))}
                </HStack>
            </ScrollView>
        </VStack>
    ), [tabs, activeTab, searchEvents, applyFilters, activeFilters, clearFilters]);

    return (
        <Box className="flex-1 bg-gray-50">
            <LinearGradient
                    colors={['#7c3aed', '#6d28d9']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={{ paddingTop: 50, paddingBottom: 20 }}
                >
                    <VStack className="px-5">
                        <HStack className="items-center justify-between">
                            <VStack className="flex-1">
                                <Heading className="text-2xl font-bold text-white mb-2">
                                    {t('events_title') || 'Eventos'}
                                </Heading>
                                <Text className="text-purple-100">
                                    {t('events_subtitle') || 'Descubra e participe dos próximos eventos'}
                                </Text>
                            </VStack>
                            <Pressable
                                onPress={() => setShowFilters(true)}
                                className="bg-white/20 rounded-full p-3 relative"
                            >
                                <Icon as={MaterialIcons} name="filter-list" size="sm" className="text-white" />
                                {Object.keys(activeFilters).filter(key => activeFilters[key as keyof typeof activeFilters]).length > 0 && (
                                    <Badge className="absolute -top-1 -right-1 bg-red-500 min-w-[20px] h-5 items-center justify-center">
                                        <BadgeText className="text-white text-xs">
                                            {Object.keys(activeFilters).filter(key => activeFilters[key as keyof typeof activeFilters]).length}
                                        </BadgeText>
                                    </Badge>
                                )}
                            </Pressable>
                        </HStack>
                    </VStack>
                </LinearGradient>
            
            {loading && sections.length === 0 ? (
                <EventListSkeletons count={5} />
            ) : (
                <SectionList<EventsTypes, EventSection>
                    sections={sections}
                    keyExtractor={keyExtractor}
                    renderItem={renderItem}
                    renderSectionHeader={renderSectionHeader}
                    ListHeaderComponent={ListHeaderComponent}
                    contentContainerStyle={contentContainerStyle}
                    stickySectionHeadersEnabled={true}
                    refreshControl={
                        <RefreshControl
                            refreshing={refreshing}
                            onRefresh={refresh}
                            tintColor={colors.secundary}
                            colors={[colors.secundary]}
                        />
                    }
                    ListEmptyComponent={renderEmptyComponent}
                    getItemLayout={getItemLayout}
                    removeClippedSubviews={true}
                    maxToRenderPerBatch={10}
                    updateCellsBatchingPeriod={50}
                    windowSize={10}
                    initialNumToRender={5}
                />
            )}
            
            <EventFiltersSheet
                isOpen={showFilters}
                onClose={() => setShowFilters(false)}
                onApplyFilters={applyFilters}
                activeFilters={activeFilters}
                onClearFilters={clearFilters}
            />
        </Box>
    );
});

EventPage.displayName = 'EventPage';

export default EventPage;
