import React from 'react';
import { Pressable, View } from 'react-native';
import { Text } from "@/components/ui/text";
import { Heading } from "@/components/ui/heading";
import { Icon } from "@/components/ui/icon";
import { Avatar } from "@/components/ui/avatar";
import { AvatarImage, AvatarFallbackText } from "@/components/ui/avatar";
import { Ionicons } from '@expo/vector-icons';
import { format } from 'date-fns';
import { EventsTypes } from "@/types/EventsTypes";
import Card from '@/components/common/Card';
import { useRouter } from "expo-router";

interface EventCardProps {
    event: EventsTypes;
    gradientColors: string[];
}

const EventCard: React.FC<EventCardProps> = ({ event, gradientColors }) => {
    const router = useRouter();

    // Função para navegar para a página de detalhes
    const navigateToEventDetails = () => {
        router.push(`/(tabs)/(events)/event/${event.id}`);
    };

    // Função para formatar a hora
    const formatTime = (dateTimeString: string) => {
        const date = new Date(dateTimeString);
        return format(date, 'HH:mm');
    };

    // Função para obter iniciais de um nome
    const getInitials = (name: string): string => {
        return name
            .split(' ')
            .map(part => part.charAt(0))
            .join('')
            .toUpperCase()
            .substring(0, 2);
    };

    const startTime = formatTime(event.start_date_time);
    const endTime = event.end_date_time ? formatTime(event.end_date_time) : '';

    // Card Footer com informações do organizador
    const cardFooter = (
        <View className="flex-row items-center space-x-4 p-4">
            <Avatar size="xs" bgColor={gradientColors[0]}>
                {event.organizer_image ? (
                    <AvatarImage source={{ uri: event.organizer_image }} />
                ) : (
                    <AvatarFallbackText>{getInitials(event.organizer || "OR")}</AvatarFallbackText>
                )}
            </Avatar>
            <View className="flex-col">
                <Text fontSize="xs" color="gray.600" fontWeight="600">
                    {event.organizer || "Organizador"}
                </Text>
                <Text fontSize="2xs" color="gray.500">
                    {event.organizer_contact_info || "Contato não disponível"}
                </Text>
            </View>
        </View>
    );

    return (
        <View className="mb-4">
            <Card
                title={event.event_type}
                gradientColors={gradientColors}
                imageAssetId={event.image_cover}
                size="full"
                borderRadius="md"
                elevation="md"
                showFooter={true}
                footer={cardFooter}
                onPress={navigateToEventDetails}
                isPressable={true}
            >
                <View className="p-4 flex-col">
                    {/* Título e Subtítulo do Evento */}
                    <View className="space-y-1 mb-2">
                        <Heading size="sm" numberOfLines={2} ellipsizeMode="tail">
                            {event.title}
                        </Heading>

                        {event.subtitle && (
                            <Text fontSize="xs" color="gray.500" numberOfLines={1}>
                                {event.subtitle}
                            </Text>
                        )}
                    </View>

                    {/* Horário do Evento */}
                    <View className="flex-row items-center space-x-2 mb-1">
                        <Icon as={Ionicons} name="time-outline" size="sm" color={gradientColors[0]} />
                        <Text fontSize="sm" color="gray.600">
                            {startTime} {endTime ? `- ${endTime}` : ''}
                        </Text>
                    </View>

                    {/* Localização */}
                    <View className="flex-row items-center space-x-2">
                        <Icon as={Ionicons} name="location-outline" size="sm" color="gray.500" />
                        <Text fontSize="sm" color="gray.600" className="flex-1" numberOfLines={1}>
                            {event.location}
                        </Text>
                    </View>
                </View>
            </Card>
        </View>
    );
};

export default EventCard;
