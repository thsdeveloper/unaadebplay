// (tabs)/(events)/notifications.tsx
import React, { useState, useEffect, useContext } from 'react';
import { RefreshControl, SectionList, Dimensions } from 'react-native';
import { getItems } from '@/services/items';
import TranslationContext from "@/contexts/TranslationContext";
import { MaterialIcons } from '@expo/vector-icons';
import colors from "@/constants/colors";
import SkeletonItem from "@/components/SkeletonItem";
import { EventsTypes } from "@/types/EventsTypes";
import AlertContext from "@/contexts/AlertContext";
import { handleErrors } from "@/utils/directus";
import { HStack } from "@/components/ui/hstack";
import { Box } from "@/components/ui/box";
import { VStack } from "@/components/ui/vstack";
import { Spinner } from "@/components/ui/spinner";
import { Text } from "@/components/ui/text";
import { Heading } from "@/components/ui/heading";
import { Center } from "@/components/ui/center";
import { Pressable } from "@/components/ui/pressable";
import { Icon } from "@/components/ui/icon";
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import EventCard from '@/components/common/EventCard';

const { width } = Dimensions.get('window');
const cardWidth = width * 0.92;

const EventPage = () => {
    const [events, setEvents] = useState<Array<{ title: string, data: EventsTypes[], formattedDate: string }>>([]);
    const [isLoadingItemList, setIsLoadingItemList] = useState(false);
    const [isLoadingList, setIsLoadingList] = useState(false);
    const [refreshing, setRefreshing] = useState<boolean>(false);
    const { t } = useContext(TranslationContext);
    const alert = useContext(AlertContext);

    const loadEvents = async () => {
        setIsLoadingList(true);
        try {
            let response = await getItems<EventsTypes>('events');
            // Ordena os eventos por start_date_time
            response.sort((a, b) => new Date(a.start_date_time).getTime() - new Date(b.start_date_time).getTime());

            // Agrupe os eventos por start_date_time
            const eventsByDate = response.reduce((groups, event) => {
                const eventDate = new Date(event.start_date_time);
                const formattedDate = format(eventDate, "EEEE, dd 'de' MMMM", { locale: ptBR });
                const dateKey = eventDate.toISOString().split('T')[0];

                if (!groups[dateKey]) {
                    groups[dateKey] = {
                        events: [],
                        formattedDate: formattedDate.charAt(0).toUpperCase() + formattedDate.slice(1) // Capitalize
                    };
                }

                groups[dateKey].events.push(event);
                return groups;
            }, {});

            // Converta o objeto groups em um array de seções
            const sections = Object.keys(eventsByDate).map(dateKey => ({
                title: dateKey,
                formattedDate: eventsByDate[dateKey].formattedDate,
                data: eventsByDate[dateKey].events
            }));

            setEvents(sections);
        } catch (e) {
            const message = handleErrors(e.errors);
            alert.error(`Error: ${message}`);
        } finally {
            setIsLoadingList(false);
        }
    };

    useEffect(() => {
        loadEvents();
    }, []);

    // Função para obter a cor baseada no tipo de evento
    const getEventTypeColor = (eventType: string) => {
        console.log('eventType', eventType)
        switch (eventType) {
            case 'congresso-geral':
                return ['#4A90E2', '#5E5CE6'];
            case 'ensaio':
                return ['#F5A623', '#F27121'];
            case 'palestras':
                return ['#7ED321', '#56AB2F'];
            case 'cpre-congresso':
                return ['#BD10E0', '#9013FE'];
            default:
                return ['#50C878', '#00A86B'];
        }
    };

    const renderItem = ({ item }: { item: EventsTypes }) => {
        const gradientColors = getEventTypeColor(item.event_type);
        return (
            <Box width={cardWidth} alignSelf="center">
                <EventCard
                    event={item}
                    gradientColors={gradientColors}
                />
            </Box>
        );
    };

    const renderSectionHeader = ({ section }: { section: any }) => (
        <Box className="bg-neutral-100 px-5 py-4 mb-2">
            <HStack space={2} alignItems="center">
                <Icon as={MaterialIcons} name="event" size="sm" color={colors.secundary} />
                <Text fontWeight="bold" color={colors.secundary}>
                    {section.formattedDate}
                </Text>
            </HStack>
        </Box>
    );

    const renderEmptyComponent = () => (
        <Center flex={1} p={10}>
            <Icon
                as={MaterialIcons}
                name="event-busy"
                size="6xl"
                color="gray.300"
            />
            <Heading size="sm" color="gray.400" mt={4}>
                {t('text_no_events')}
            </Heading>
            <Text textAlign="center" mt={2} color="gray.500">
                {t('text_no_events_description') || "Não há eventos agendados para este período."}
            </Text>
            <Pressable
                mt={6}
                bg={colors.secundary}
                px={6}
                py={2}
                borderRadius="full"
                onPress={loadEvents}
            >
                <Text color="white" fontWeight="bold">
                    {t('text_refresh') || "Atualizar"}
                </Text>
            </Pressable>
        </Center>
    );

    // Componente de overlay de carregamento
    const LoadingOverlay = () => (
        <Box
            position="absolute"
            top={0}
            bottom={0}
            left={0}
            right={0}
            justifyContent="center"
            alignItems="center"
            zIndex={999}
            bg="rgba(0, 0, 0, 0.7)"
        >
            <VStack space={3} alignItems="center">
                <Spinner size="lg" color="white" />
                <Text color="white" fontWeight="medium">
                    {t('text_loading') || "Carregando..."}
                </Text>
            </VStack>
        </Box>
    );

    return (
        <Box className="trueGray.50">
            {/* Conteúdo principal */}
            {isLoadingList ? (
                <Box flex={1} justifyContent="center" p={4}>
                    <SkeletonItem count={3} />
                </Box>
            ) : (
                <SectionList
                    sections={events}
                    keyExtractor={(item) => item.id}
                    renderItem={renderItem}
                    renderSectionHeader={renderSectionHeader}
                    contentContainerStyle={events.length === 0 ? { flex: 1 } : { paddingBottom: 20 }}
                    stickySectionHeadersEnabled={true}
                    refreshControl={
                        <RefreshControl
                            title={t('text_refreshing') || "Atualizando..."}
                            tintColor={colors.secundary}
                            colors={[colors.secundary]}
                            refreshing={refreshing}
                            onRefresh={loadEvents}
                        />
                    }
                    ListEmptyComponent={renderEmptyComponent}
                />
            )}

            {/* Loading Overlay */}
            {isLoadingItemList && <LoadingOverlay />}
        </Box>
    );
};

export default EventPage;
