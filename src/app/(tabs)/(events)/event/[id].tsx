import React, { useContext, useEffect, useState, useCallback, useMemo } from 'react';
import { View, ActivityIndicator } from 'react-native';
import { EventsTypes } from "@/types/EventsTypes";
import { Image } from "@/components/Image";
import { getUser } from "@/services/user";
import { UserTypes } from "@/types/UserTypes";
import { handleErrors } from "@/utils/directus";
import { getItem, getItems, setCreateItem } from "@/services/items";
import AlertContext from "@/contexts/AlertContext";
import AuthContext from "@/contexts/AuthContext";
import TranslationContext from "@/contexts/TranslationContext";
import { Text } from "@/components/ui/text";
import { Heading } from "@/components/ui/heading";
import { MaterialCommunityIcons, Ionicons } from '@expo/vector-icons';
import { useGlobalSearchParams, Stack } from "expo-router";
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Box } from "@/components/ui/box";
import { VStack } from "@/components/ui/vstack";
import { HStack } from "@/components/ui/hstack";
import { ScrollView } from "@/components/ui/scroll-view";
import { Badge, BadgeText } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import { Center } from "@/components/ui/center";
import { Avatar, AvatarImage, AvatarFallbackText } from "@/components/ui/avatar";
import { Divider } from "@/components/ui/divider";
import { Pressable } from "@/components/ui/pressable";

const EventDetailsPage = React.memo(() => {
    const { id } = useGlobalSearchParams();
    const [organizer, setOrganizer] = useState<UserTypes | null>(null);
    const [event, setEvent] = useState<EventsTypes | null>(null);
    const [loading, setLoading] = useState(true);
    const [loadingSubscriptions, setLoadingSubscriptions] = useState(false);
    const [isSubscribed, setIsSubscribed] = useState(false);
    
    const alert = useContext(AlertContext);
    const { user } = useContext(AuthContext);
    const { t } = useContext(TranslationContext);

    const loadEventDetails = useCallback(async () => {
        if (!id || !user?.id) return;
        
        try {
            setLoading(true);
            const eventResponse = await getItem<EventsTypes>('events', id as string);
            setEvent(eventResponse);

            const [userResponse, subscriptionResponse] = await Promise.all([
                getUser(eventResponse.organizer),
                getItems('event_subscriptions', {
                    filter: {
                        user_id: { _eq: user.id },
                        event_id: { _eq: eventResponse.id }
                    }
                })
            ]);

            setOrganizer(userResponse);
            setIsSubscribed(subscriptionResponse.length > 0);
        } catch (error: any) {
            const message = handleErrors(error.errors);
            alert.error(`Erro ao carregar evento: ${message}`);
        } finally {
            setLoading(false);
        }
    }, [id, user?.id, alert]);

    useEffect(() => {
        loadEventDetails();
    }, [loadEventDetails]);

    const subscribeToEvent = useCallback(async () => {
        if (!event?.id || !user?.id) return;
        
        setLoadingSubscriptions(true);
        try {
            const subscription = {
                event_id: event.id,
                user_id: user.id,
            };
            
            await setCreateItem('event_subscriptions', subscription);
            alert.success(t('event_subscription_success') || 'Inscrição realizada com sucesso!');
            setIsSubscribed(true);
        } catch (error: any) {
            const message = handleErrors(error.errors);
            alert.error(`${t('event_subscription_error') || 'Erro ao inscrever'}: ${message}`);
        } finally {
            setLoadingSubscriptions(false);
        }
    }, [event?.id, user?.id, alert, t]);

    const getInitials = useCallback((name: string): string => {
        return name
            .split(' ')
            .map(part => part.charAt(0))
            .join('')
            .toUpperCase()
            .substring(0, 2);
    }, []);

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
                    title: event?.title || t('event_details') || 'Detalhes do Evento',
                    headerBackTitle: t('back') || 'Voltar',
                    headerShown: true,
                    headerStyle: { backgroundColor: '#7c3aed' },
                    headerTintColor: '#fff',
                    headerTitleStyle: { fontWeight: 'bold' },
                }}
            />
            <ScrollView className="flex-1 bg-gray-50">
                {event?.image_cover && (
                    <Box className="relative">
                        <Image
                            assetId={event.image_cover}
                            style={{ height: 250, width: '100%' }}
                            resizeMode="cover"
                        />
                        <Box className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-4">
                            <Heading className="text-2xl font-bold text-white mb-1">
                                {event.title}
                            </Heading>
                            <HStack className="items-center space-x-2">
                                <Badge 
                                    variant="solid" 
                                    className={`${
                                        event.status === 'active' ? 'bg-green-500' : 
                                        event.status === 'pending' ? 'bg-yellow-500' : 
                                        'bg-gray-500'
                                    }`}
                                >
                                    <BadgeText className="text-xs text-white">
                                        {event.status === 'active' ? 'Ativo' : 
                                         event.status === 'pending' ? 'Pendente' : 
                                         event.status}
                                    </BadgeText>
                                </Badge>
                            </HStack>
                        </Box>
                    </Box>
                )}

                <VStack className="p-4 space-y-4">
                    {!isSubscribed ? (
                        <Button
                            className="bg-purple-600 py-3 rounded-lg"
                            onPress={subscribeToEvent}
                            isDisabled={loadingSubscriptions}
                        >
                            <HStack className="items-center justify-center space-x-2">
                                <Icon as={MaterialCommunityIcons} name="calendar-check" size="md" color="white" />
                                <Text className="text-white font-semibold text-base">
                                    {loadingSubscriptions ? t('subscribing') || 'Inscrevendo...' : t('subscribe_now') || 'Inscrever-se'}
                                </Text>
                            </HStack>
                        </Button>
                    ) : (
                        <Box className="bg-green-50 border border-green-200 rounded-lg p-4">
                            <HStack className="items-center space-x-2">
                                <Icon as={Ionicons} name="checkmark-circle" size="lg" className="text-green-600" />
                                <Text className="text-green-800 font-medium">
                                    {t('already_subscribed') || 'Você já está inscrito neste evento!'}
                                </Text>
                            </HStack>
                        </Box>
                    )}

                    <Box className="bg-white rounded-lg p-4 shadow-sm">
                        <VStack className="space-y-3">
                            <HStack className="items-start space-x-3">
                                <Icon as={MaterialCommunityIcons} name="calendar" size="md" className="text-purple-600 mt-0.5" />
                                <VStack className="flex-1">
                                    <Text className="text-sm text-gray-600">
                                        {t('date') || 'Data'}
                                    </Text>
                                    <Text className="font-medium text-gray-900 capitalize">
                                        {formattedDateTime.date}
                                    </Text>
                                </VStack>
                            </HStack>

                            <Divider />

                            <HStack className="items-start space-x-3">
                                <Icon as={MaterialCommunityIcons} name="clock-outline" size="md" className="text-purple-600 mt-0.5" />
                                <VStack className="flex-1">
                                    <Text className="text-sm text-gray-600">
                                        {t('time') || 'Horário'}
                                    </Text>
                                    <Text className="font-medium text-gray-900">
                                        {formattedDateTime.startTime}
                                        {formattedDateTime.endTime && ` - ${formattedDateTime.endTime}`}
                                        {formattedDateTime.duration && ` (${formattedDateTime.duration})`}
                                    </Text>
                                </VStack>
                            </HStack>

                            <Divider />

                            <HStack className="items-start space-x-3">
                                <Icon as={MaterialCommunityIcons} name="map-marker" size="md" className="text-purple-600 mt-0.5" />
                                <VStack className="flex-1">
                                    <Text className="text-sm text-gray-600">
                                        {t('location') || 'Local'}
                                    </Text>
                                    <Text className="font-medium text-gray-900">
                                        {event?.location}
                                    </Text>
                                </VStack>
                            </HStack>
                        </VStack>
                    </Box>

                    {event?.description && (
                        <Box className="bg-white rounded-lg p-4 shadow-sm">
                            <Text className="text-sm font-semibold text-gray-700 mb-2">
                                {t('about_event') || 'Sobre o evento'}
                            </Text>
                            <Text className="text-gray-600 leading-relaxed">
                                {event.description}
                            </Text>
                        </Box>
                    )}

                    <Box className="bg-white rounded-lg p-4 shadow-sm">
                        <Text className="text-sm font-semibold text-gray-700 mb-3">
                            {t('organizer') || 'Organizador'}
                        </Text>
                        <HStack className="items-center space-x-3">
                            <Avatar size="md" className="bg-purple-100">
                                {organizer?.avatar ? (
                                    <AvatarImage source={{ uri: organizer.avatar }} alt={organizer.first_name} />
                                ) : (
                                    <AvatarFallbackText className="text-purple-700 font-semibold">
                                        {getInitials(organizer?.first_name || event?.organizer || 'ORG')}
                                    </AvatarFallbackText>
                                )}
                            </Avatar>
                            <VStack className="flex-1">
                                <Text className="font-medium text-gray-900">
                                    {organizer?.first_name} {organizer?.last_name}
                                </Text>
                                {event?.organizer_contact_info && (
                                    <Text className="text-sm text-gray-600">
                                        {event.organizer_contact_info}
                                    </Text>
                                )}
                            </VStack>
                        </HStack>
                    </Box>
                </VStack>
            </ScrollView>
        </>
    );
});

EventDetailsPage.displayName = 'EventDetailsPage';

export default EventDetailsPage;
