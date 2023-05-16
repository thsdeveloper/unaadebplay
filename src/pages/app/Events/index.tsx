import React, {useState, useEffect, useContext} from 'react';
import {RefreshControl, TouchableOpacity} from 'react-native';
import {Box, Text, VStack, Divider, Spinner, Stack, SectionList} from 'native-base';
import {getItems} from '../../../services/items';
import {Image} from "../../../components/Image";
import TranslationContext from "../../../contexts/TranslationContext";
import { MaterialIcons } from '@expo/vector-icons';
import colors from "../../../constants/colors";
import {useAudioPlayer} from "../../../contexts/AudioPlayerContext";
import SkeletonItem from "../../../components/SkeletonItem";
import {EventsTypes} from "../../../types/EventsTypes";
import { useNavigation } from '@react-navigation/native';

const EventPage = () => {
    const [events, setEvents] = useState<Array<{title: string, data: EventsTypes[]}>>([]);

    const [isLoadingItemList, setIsLoadingItemList] = useState(false);
    const [isLoadingList, setIsLoadingList] = useState(false);
    const [refreshing, setRefreshing] = useState<boolean>(false);
    const {t} = useContext(TranslationContext);
    const { setAlbumID } = useAudioPlayer();
    const navigation = useNavigation();


    const loadEvents = async () => {
        setIsLoadingList(true);
        let response = await getItems<EventsTypes>('events');

        // Ordena os eventos por start_date_time
        response.sort((a, b) => new Date(a.start_date_time).getTime() - new Date(b.start_date_time).getTime());

        // Agrupe os eventos por start_date_time
        const eventsByDate = response.reduce((groups, event) => {
            const eventDate = new Date(event.start_date_time).toLocaleDateString(); // Formatando data para exibição
            (groups[eventDate] = groups[eventDate] || []).push(event);
            return groups;
        }, {});

        // Converta o objeto groups em um array de seções
        const sections = Object.keys(eventsByDate).map(date => ({
            title: date,
            data: eventsByDate[date],
            eventType: eventsByDate[date][0].event_type // adicione o tipo de evento
        }));

        setEvents(sections);
        setIsLoadingList(false);
    };



    useEffect(() => {
        loadEvents();
    }, []);


    const handleEventPress = async (event: EventsTypes) => {
        navigation.navigate('EventsDetails', {id: event.id})
    };

    const renderItem = ({item}: { item: EventsTypes }) => (
        <TouchableOpacity onPress={() => handleEventPress(item)}>
            <Stack direction="row" space={"sm"} p={2}>
                <Box>
                    <Image borderRadius={4} width={'20'} height={'20'} resizeMode="cover" assetId={item.image_cover}/>
                </Box>
                <Box flex={1} alignItems={"center"}>
                    <VStack justifyItems={"center"}>
                        <Text fontSize="lg" fontWeight="bold">
                            {item.title}
                        </Text>
                        <Text color="gray.500">Local: {item.location}</Text>
                        <Text color="gray.500">Contato: {item.organizer_contact_info}</Text>
                    </VStack>
                </Box>
            </Stack>
            <Divider/>
        </TouchableOpacity>
    );


    return (
        <Box flex={1} bg="white">
            <Stack space={"sm"} p={2} direction={"row"} alignItems={"center"}>
                <MaterialIcons
                    name={'event'}
                    size={20}
                    color={colors.secundary}
                />
                <Text color={colors.secundary} fontSize={"lg"} fontWeight={"bold"}>{t('text_events')}</Text>
            </Stack>

            {isLoadingList ? (
                <SkeletonItem count={5} />
            ) : (
                <SectionList
                    sections={events}
                    keyExtractor={(item, index) => item.id + index}
                    renderItem={renderItem}
                    renderSectionHeader={({ section: { title, eventType } }) => (
                        <Text fontWeight="bold" p={2}>{`${title} - ${eventType}`}</Text>
                    )}
                    refreshControl={
                        <RefreshControl
                            title={t('text_search')}
                            refreshing={refreshing}
                            onRefresh={loadEvents}
                        />
                    }
                />


            )}

            {isLoadingItemList  && (
                <Box
                    position="absolute"
                    top={0}
                    bottom={0}
                    left={0}
                    right={0}
                    justifyContent="center"
                    alignItems="center"
                    zIndex={1}
                    bgColor="rgba(0, 0, 0, 0.8)"
                >
                    <Spinner accessibilityLabel="Loading posts" color="white"/>
                </Box>
            )}
        </Box>
    );
};

export default EventPage;
