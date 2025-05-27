import React, { useMemo, useCallback, useRef } from 'react';
import { Animated, View, Dimensions } from 'react-native';
import { Text } from "@/components/ui/text";
import { Heading } from "@/components/ui/heading";
import { Icon } from "@/components/ui/icon";
import { Avatar, AvatarImage, AvatarFallbackText } from "@/components/ui/avatar";
import { Ionicons, MaterialCommunityIcons, MaterialIcons } from '@expo/vector-icons';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { EventsTypes } from "@/types/EventsTypes";
import { useRouter } from "expo-router";
import { Box } from "@/components/ui/box";
import { HStack } from "@/components/ui/hstack";
import { VStack } from "@/components/ui/vstack";
import { Badge, BadgeText } from "@/components/ui/badge";
import { Pressable } from "@/components/ui/pressable";
import { LinearGradient } from 'expo-linear-gradient';
import { DirectusImage } from '@/components/DirectusImage';

const { width } = Dimensions.get('window');

interface EventCardProps {
  event: EventsTypes;
  onFavoriteToggle?: (eventId: string) => void;
  isFavorite?: boolean;
  isCompact?: boolean;
}

const EVENT_TYPE_CONFIG: Record<string, { label: string; colors: string[]; icon: string }> = {
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
  'default': {
    label: 'Evento',
    colors: ['#50C878', '#00A86B'],
    icon: 'event',
  },
};

export const EventCard: React.FC<EventCardProps> = React.memo(({
  event,
  onFavoriteToggle,
  isFavorite = false,
  isCompact = false,
}) => {
  const router = useRouter();
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const favoriteAnim = useRef(new Animated.Value(isFavorite ? 1 : 0)).current;

  const eventConfig = EVENT_TYPE_CONFIG[event.event_type] || EVENT_TYPE_CONFIG.default;

  const navigateToEventDetails = useCallback(() => {
    router.push(`/(tabs)/(events)/event/${event.id}`);
  }, [router, event.id]);

  const handlePressIn = useCallback(() => {
    Animated.spring(scaleAnim, {
      toValue: 0.95,
      useNativeDriver: true,
    }).start();
  }, [scaleAnim]);

  const handlePressOut = useCallback(() => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      useNativeDriver: true,
    }).start();
  }, [scaleAnim]);

  const handleFavoritePress = useCallback(() => {
    if (onFavoriteToggle) {
      onFavoriteToggle(event.id);
      Animated.sequence([
        Animated.timing(favoriteAnim, {
          toValue: 1.2,
          duration: 150,
          useNativeDriver: true,
        }),
        Animated.timing(favoriteAnim, {
          toValue: isFavorite ? 0 : 1,
          duration: 150,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [onFavoriteToggle, event.id, isFavorite, favoriteAnim]);

  const { formattedDate, formattedTime, duration } = useMemo(() => {
    const startDate = new Date(event.start_date_time);
    const endDate = event.end_date_time ? new Date(event.end_date_time) : null;
    
    return {
      formattedDate: format(startDate, "dd 'de' MMMM", { locale: ptBR }),
      formattedTime: format(startDate, 'HH:mm'),
      duration: endDate
        ? `${Math.round((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60))}h`
        : null,
    };
  }, [event.start_date_time, event.end_date_time]);

  const getInitials = useCallback((name: string): string => {
    return name
      .split(' ')
      .map(part => part.charAt(0))
      .join('')
      .toUpperCase()
      .substring(0, 2);
  }, []);

  if (isCompact) {
    return (
      <Pressable
        onPress={navigateToEventDetails}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
      >
        <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
          <Box className="bg-white rounded-xl shadow-sm overflow-hidden mb-3">
            <HStack className="p-4 space-x-3">
              <Box className="w-16 h-16 rounded-lg overflow-hidden">
                <LinearGradient
                  colors={eventConfig.colors}
                  style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}
                >
                  <Icon
                    as={MaterialIcons}
                    name={eventConfig.icon as any}
                    size="lg"
                    className="text-white"
                  />
                </LinearGradient>
              </Box>
              
              <VStack className="flex-1 space-y-1">
                <Heading className="text-base font-semibold text-gray-900" numberOfLines={1}>
                  {event.title}
                </Heading>
                <HStack className="items-center space-x-2">
                  <Icon as={Ionicons} name="time-outline" size="xs" className="text-gray-500" />
                  <Text className="text-xs text-gray-600">
                    {formattedDate} às {formattedTime}
                  </Text>
                </HStack>
                <HStack className="items-center space-x-2">
                  <Icon as={MaterialCommunityIcons} name="map-marker" size="xs" className="text-gray-500" />
                  <Text className="text-xs text-gray-600" numberOfLines={1}>
                    {event.location}
                  </Text>
                </HStack>
              </VStack>

              <Box className="items-center justify-center">
                <Icon as={MaterialIcons} name="chevron-right" size="lg" className="text-gray-400" />
              </Box>
            </HStack>
          </Box>
        </Animated.View>
      </Pressable>
    );
  }

  return (
    <Pressable
      onPress={navigateToEventDetails}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
    >
      <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
        <Box className="bg-white rounded-2xl shadow-md overflow-hidden mb-4 mx-4">
          <Box className="relative">
            {event.image_cover ? (
              <DirectusImage
                assetId={event.image_cover}
                preset="event-cover"
                style={{ height: 200, width: '100%' }}
              />
            ) : (
              <LinearGradient
                colors={eventConfig.colors}
                style={{ height: 200, width: '100%', justifyContent: 'center', alignItems: 'center' }}
              >
                <Icon
                  as={MaterialIcons}
                  name={eventConfig.icon as any}
                  size="6xl"
                  className="text-white opacity-50"
                />
              </LinearGradient>
            )}
            
            <Box className="absolute top-3 left-3">
              <Badge className={`${event.status === 'active' ? 'bg-green-500' : 'bg-yellow-500'}`}>
                <BadgeText className="text-white text-xs">
                  {event.status === 'active' ? 'Ativo' : 'Pendente'}
                </BadgeText>
              </Badge>
            </Box>

            <Pressable
              onPress={handleFavoritePress}
              className="absolute top-3 right-3 bg-white/90 rounded-full p-2"
            >
              <Animated.View style={{ transform: [{ scale: favoriteAnim }] }}>
                <Icon
                  as={MaterialIcons}
                  name={isFavorite ? 'favorite' : 'favorite-border'}
                  size="md"
                  className={isFavorite ? 'text-red-500' : 'text-gray-600'}
                />
              </Animated.View>
            </Pressable>

            <LinearGradient
              colors={['transparent', 'rgba(0,0,0,0.7)']}
              style={{
                position: 'absolute',
                bottom: 0,
                left: 0,
                right: 0,
                height: 80,
                justifyContent: 'flex-end',
                paddingHorizontal: 16,
                paddingBottom: 12,
              }}
            >
              <Badge variant="solid" className="bg-white/20 self-start mb-2">
                <HStack className="items-center space-x-1">
                  <Icon
                    as={MaterialIcons}
                    name={eventConfig.icon as any}
                    size="xs"
                    className="text-white"
                  />
                  <BadgeText className="text-white text-xs">{eventConfig.label}</BadgeText>
                </HStack>
              </Badge>
            </LinearGradient>
          </Box>

          <VStack className="p-4 space-y-3">
            <Heading className="text-lg font-bold text-gray-900" numberOfLines={2}>
              {event.title}
            </Heading>

            {event.subtitle && (
              <Text className="text-sm text-gray-600" numberOfLines={2}>
                {event.subtitle}
              </Text>
            )}

            <VStack className="space-y-2">
              <HStack className="items-center space-x-2">
                <Box className="bg-purple-100 rounded p-1.5">
                  <Icon as={Ionicons} name="calendar-outline" size="sm" className="text-purple-600" />
                </Box>
                <Text className="text-sm font-medium text-gray-700">
                  {formattedDate}
                </Text>
              </HStack>

              <HStack className="items-center space-x-2">
                <Box className="bg-purple-100 rounded p-1.5">
                  <Icon as={Ionicons} name="time-outline" size="sm" className="text-purple-600" />
                </Box>
                <Text className="text-sm font-medium text-gray-700">
                  {formattedTime} {duration && `(${duration})`}
                </Text>
              </HStack>

              <HStack className="items-center space-x-2">
                <Box className="bg-purple-100 rounded p-1.5">
                  <Icon as={MaterialCommunityIcons} name="map-marker" size="sm" className="text-purple-600" />
                </Box>
                <Text className="text-sm font-medium text-gray-700 flex-1" numberOfLines={2}>
                  {event.location}
                </Text>
              </HStack>
            </VStack>

            <HStack className="items-center justify-between pt-3 border-t border-gray-100">
              <HStack className="items-center space-x-2">
                <Avatar size="sm" className="bg-purple-100">
                  <AvatarFallbackText className="text-purple-700 font-semibold">
                    {getInitials(event.organizer || "ORG")}
                  </AvatarFallbackText>
                </Avatar>
                <VStack>
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

              <HStack className="items-center space-x-1">
                <Text className="text-xs text-gray-500">Ver detalhes</Text>
                <Icon as={MaterialIcons} name="arrow-forward" size="sm" className="text-purple-600" />
              </HStack>
            </HStack>
          </VStack>
        </Box>
      </Animated.View>
    </Pressable>
  );
});

EventCard.displayName = 'EventCard';

export default EventCard;