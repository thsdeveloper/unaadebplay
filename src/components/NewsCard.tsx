import React, { memo } from 'react';
import { Link } from 'expo-router';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { Box } from '@/components/ui/box';
import { Text } from '@/components/ui/text';
import { Heading } from '@/components/ui/heading';
import { HStack } from '@/components/ui/hstack';
import { VStack } from '@/components/ui/vstack';
import { Badge, BadgeText } from '@/components/ui/badge';
import { Pressable } from '@/components/ui/pressable';
import { DirectusImage } from '@/components/DirectusImage';
import { NewsTypes } from '@/types/NewsTypes';
import { useColorScheme } from 'react-native';

interface NewsCardProps {
  news: NewsTypes;
  variant?: 'default' | 'featured' | 'compact';
  onPress?: () => void;
}

export const NewsCard = memo(({ news, variant = 'default', onPress }: NewsCardProps) => {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  const formatPublishDate = (date: Date) => {
    return formatDistanceToNow(new Date(date), {
      addSuffix: true,
      locale: ptBR
    });
  };

  const getCategoryColor = (color?: string) => {
    return color || '#3B82F6';
  };

  if (variant === 'featured') {
    return (
      <Link href={`/(tabs)/(posts)/post/${news.id}`} asChild>
        <Pressable onPress={onPress}>
          {({ isHovered, isFocused, isPressed }) => (
            <Box
              className="relative h-80 rounded-2xl overflow-hidden shadow-lg"
              style={{
                transform: [{
                  scale: isPressed ? 0.98 : isHovered ? 1.02 : 1
                }],
                opacity: isPressed ? 0.9 : 1
              }}
            >
              {news.featured_image && (
                <DirectusImage
                  assetId={news.featured_image}
                  className="absolute inset-0 w-full h-full"
                  resizeMode="cover"
                />
              )}

              <LinearGradient
                colors={['transparent', 'rgba(0,0,0,0.8)']}
                className="absolute inset-0"
              />

              <Box className="absolute bottom-0 left-0 right-0 p-6">
                {news.category && (
                  <Badge
                    className="mb-3 self-start"
                    style={{ backgroundColor: getCategoryColor(news.category.color) }}
                  >
                    <BadgeText className="text-white text-xs font-semibold">
                      {news.category.name}
                    </BadgeText>
                  </Badge>
                )}

                <Heading className="text-white text-2xl font-bold mb-2">
                  {news.title}
                </Heading>

                <Text className="text-gray-200 mb-3" numberOfLines={2}>
                  {news.excerpt}
                </Text>

                <HStack className="items-center" space="md">
                  {news.author && (
                    <Text className="text-gray-300 text-sm">
                      {news.author.first_name} {news.author.last_name}
                    </Text>
                  )}
                  <Text className="text-gray-300 text-sm">•</Text>
                  <Text className="text-gray-300 text-sm">
                    {formatPublishDate(news.publish_date)}
                  </Text>
                  {news.reading_time && (
                    <>
                      <Text className="text-gray-300 text-sm">•</Text>
                      <Text className="text-gray-300 text-sm">
                        {news.reading_time} min de leitura
                      </Text>
                    </>
                  )}
                </HStack>
              </Box>

              {news.featured && (
                <Box className="absolute top-4 right-4 bg-yellow-500 rounded-full p-2">
                  <Ionicons name="star" size={16} color="white" />
                </Box>
              )}
            </Box>
          )}
        </Pressable>
      </Link>
    );
  }

  if (variant === 'compact') {
    return (
      <Link href={`/(tabs)/(posts)/post/${news.id}`} asChild>
        <Pressable onPress={onPress}>
          {({ isHovered, isFocused, isPressed }) => (
            <HStack
              className={`p-4 rounded-xl ${isDark ? 'bg-gray-800' : 'bg-white'} shadow-sm`}
              space="md"
              style={{
                opacity: isPressed ? 0.7 : 1
              }}
            >
              {news.featured_image && (
                <Box className="w-20 h-20 rounded-lg overflow-hidden">
                  <DirectusImage
                    assetId={news.featured_image}
                    className="w-full h-full"
                    resizeMode="cover"
                  />
                </Box>
              )}

              <VStack className="flex-1" space="xs">
                <Heading className="text-sm font-semibold" numberOfLines={2}>
                  {news.title}
                </Heading>

                <HStack className="items-center" space="sm">
                  {news.category && (
                    <Badge
                      size="sm"
                      style={{ backgroundColor: getCategoryColor(news.category.color) }}
                    >
                      <BadgeText className="text-white text-xs">
                        {news.category.name}
                      </BadgeText>
                    </Badge>
                  )}
                  <Text className="text-gray-500 text-xs">
                    {formatPublishDate(news.publish_date)}
                  </Text>
                </HStack>
              </VStack>

              <Ionicons
                name="chevron-forward"
                size={20}
                color={isDark ? '#9CA3AF' : '#6B7280'}
              />
            </HStack>
          )}
        </Pressable>
      </Link>
    );
  }

  return (
    <Link href={`/(tabs)/(posts)/post/${news.id}`} asChild>
      <Pressable onPress={onPress}>
        {({ isHovered, isFocused, isPressed }) => (
          <Box
            className={`rounded-xl overflow-hidden shadow-md ${
              isDark ? 'bg-gray-800' : 'bg-white'
            }`}
            style={{
              transform: [{
                scale: isPressed ? 0.98 : isHovered ? 1.02 : 1
              }],
              opacity: isPressed ? 0.9 : 1
            }}
          >
            {news.featured_image && (
              <Box className="relative h-48 overflow-hidden">
                <DirectusImage
                  assetId={news.featured_image}
                  className="w-full h-full"
                  resizeMode="cover"
                />

                {news.featured && (
                  <Box className="absolute top-3 right-3 bg-yellow-500 rounded-full p-2 shadow-lg">
                    <Ionicons name="star" size={16} color="white" />
                  </Box>
                )}

                {news.category && (
                  <Box
                    className="absolute top-3 left-3 px-3 py-1 rounded-full"
                    style={{ backgroundColor: getCategoryColor(news.category.color) }}
                  >
                    <Text className="text-white text-xs font-semibold">
                      {news.category.name}
                    </Text>
                  </Box>
                )}
              </Box>
            )}

            <VStack className="p-4" space="sm">
              <Heading className="text-lg font-bold" numberOfLines={2}>
                {news.title}
              </Heading>

              {news.excerpt && (
                <Text
                  className={`${isDark ? 'text-gray-300' : 'text-gray-600'} text-sm`}
                  numberOfLines={3}
                >
                  {news.excerpt}
                </Text>
              )}

              <HStack className="items-center justify-between mt-2">
                <HStack className="items-center" space="sm">
                  {news.author && (
                    <HStack className="items-center" space="xs">
                      <Ionicons
                        name="person-circle-outline"
                        size={16}
                        color={isDark ? '#9CA3AF' : '#6B7280'}
                      />
                      <Text className="text-gray-500 text-xs">
                        {news.author.first_name}
                      </Text>
                    </HStack>
                  )}

                  <Text className="text-gray-500 text-xs">•</Text>

                  <HStack className="items-center" space="xs">
                    <Ionicons
                      name="time-outline"
                      size={16}
                      color={isDark ? '#9CA3AF' : '#6B7280'}
                    />
                    <Text className="text-gray-500 text-xs">
                      {formatPublishDate(news.publish_date)}
                    </Text>
                  </HStack>
                </HStack>

                <HStack className="items-center" space="sm">
                  {news.reading_time && (
                    <HStack className="items-center" space="xs">
                      <Ionicons
                        name="book-outline"
                        size={16}
                        color={isDark ? '#9CA3AF' : '#6B7280'}
                      />
                      <Text className="text-gray-500 text-xs">
                        {news.reading_time} min
                      </Text>
                    </HStack>
                  )}

                  {news.views_count !== undefined && news.views_count > 0 && (
                    <HStack className="items-center" space="xs">
                      <Ionicons
                        name="eye-outline"
                        size={16}
                        color={isDark ? '#9CA3AF' : '#6B7280'}
                      />
                      <Text className="text-gray-500 text-xs">
                        {news.views_count}
                      </Text>
                    </HStack>
                  )}
                </HStack>
              </HStack>

              {news.tags && news.tags.length > 0 && (
                <HStack className="mt-2 flex-wrap" space="xs">
                  {news.tags.slice(0, 3).map((tag) => (
                    <Badge
                      key={tag.id}
                      size="sm"
                      variant="outline"
                      className="mb-1"
                    >
                      <BadgeText className="text-xs">#{tag.name}</BadgeText>
                    </Badge>
                  ))}
                  {news.tags.length > 3 && (
                    <Badge size="sm" variant="outline" className="mb-1">
                      <BadgeText className="text-xs">+{news.tags.length - 3}</BadgeText>
                    </Badge>
                  )}
                </HStack>
              )}
            </VStack>
          </Box>
        )}
      </Pressable>
    </Link>
  );
});

NewsCard.displayName = 'NewsCard';
