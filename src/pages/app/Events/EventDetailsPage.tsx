import React, {useEffect, useState} from 'react';
import {Box, Text, VStack, HStack, Badge} from 'native-base';
import { RouteProp } from '@react-navigation/native';
import {EventsTypes} from "../../../types/EventsTypes";
import {Image} from "../../../components/Image"
import {getUserId} from "../../../services/user";
import {UserTypes} from "../../../types/UserTypes";
import {formatTime} from "../../../utils/directus";

// Definindo o tipo para a Stack de Navegação
type RootStackParamList = {
    EventDetails: { event: EventsTypes };
};

type EventDetailsScreenRouteProp = RouteProp<RootStackParamList, 'EventDetails'>;

type Props = {
    route: EventDetailsScreenRouteProp;
};

const EventDetailsPage: React.FC<Props> = ({route}) => {
    const { event } = route.params;

    const [organizer, setOrganizer] = useState<UserTypes | null>(null);

    useEffect(() => {
        const loadOrganizer = async () => {
            const user = await getUserId(event.organizer);
            setOrganizer(user);
        };

        loadOrganizer();
    }, [event]);

    return (
        <Box flex={1} p={4}>
            <VStack space={4}>
                <Text fontSize='2xl' fontWeight='bold' color='blue.900'>
                    {event.title}
                </Text>
                <Image
                    assetId={event.image_cover}
                    height={'200'}
                    borderRadius={10}
                />
                <HStack space={2}>
                    <Badge variant="outline" colorScheme="green">{event.status}</Badge>
                    <Badge variant="outline" colorScheme="blue">{event.event_type}</Badge>
                </HStack>
                <Text color='gray.500'>
                    Organizado por {organizer ? organizer.first_name : 'Loading...'}
                </Text>
                <Text color='gray.500'>
                    Local do evento: {event.location}
                </Text>
                <Text color='gray.500'>
                    Início: {formatTime(event.start_date_time, 'DD/MM/YYYY hh:hh')} até: {formatTime(event.end_date_time, 'MM/YYYY hh:hh')}
                </Text>
                <Text>
                    {event.description}
                </Text>
                <Text color='gray.500' fontWeight='bold'>
                    Contato do Organizador: {event.organizer_contact_info}
                </Text>
            </VStack>
        </Box>
    );
};

export default EventDetailsPage;
