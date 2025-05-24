import React, { useMemo, useCallback } from 'react';
import { View } from 'react-native';
import { Text } from "@/components/ui/text";
import { Heading } from "@/components/ui/heading";
import { Icon } from "@/components/ui/icon";
import { Avatar, AvatarImage, AvatarFallbackText } from "@/components/ui/avatar";
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { EventsTypes } from "@/types/EventsTypes";
import Card from '@/components/common/Card';
import { useRouter } from "expo-router";
import { Box } from "@/components/ui/box";
import { HStack } from "@/components/ui/hstack";
import { VStack } from "@/components/ui/vstack";
import { Badge, BadgeText } from "@/components/ui/badge";

interface EventCardProps {
    event: EventsTypes;
    gradientColors: string[];
}

const EVENT_TYPE_LABELS: Record<string, string> = {
    'congresso-geral': 'Congresso Geral',
    'ensaio': 'Ensaio',
    'palestras': 'Palestras',
    'cpre-congresso': 'Pré-Congresso',
} as const;

const EventCard = React.memo<EventCardProps>(({ event, gradientColors }) => {
    const router = useRouter();

    const navigateToEventDetails = useCallback(() => {
        router.push(`/(tabs)/(events)/event/${event.id}`);
    }, [router, event.id]);

    const formatTime = useCallback((dateTimeString: string) => {
        const date = new Date(dateTimeString);
        return format(date, 'HH:mm', { locale: ptBR });
    }, []);

    const getInitials = useCallback((name: string): string => {
        return name
            .split(' ')
            .map(part => part.charAt(0))
            .join('')
            .toUpperCase()
            .substring(0, 2);
    }, []);

    const { startTime, endTime, eventTypeLabel } = useMemo(() => ({
        startTime: formatTime(event.start_date_time),
        endTime: event.end_date_time ? formatTime(event.end_date_time) : '',
        eventTypeLabel: EVENT_TYPE_LABELS[event.event_type] || event.event_type
    }), [event.start_date_time, event.end_date_time, event.event_type, formatTime]);

    const cardFooter = useMemo(() => (
        <HStack className="items-center space-x-3 px-4 py-3">
            <Avatar size="sm" className="bg-purple-100">
                {event.organizer_image ? (
                    <AvatarImage source={{ uri: event.organizer_image }} alt={event.organizer} />
                ) : (
                    <AvatarFallbackText className="text-purple-700 font-semibold">
                        {getInitials(event.organizer || "ORG")}
                    </AvatarFallbackText>
                )}
            </Avatar>
            <VStack className="flex-1">
                <Text className="text-xs font-medium text-gray-700">
                    {event.organizer || "Organizador"}
                </Text>
                {event.organizer_contact_info && (
                    <Text className="text-xs text-gray-500" numberOfLines={1}>
                        {event.organizer_contact_info}
                    </Text>
                )}
            </VStack>
        </HStack>
    ), [event.organizer, event.organizer_image, event.organizer_contact_info, getInitials]);

    return (
        <Box className="mb-4">
            <Card
                title={eventTypeLabel}
                gradientColors={gradientColors}
                imageAssetId={event.image_cover}
                size="full"
                borderRadius="lg"
                elevation="sm"
                showFooter={true}
                footer={cardFooter}
                onPress={navigateToEventDetails}
                isPressable={true}
            >
                <VStack className="p-4 space-y-3">
                    <VStack className="space-y-1">
                        <Heading className="text-lg font-bold text-gray-900" numberOfLines={2}>
                            {event.title}
                        </Heading>

                        {event.description && (
                            <Text className="text-sm text-gray-600" numberOfLines={2}>
                                {event.description}
                            </Text>
                        )}
                    </VStack>

                    <HStack className="flex-wrap gap-2">
                        <HStack className="items-center space-x-1.5">
                            <Icon as={Ionicons} name="time-outline" size="sm" className="text-purple-600" />
                            <Text className="text-sm font-medium text-gray-700">
                                {startTime} {endTime && `- ${endTime}`}
                            </Text>
                        </HStack>

                        {event.status && (
                            <Badge 
                                variant="solid" 
                                className={`${
                                    event.status === 'active' ? 'bg-green-500' : 
                                    event.status === 'pending' ? 'bg-yellow-500' : 
                                    'bg-gray-500'
                                }`}
                            >
                                <BadgeText className="text-xs text-white font-medium">
                                    {event.status === 'active' ? 'Ativo' : 
                                     event.status === 'pending' ? 'Pendente' : 
                                     event.status}
                                </BadgeText>
                            </Badge>
                        )}
                    </HStack>

                    <HStack className="items-start space-x-1.5">
                        <Icon as={MaterialCommunityIcons} name="map-marker" size="sm" className="text-gray-500 mt-0.5" />
                        <Text className="text-sm text-gray-600 flex-1" numberOfLines={2}>
                            {event.location}
                        </Text>
                    </HStack>
                </VStack>
            </Card>
        </Box>
    );
});

EventCard.displayName = 'EventCard';

export default EventCard;
