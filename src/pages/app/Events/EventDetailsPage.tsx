import React, {useEffect, useState} from 'react';
import {Box, Text, VStack, HStack, Badge} from 'native-base';
import {RouteProp} from '@react-navigation/native';
import {EventsTypes} from "../../../types/EventsTypes";
import {Image} from "../../../components/Image"
import {getUserId} from "../../../services/user";
import {UserTypes} from "../../../types/UserTypes";
import {formatTime} from "../../../utils/directus";
import {getItem} from "../../../services/items";
import SkeletonItem from "../../../components/SkeletonItem";

const EventDetailsPage = ({route}) => {
    const {id} = route.params;

    const [organizer, setOrganizer] = useState<UserTypes | null>(null);
    const [event, setEvent] = useState<EventsTypes | null>(null);
    const [loading, setLoading] = useState<boolean>(true);

    useEffect(() => {
        const loadOrganizer = async () => {
            const eventResponse = await getItem<EventsTypes>('events', id);
            setEvent(eventResponse)

            const userResponse = await getUserId(eventResponse.organizer);
            setOrganizer(userResponse);
            setLoading(false)

        };

        loadOrganizer();
    }, [event]);


    return (
        <Box flex={1} p={4}>
            {loading ? (
                <SkeletonItem count={5}/>
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
                    <Text color='gray.500'>
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
    );
};

export default EventDetailsPage;
