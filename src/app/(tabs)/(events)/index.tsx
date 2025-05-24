import React, { useState, useEffect, useContext, useCallback, useMemo } from 'react';
import { RefreshControl, SectionList, Dimensions, SectionListData } from 'react-native';
import { getItems } from '@/services/items';
import TranslationContext from "@/contexts/TranslationContext";
import { MaterialIcons } from '@expo/vector-icons';
import colors from "@/constants/colors";
import { EventsTypes } from "@/types/EventsTypes";
import AlertContext from "@/contexts/AlertContext";
import { handleErrors } from "@/utils/directus";
import { HStack } from "@/components/ui/hstack";
import { Box } from "@/components/ui/box";
import { Text } from "@/components/ui/text";
import { Heading } from "@/components/ui/heading";
import { Center } from "@/components/ui/center";
import { Pressable } from "@/components/ui/pressable";
import { Icon } from "@/components/ui/icon";
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import EventCard from '@/components/common/EventCard';
import EventListSkeletons from '@/components/Skeletons/EventListSkeletons';

const { width } = Dimensions.get('window');
const CARD_WIDTH = width * 0.92;

type EventSection = {
    title: string;
    data: EventsTypes[];
    formattedDate: string;
}

const EVENT_TYPE_COLORS = {
    'congresso-geral': ['#4A90E2', '#5E5CE6'],
    'ensaio': ['#F5A623', '#F27121'],
    'palestras': ['#7ED321', '#56AB2F'],
    'cpre-congresso': ['#BD10E0', '#9013FE'],
    'default': ['#50C878', '#00A86B']
} as const;

const EventPage = React.memo(() => {
    const [events, setEvents] = useState<EventSection[]>([]);
    const [isLoadingList, setIsLoadingList] = useState(false);
    const [refreshing, setRefreshing] = useState(false);
    const { t } = useContext(TranslationContext);
    const alert = useContext(AlertContext);

    const loadEvents = useCallback(async () => {
        if (refreshing) return;

        setIsLoadingList(true);
        try {
            const response = await getItems<EventsTypes>('events');

            const sortedEvents = response.sort((a, b) =>
                new Date(a.start_date_time).getTime() - new Date(b.start_date_time).getTime()
            );

            const eventsByDate = sortedEvents.reduce<Record<string, { events: EventsTypes[], formattedDate: string }>>((groups, event) => {
                const eventDate = new Date(event.start_date_time);
                const formattedDate = format(eventDate, "EEEE, dd 'de' MMMM", { locale: ptBR });
                const dateKey = eventDate.toISOString().split('T')[0];

                if (!groups[dateKey]) {
                    groups[dateKey] = {
                        events: [],
                        formattedDate: formattedDate.charAt(0).toUpperCase() + formattedDate.slice(1)
                    };
                }

                groups[dateKey].events.push(event);
                return groups;
            }, {});

            const sections = Object.entries(eventsByDate).map(([dateKey, group]) => ({
                title: dateKey,
                formattedDate: group.formattedDate,
                data: group.events
            }));

            setEvents(sections);
        } catch (error: any) {
            const message = handleErrors(error.errors);
            alert.error(`Erro ao carregar eventos: ${message}`);
        } finally {
            setIsLoadingList(false);
        }
    }, [alert, refreshing]);

    const handleRefresh = useCallback(async () => {
        setRefreshing(true);
        await loadEvents();
        setRefreshing(false);
    }, [loadEvents]);

    useEffect(() => {
        loadEvents();
    }, [loadEvents]);

    const getEventTypeColor = useCallback((eventType: string): string[] => {
        return EVENT_TYPE_COLORS[eventType as keyof typeof EVENT_TYPE_COLORS] || EVENT_TYPE_COLORS.default;
    }, []);

    const renderItem = useCallback(({ item }: { item: EventsTypes }) => {
        const gradientColors = getEventTypeColor(item.event_type);
        return (
            <Box className="w-full px-4">
                <EventCard
                    event={item}
                    gradientColors={gradientColors}
                />
            </Box>
        );
    }, [getEventTypeColor]);

    const renderSectionHeader = useCallback(({ section }: { section: SectionListData<EventsTypes, EventSection> }) => (
        <Box className="bg-white px-5 py-3 mb-2 border-b border-gray-200">
            <HStack className="items-center space-x-2">
                <Icon as={MaterialIcons} name="event" size="sm" className="text-purple-600" />
                <Text className="font-semibold text-base text-gray-800">
                    {section.formattedDate}
                </Text>
            </HStack>
        </Box>
    ), []);

    const renderEmptyComponent = useCallback(() => (
        <Center className="flex-1 p-10">
            <Icon
                as={MaterialIcons}
                name="event-busy"
                size="6xl"
                className="text-gray-300 mb-4"
            />
            <Heading className="text-lg text-gray-600 mb-2">
                {t('text_no_events') || 'Nenhum evento disponível'}
            </Heading>
            <Text className="text-center text-gray-500 mb-6">
                {t('text_no_events_description') || "Não há eventos agendados para este período."}
            </Text>
            <Pressable
                className="bg-purple-600 px-6 py-3 rounded-full"
                onPress={loadEvents}
            >
                <Text className="text-white font-semibold">
                    {t('text_refresh') || "Atualizar"}
                </Text>
            </Pressable>
        </Center>
    ), [t, loadEvents]);

    const keyExtractor = useCallback((item: EventsTypes) => item.id, []);

    const getItemLayout = useCallback((_: any, index: number) => ({
        length: 200,
        offset: 200 * index,
        index,
    }), []);

    const contentContainerStyle = useMemo(() =>
        events.length === 0 ? { flex: 1 } : { paddingBottom: 20 },
        [events.length]
    );

    return (
        <Box className="flex-1 bg-gray-50">
            {isLoadingList ? (
                <EventListSkeletons count={5} />
            ) : (
                <SectionList<EventsTypes, EventSection>
                    sections={events}
                    keyExtractor={keyExtractor}
                    renderItem={renderItem}
                    renderSectionHeader={renderSectionHeader}
                    contentContainerStyle={contentContainerStyle}
                    stickySectionHeadersEnabled={true}
                    refreshControl={
                        <RefreshControl
                            refreshing={refreshing}
                            onRefresh={handleRefresh}
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
        </Box>
    );
});

EventPage.displayName = 'EventPage';

export default EventPage;
