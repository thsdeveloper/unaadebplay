import React, { useContext, useCallback, useMemo, useState, useEffect } from 'react';
import { ActivityIndicator, Share, Platform, Linking, ScrollView } from 'react-native';
import { EventsTypes } from "@/types/EventsTypes";
import { getUser } from "@/services/user";
import { UserTypes } from "@/types/UserTypes";
import AlertContext from "@/contexts/AlertContext";
import AuthContext from "@/contexts/AuthContext";
import TranslationContext from "@/contexts/TranslationContext";
import { Text } from "@/components/ui/text";
import { Heading } from "@/components/ui/heading";
import { MaterialCommunityIcons, Ionicons, MaterialIcons } from '@expo/vector-icons';
import { useGlobalSearchParams, Stack, useRouter } from "expo-router";
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Box } from "@/components/ui/box";
import { VStack } from "@/components/ui/vstack";
import { HStack } from "@/components/ui/hstack";
import { Badge, BadgeText } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import { Center } from "@/components/ui/center";
import { Avatar, AvatarImage, AvatarFallbackText } from "@/components/ui/avatar";
import { Divider } from "@/components/ui/divider";
import { Pressable } from "@/components/ui/pressable";
import { LinearGradient } from 'expo-linear-gradient';
import { DirectusImage } from '@/components/DirectusImage';
import { useEventDetails } from '@/hooks/useEvents';
import * as Calendar from 'expo-calendar';
import { Modal, ModalBackdrop, ModalContent, ModalHeader, ModalCloseButton, ModalBody, ModalFooter } from '@/components/ui/modal';
import { eventsService } from '@/services/events';
import EventCard from '@/components/events/EventCard';

const EventDetailsPage = React.memo(() => {
    const { id } = useGlobalSearchParams();
    const router = useRouter();
    const { t } = useContext(TranslationContext);
    const { user } = useContext(AuthContext);
    const alert = useContext(AlertContext);
    
    const [organizer, setOrganizer] = useState<UserTypes | null>(null);
    const [showShareModal, setShowShareModal] = useState(false);
    const [relatedEvents, setRelatedEvents] = useState<EventsTypes[]>([]);
    
    const {
        event,
        loading,
        isSubscribed,
        isFavorite,
        subscribe,
        toggleFavorite,
        subscribing,
    } = useEventDetails({ eventId: id as string });

    const loadAdditionalData = useCallback(async () => {
        if (!event) return;
        
        try {
            const [organizerData, related] = await Promise.all([
                getUser(event.organizer),
                eventsService.getEvents({
                    eventType: event.event_type,
                }).then(events => events.filter(e => e.id !== event.id).slice(0, 3))
            ]);
            
            setOrganizer(organizerData);
            setRelatedEvents(related);
        } catch (error) {
            console.error('Error loading additional data:', error);
        }
    }, [event]);
    
    useEffect(() => {
        if (event) {
            loadAdditionalData();
        }
    }, [event, loadAdditionalData]);

    const getInitials = useCallback((name: string): string => {
        return name
            .split(' ')
            .map(part => part.charAt(0))
            .join('')
            .toUpperCase()
            .substring(0, 2);
    }, []);
    
    const eventTypeConfig = useMemo(() => {
        const configs: Record<string, { label: string; colors: string[]; icon: string }> = {
            'congresso-geral': {
                label: 'Congresso Geral',
                colors: ['#4A90E2', '#5E5CE6'],
                icon: 'groups',
            },
            'ensaio': {
                label: 'Ensaio',
                colors: ['#F5A623', '#F27121'],
                icon: 'music-note',
            },
            'palestras': {
                label: 'Palestras',
                colors: ['#7ED321', '#56AB2F'],
                icon: 'school',
            },
            'cpre-congresso': {
                label: 'Pré-Congresso',
                colors: ['#BD10E0', '#9013FE'],
                icon: 'event',
            },
        };
        
        return configs[event?.event_type || ''] || {
            label: 'Evento',
            colors: ['#50C878', '#00A86B'],
            icon: 'event',
        };
    }, [event]);

    const formattedDateTime = useMemo(() => {
        if (!event) return { date: '', startTime: '', endTime: null, duration: null };
        
        const startDate = new Date(event.start_date_time);
        const endDate = event.end_date_time ? new Date(event.end_date_time) : null;
        
        return {
            date: format(startDate, "EEEE, dd 'de' MMMM 'de' yyyy", { locale: ptBR }),
            startTime: format(startDate, 'HH:mm'),
            endTime: endDate ? format(endDate, 'HH:mm') : null,
            duration: endDate ? 
                `${Math.round((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60))}h` : 
                null
        };
    }, [event]);

    const handleShare = useCallback(async () => {
        if (!event) return;
        
        try {
            const message = `${event.title}\n${formattedDateTime.date} às ${formattedDateTime.startTime}\n${event.location}\n\nConfira mais detalhes no app UNAADEB!`;
            
            await Share.share({
                message,
                title: event.title,
            });
        } catch (error) {
            console.error('Error sharing:', error);
        }
    }, [event, formattedDateTime]);
    
    const addToCalendar = useCallback(async () => {
        if (!event) return;
        
        try {
            const { status } = await Calendar.requestCalendarPermissionsAsync();
            if (status !== 'granted') {
                alert.error(t('calendar_permission_denied') || 'Permissão para acessar calendário negada');
                return;
            }
            
            const calendars = await Calendar.getCalendarsAsync(Calendar.EntityTypes.EVENT);
            const defaultCalendar = calendars.find(cal => cal.isPrimary) || calendars[0];
            
            if (!defaultCalendar) {
                alert.error(t('no_calendar_found') || 'Nenhum calendário encontrado');
                return;
            }
            
            const eventData = {
                title: event.title,
                startDate: new Date(event.start_date_time),
                endDate: event.end_date_time ? new Date(event.end_date_time) : new Date(event.start_date_time),
                location: event.location,
                notes: event.description,
                calendarId: defaultCalendar.id,
            };
            
            await Calendar.createEventAsync(defaultCalendar.id, eventData);
            alert.success(t('event_added_to_calendar') || 'Evento adicionado ao calendário!');
        } catch (error) {
            console.error('Error adding to calendar:', error);
            alert.error(t('error_adding_to_calendar') || 'Erro ao adicionar ao calendário');
        }
    }, [event, alert, t]);
    
    const openInMaps = useCallback(() => {
        if (!event?.location) return;
        
        const encodedLocation = encodeURIComponent(event.location);
        const url = Platform.select({
            ios: `maps:0,0?q=${encodedLocation}`,
            android: `geo:0,0?q=${encodedLocation}`,
        });
        
        if (url) {
            Linking.openURL(url).catch(() => {
                const webUrl = `https://www.google.com/maps/search/?api=1&query=${encodedLocation}`;
                Linking.openURL(webUrl);
            });
        }
    }, [event]);

    if (loading) {
        return (
            <>
                <Stack.Screen
                    options={{
                        title: t('event_details') || 'Detalhes do Evento',
                        headerBackTitle: t('back') || 'Voltar',
                        headerShown: true,
                        headerStyle: { backgroundColor: '#7c3aed' },
                        headerTintColor: '#fff',
                        headerTitleStyle: { fontWeight: 'bold' },
                    }}
                />
                <Center className="flex-1 bg-gray-50">
                    <ActivityIndicator size="large" color="#7c3aed" />
                    <Text className="mt-2 text-gray-600">
                        {t('loading_event') || 'Carregando evento...'}
                    </Text>
                </Center>
            </>
        );
    }

    return (
        <>
            <Stack.Screen
                options={{
                    title: '',
                    headerTransparent: true,
                    headerStyle: {
                        backgroundColor: 'transparent',
                    },
                    headerLeft: () => (
                        <Pressable
                            onPress={() => router.back()}
                            className="bg-black/20 rounded-full p-2 ml-4"
                        >
                            <Icon as={MaterialIcons} name="arrow-back" size="sm" className="text-white" />
                        </Pressable>
                    ),
                    headerRight: () => (
                        <HStack className="space-x-2 mr-4">
                            <Pressable
                                onPress={handleShare}
                                className="bg-black/20 rounded-full p-2"
                            >
                                <Icon as={MaterialIcons} name="share" size="sm" className="text-white" />
                            </Pressable>
                            <Pressable
                                onPress={toggleFavorite}
                                className="bg-black/20 rounded-full p-2"
                            >
                                <Icon
                                    as={MaterialIcons}
                                    name={isFavorite ? 'favorite' : 'favorite-border'}
                                    size="sm"
                                    className={isFavorite ? 'text-red-500' : 'text-white'}
                                />
                            </Pressable>
                        </HStack>
                    ),
                }}
            />
            
            <ScrollView className="flex-1 bg-gray-50">
                <Box className="relative">
                    {event?.image_cover ? (
                        <DirectusImage
                            assetId={event.image_cover}
                            preset="event-detail"
                            style={{ height: 300, width: '100%' }}
                        />
                    ) : (
                        <LinearGradient
                            colors={eventTypeConfig.colors}
                            style={{ height: 300, width: '100%', justifyContent: 'center', alignItems: 'center' }}
                        >
                            <Icon
                                as={MaterialIcons}
                                name={eventTypeConfig.icon as any}
                                size="6xl"
                                className="text-white opacity-50"
                            />
                        </LinearGradient>
                    )}
                    
                    <LinearGradient
                        colors={['transparent', 'rgba(0,0,0,0.8)']}
                        style={{
                            position: 'absolute',
                            bottom: 0,
                            left: 0,
                            right: 0,
                            height: 150,
                            justifyContent: 'flex-end',
                            paddingHorizontal: 20,
                            paddingBottom: 20,
                        }}
                    >
                        <Badge variant="solid" className="bg-white/20 self-start mb-3">
                            <HStack className="items-center space-x-1">
                                <Icon
                                    as={MaterialIcons}
                                    name={eventTypeConfig.icon as any}
                                    size="xs"
                                    className="text-white"
                                />
                                <BadgeText className="text-white text-xs">{eventTypeConfig.label}</BadgeText>
                            </HStack>
                        </Badge>
                        <Heading className="text-3xl font-bold text-white mb-2">
                            {event?.title}
                        </Heading>
                        {event?.subtitle && (
                            <Text className="text-lg text-gray-200">
                                {event.subtitle}
                            </Text>
                        )}
                    </LinearGradient>
                </Box>

                <VStack className="p-4 space-y-4">
                    <HStack className="space-x-3">
                        {!isSubscribed ? (
                            <Button
                                className="flex-1 bg-purple-600 py-3 rounded-xl"
                                onPress={subscribe}
                                isDisabled={subscribing}
                            >
                                <HStack className="items-center justify-center space-x-2">
                                    <Icon as={MaterialCommunityIcons} name="calendar-check" size="sm" className="text-white" />
                                    <Text className="text-white font-semibold text-base">
                                        {subscribing ? t('subscribing') || 'Inscrevendo...' : t('subscribe_now') || 'Inscrever-se'}
                                    </Text>
                                </HStack>
                            </Button>
                        ) : (
                            <Box className="flex-1 bg-green-50 border border-green-200 rounded-xl p-4">
                                <HStack className="items-center justify-center space-x-2">
                                    <Icon as={Ionicons} name="checkmark-circle" size="lg" className="text-green-600" />
                                    <Text className="text-green-800 font-medium text-center">
                                        {t('already_subscribed') || 'Inscrito!'}
                                    </Text>
                                </HStack>
                            </Box>
                        )}
                        
                        <Pressable
                            onPress={addToCalendar}
                            className="bg-gray-100 rounded-xl p-4"
                        >
                            <Icon as={MaterialIcons} name="event" size="sm" className="text-gray-700" />
                        </Pressable>
                    </HStack>

                    <Box className="bg-white rounded-2xl shadow-sm overflow-hidden">
                        <VStack>
                            <Pressable
                                onPress={() => {}}
                                className="p-4 border-b border-gray-100"
                            >
                                <HStack className="items-center justify-between">
                                    <HStack className="items-center space-x-3">
                                        <Box className="bg-purple-100 rounded-xl p-2">
                                            <Icon as={MaterialCommunityIcons} name="calendar" size="sm" className="text-purple-600" />
                                        </Box>
                                        <VStack>
                                            <Text className="text-xs text-gray-500 uppercase">
                                                {t('date') || 'Data'}
                                            </Text>
                                            <Text className="font-semibold text-gray-900 capitalize">
                                                {formattedDateTime.date}
                                            </Text>
                                        </VStack>
                                    </HStack>
                                    <Icon as={MaterialIcons} name="chevron-right" size="sm" className="text-gray-400" />
                                </HStack>
                            </Pressable>

                            <Pressable
                                onPress={() => {}}
                                className="p-4 border-b border-gray-100"
                            >
                                <HStack className="items-center justify-between">
                                    <HStack className="items-center space-x-3">
                                        <Box className="bg-purple-100 rounded-xl p-2">
                                            <Icon as={MaterialCommunityIcons} name="clock-outline" size="sm" className="text-purple-600" />
                                        </Box>
                                        <VStack>
                                            <Text className="text-xs text-gray-500 uppercase">
                                                {t('time') || 'Horário'}
                                            </Text>
                                            <Text className="font-semibold text-gray-900">
                                                {formattedDateTime.startTime}
                                                {formattedDateTime.endTime && ` - ${formattedDateTime.endTime}`}
                                                {formattedDateTime.duration && ` (${formattedDateTime.duration})`}
                                            </Text>
                                        </VStack>
                                    </HStack>
                                    <Icon as={MaterialIcons} name="chevron-right" size="sm" className="text-gray-400" />
                                </HStack>
                            </Pressable>

                            <Pressable
                                onPress={openInMaps}
                                className="p-4"
                            >
                                <HStack className="items-center justify-between">
                                    <HStack className="items-center space-x-3 flex-1">
                                        <Box className="bg-purple-100 rounded-xl p-2">
                                            <Icon as={MaterialCommunityIcons} name="map-marker" size="sm" className="text-purple-600" />
                                        </Box>
                                        <VStack className="flex-1">
                                            <Text className="text-xs text-gray-500 uppercase">
                                                {t('location') || 'Local'}
                                            </Text>
                                            <Text className="font-semibold text-gray-900" numberOfLines={2}>
                                                {event?.location}
                                            </Text>
                                        </VStack>
                                    </HStack>
                                    <Icon as={MaterialIcons} name="directions" size="sm" className="text-purple-600" />
                                </HStack>
                            </Pressable>
                        </VStack>
                    </Box>

                    {event?.description && (
                        <Box className="bg-white rounded-2xl p-4 shadow-sm">
                            <HStack className="items-center space-x-2 mb-3">
                                <Icon as={MaterialIcons} name="info-outline" size="sm" className="text-purple-600" />
                                <Text className="font-semibold text-gray-800">
                                    {t('about_event') || 'Sobre o evento'}
                                </Text>
                            </HStack>
                            <Text className="text-gray-600 leading-relaxed">
                                {event.description}
                            </Text>
                        </Box>
                    )}

                    <Box className="bg-white rounded-2xl shadow-sm overflow-hidden">
                        <Box className="p-4 border-b border-gray-100">
                            <HStack className="items-center space-x-2">
                                <Icon as={MaterialIcons} name="person-outline" size="sm" className="text-purple-600" />
                                <Text className="font-semibold text-gray-800">
                                    {t('organizer') || 'Organizador'}
                                </Text>
                            </HStack>
                        </Box>
                        <Pressable
                            onPress={() => organizer?.id && router.push(`/(tabs)/(home)/(profile)/${organizer.id}`)}
                            className="p-4"
                        >
                            <HStack className="items-center justify-between">
                                <HStack className="items-center space-x-3">
                                    <Avatar size="lg" className="bg-purple-100">
                                        {organizer?.avatar ? (
                                            <AvatarImage source={{ uri: organizer.avatar }} alt={organizer.first_name} />
                                        ) : (
                                            <AvatarFallbackText className="text-purple-700 font-semibold">
                                                {getInitials(organizer?.first_name || event?.organizer || 'ORG')}
                                            </AvatarFallbackText>
                                        )}
                                    </Avatar>
                                    <VStack>
                                        <Text className="font-semibold text-gray-900">
                                            {organizer?.first_name} {organizer?.last_name}
                                        </Text>
                                        {event?.organizer_contact_info && (
                                            <Text className="text-sm text-gray-600">
                                                {event.organizer_contact_info}
                                            </Text>
                                        )}
                                    </VStack>
                                </HStack>
                                <Icon as={MaterialIcons} name="chevron-right" size="sm" className="text-gray-400" />
                            </HStack>
                        </Pressable>
                    </Box>
                    
                    {relatedEvents.length > 0 && (
                        <VStack className="space-y-3">
                            <HStack className="items-center justify-between px-1">
                                <Text className="font-semibold text-gray-800">
                                    {t('related_events') || 'Eventos relacionados'}
                                </Text>
                                <Pressable onPress={() => router.push('/(tabs)/(events)')}>
                                    <Text className="text-sm text-purple-600">
                                        {t('see_all') || 'Ver todos'}
                                    </Text>
                                </Pressable>
                            </HStack>
                            {relatedEvents.map((relatedEvent) => (
                                <EventCard
                                    key={relatedEvent.id}
                                    event={relatedEvent}
                                    isCompact
                                />
                            ))}
                        </VStack>
                    )}
                </VStack>
            </ScrollView>
            
            <Modal
                isOpen={showShareModal}
                onClose={() => setShowShareModal(false)}
                size="sm"
            >
                <ModalBackdrop />
                <ModalContent>
                    <ModalHeader>
                        <Heading size="lg">{t('share_event') || 'Compartilhar Evento'}</Heading>
                        <ModalCloseButton>
                            <Icon as={MaterialIcons} name="close" size="sm" />
                        </ModalCloseButton>
                    </ModalHeader>
                    <ModalBody>
                        <VStack className="space-y-4">
                            <Pressable
                                onPress={() => {
                                    handleShare();
                                    setShowShareModal(false);
                                }}
                                className="flex-row items-center space-x-3 p-3 bg-gray-50 rounded-lg"
                            >
                                <Icon as={MaterialIcons} name="share" size="sm" className="text-gray-700" />
                                <Text className="flex-1 font-medium text-gray-700">
                                    {t('share_via_apps') || 'Compartilhar via aplicativos'}
                                </Text>
                            </Pressable>
                        </VStack>
                    </ModalBody>
                </ModalContent>
            </Modal>
        </>
    );
});

EventDetailsPage.displayName = 'EventDetailsPage';

export default EventDetailsPage;