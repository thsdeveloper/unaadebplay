import React, {useContext, useEffect, useState} from 'react';
import {Box, Text, VStack, HStack, Badge, ScrollView} from 'native-base';
import {EventsTypes} from "@/types/EventsTypes";
import {Image} from "@/components/Image"
import {getUser} from "@/services/user";
import {UserTypes} from "@/types/UserTypes";
import {formatTime, handleErrors} from "@/utils/directus";
import {getItem, getItems, setCreateItem} from "@/services/items";
import SkeletonItem from "@/components/SkeletonItem";
import {Button} from "@/components/Button";
import AlertContext from "@/contexts/AlertContext";
import AuthContext from "@/contexts/AuthContext";
import {Feather, Ionicons} from '@expo/vector-icons';
import {useGlobalSearchParams, Stack} from "expo-router"


export default function EventDetailsPage(){
    const { id } = useGlobalSearchParams();

    const [organizer, setOrganizer] = useState<UserTypes | null>(null);
    const [event, setEvent] = useState<EventsTypes | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [loadingSubscriptions, setLoadingSubscriptions] = useState<boolean>(false);
    const [isSubscribed, setIsSubscribed] = useState<boolean>(false);
    const alert = useContext(AlertContext)
    const {user} = useContext(AuthContext)

    useEffect(() => {
        const loadOrganizerAndCheckSubscription = async () => {
            try {
                const eventResponse = await getItem<EventsTypes>('events', id);
                setEvent(eventResponse)

                const userResponse = await getUser(eventResponse.organizer);
                setOrganizer(userResponse);

                const params = {
                    filter: {
                        user_id: {
                            _eq: user?.id
                        },
                        event_id: {
                            _eq: eventResponse.id
                        }
                    }
                };
                // Verifica a inscrição do usuário
                const subscriptionResponse = await getItems('event_subscriptions', params)
                setIsSubscribed(subscriptionResponse.length > 0);
            } catch (e) {

            } finally {
                setLoading(false)
            }
        };

        loadOrganizerAndCheckSubscription();
    }, [id]);

    const subscribeToEvent = async () => {
        setLoadingSubscriptions(true)
        try {
            const subscription = {
                event_id: event?.id,
                user_id: user?.id,
            };
            const eventSubscriptions = await setCreateItem('event_subscriptions', subscription)
            if (eventSubscriptions) {
                alert.success('Inscrição realizada com sucesso!')
                setIsSubscribed(true);
            }
        } catch (error) {
            const message = handleErrors(error.errors);
            alert.error(`Error ao inscrever o usuário: ${message}`)
        } finally {
            setLoadingSubscriptions(false)
        }
    };

    function LogoTitle() {
        return (
            <Feather name="youtube" size={40} color='blue' />
        );
    }


    return (
        <ScrollView>
            <Stack.Screen
                options={{
                    // https://reactnavigation.org/docs/headers#setting-the-header-title
                    title: 'Evento',
                    headerBackTitle: 'Voltar',
                    headerShown: true,
                    // https://reactnavigation.org/docs/headers#adjusting-header-styles
                    headerStyle: { backgroundColor: '#3d0768' },
                    headerTintColor: '#fff',
                    headerTitleStyle: {
                        fontWeight: 'bold',
                    },
                    // https://reactnavigation.org/docs/headers#replacing-the-title-with-a-custom-component
                    // headerTitle: props => <LogoTitle {...props} />,
                }}
            />
            <Box flex={1} p={4}>
                {loading ? (
                    <SkeletonItem count={1}/>
                ) : (
                    <VStack space={4}>
                        <Text fontSize='2xl' fontWeight='bold' color='blue.900'>
                            {event?.title}
                        </Text>
                        <Image
                            assetId={event?.image_cover}
                            height={'200'}
                            borderRadius={10}
                        />
                        {isSubscribed ? (
                            <>
                                <HStack>
                                    <Ionicons name="checkmark-circle-outline" size={24} color="black"/>
                                    <Text fontSize={"lg"} fontWeight={"bold"}>Já cadastrado no evento!</Text>
                                </HStack>
                            </>
                        ) : (
                            <Button
                                title={"Inscreva-se agora!"}
                                onPress={subscribeToEvent}
                                isLoading={loadingSubscriptions}
                                isLoadingText={'Cadastrando usuário'}
                            />
                        )}
                        <HStack space={2}>
                            <Badge variant="outline" colorScheme="green">{event?.status}</Badge>
                            <Badge variant="outline" colorScheme="blue">{event?.event_type}</Badge>
                        </HStack>
                        <Text color='gray.500'>
                            Organizado por {organizer ? organizer.first_name : 'Loading...'}
                        </Text>
                        <Text color='gray.500'>
                            Local do evento: {event?.location}
                        </Text>
                        <Text color='gray.500' fontWeight={"bold"}>
                            Início: {formatTime(event?.start_date_time, 'DD/MM/YYYY hh:hh')} até: {formatTime(event?.end_date_time, 'MM/YYYY hh:hh')}
                        </Text>
                        <Text>
                            {event?.description}
                        </Text>
                        <Text color='gray.500' fontWeight='bold'>
                            Contato do Organizador: {event?.organizer_contact_info}
                        </Text>

                    </VStack>
                )}
            </Box>
        </ScrollView>
    );
};
