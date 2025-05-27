import React, { useContext, useCallback } from 'react';
import { ScrollView, Share, useWindowDimensions, useColorScheme } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import RenderHtml from "react-native-render-html";
import { useGlobalSearchParams, Stack } from "expo-router";
import { useNewsItem } from "@/hooks/useNews";
import { NewsCard } from "@/components/NewsCard";
import { NewsDetailSkeleton } from "@/components/Skeletons/NewsSkeletons";
import TranslationContext from "@/contexts/TranslationContext";
import { Box } from "@/components/ui/box";
import { Heading } from "@/components/ui/heading";
import { Text } from "@/components/ui/text";
import { HStack } from "@/components/ui/hstack";
import { VStack } from "@/components/ui/vstack";
import { Badge, BadgeText } from "@/components/ui/badge";
import { Pressable } from "@/components/ui/pressable";
import { Avatar } from "@/components/ui/avatar";
import { Divider } from "@/components/ui/divider";
import DirectusImage from "@/components/DirectusImage";

export default function Post() {
    const { width } = useWindowDimensions();
    const colorScheme = useColorScheme();
    const isDark = colorScheme === 'dark';
    const { t } = useContext(TranslationContext);
    const { id } = useGlobalSearchParams();

    const { news, relatedNews, isLoading, error } = useNewsItem(id as string);

    const handleShare = useCallback(async () => {
        if (!news) return;

        try {
            await Share.share({
                message: `${news.title}\n\n${news.excerpt || ''}`,
                title: news.title,
            });
        } catch (error) {
            console.error('Error sharing:', error);
        }
    }, [news]);

    const formatPublishDate = (date: Date) => {
        return format(new Date(date), "d 'de' MMMM 'de' yyyy", { locale: ptBR });
    };

    const renderHeader = () => (
        <Stack.Screen
            options={{
                headerRight: () => (
                    <Pressable onPress={handleShare}>
                        <Ionicons name="share-outline" size={24} color={isDark ? 'white' : 'black'} />
                    </Pressable>
                ),
            }}
        />
    );

    if (isLoading) {
        return (
            <ScrollView>
                <Box className="p-4">
                    <NewsDetailSkeleton />
                </Box>
            </ScrollView>
        );
    }

    if (error || !news) {
        return (
            <VStack className="flex-1 items-center justify-center p-8" space="md">
                <Ionicons name="alert-circle-outline" size={64} color="#EF4444" />
                <Heading className="text-center text-red-600">
                    {t('error_loading_news')}
                </Heading>
                <Text className="text-center text-gray-500">
                    {error || t('news_not_found')}
                </Text>
            </VStack>
        );
    }

    return (
        <>
            {renderHeader()}
            <ScrollView showsVerticalScrollIndicator={false}>
                <Box>
                    {news.featured_image && (
                        <Box className="relative h-80">
                            <DirectusImage
                                assetId={news.featured_image}
                                className="w-full h-full"
                                resizeMode="cover"
                            />
                            <LinearGradient
                                colors={['transparent', 'rgba(0, 0, 0, 0.8)']}
                                className="absolute inset-0"
                            />
                            <Box className="absolute bottom-0 left-0 right-0 p-6">
                                {news.category && (
                                    <Badge
                                        className="mb-3 self-start"
                                        style={{ backgroundColor: news.category.color || '#3B82F6' }}
                                    >
                                        <BadgeText className="text-white font-semibold">
                                            {news.category.name}
                                        </BadgeText>
                                    </Badge>
                                )}
                                <Heading className="text-white text-3xl font-bold">
                                    {news.title}
                                </Heading>
                            </Box>
                        </Box>
                    )}

                    <VStack className="p-4" space="lg">
                        {news.excerpt && (
                            <Text className="text-gray-600 text-lg leading-relaxed">
                                {news.excerpt}
                            </Text>
                        )}

                        <HStack className="items-center justify-between">
                            {news.author && (
                                <HStack className="items-center" space="sm">
                                    <Avatar size="sm">
                                        {news.author.avatar ? (
                                            <DirectusImage
                                                assetId={news.author.avatar}
                                                className="w-full h-full rounded-full"
                                            />
                                        ) : (
                                            <Box className="w-full h-full rounded-full bg-gray-300 items-center justify-center">
                                                <Text className="text-white font-bold">
                                                    {news.author.first_name?.charAt(0)}
                                                </Text>
                                            </Box>
                                        )}
                                    </Avatar>
                                    <VStack>
                                        <Text className="font-semibold">
                                            {news.author.first_name} {news.author.last_name}
                                        </Text>
                                        <Text className="text-gray-500 text-xs">
                                            {formatPublishDate(news.publish_date)}
                                        </Text>
                                    </VStack>
                                </HStack>
                            )}

                            <HStack className="items-center" space="md">
                                {news.reading_time && (
                                    <HStack className="items-center" space="xs">
                                        <Ionicons name="time-outline" size={16} color="#6B7280" />
                                        <Text className="text-gray-500 text-sm">
                                            {news.reading_time} min
                                        </Text>
                                    </HStack>
                                )}
                                {news.views_count !== undefined && (
                                    <HStack className="items-center" space="xs">
                                        <Ionicons name="eye-outline" size={16} color="#6B7280" />
                                        <Text className="text-gray-500 text-sm">
                                            {news.views_count} views
                                        </Text>
                                    </HStack>
                                )}
                            </HStack>
                        </HStack>

                        <Divider className="my-4" />

                        <Box>
                            <RenderHtml
                                contentWidth={width - 32}
                                source={{ html: news.content }}
                                baseStyle={{
                                    color: isDark ? '#E5E7EB' : '#374151',
                                    fontSize: 16,
                                    lineHeight: 28,
                                }}
                                tagsStyles={{
                                    p: { marginBottom: 16 },
                                    h1: { fontSize: 28, fontWeight: 'bold', marginBottom: 16 },
                                    h2: { fontSize: 24, fontWeight: 'bold', marginBottom: 12 },
                                    h3: { fontSize: 20, fontWeight: 'bold', marginBottom: 8 },
                                    img: { maxWidth: '100%', height: 'auto' },
                                    a: { color: '#3B82F6', textDecorationLine: 'underline' },
                                    blockquote: {
                                        borderLeftWidth: 4,
                                        borderLeftColor: '#3B82F6',
                                        paddingLeft: 16,
                                        marginVertical: 16,
                                        fontStyle: 'italic',
                                        color: '#6B7280',
                                    },
                                }}
                            />
                        </Box>

                        {news.tags && news.tags.length > 0 && (
                            <VStack space="sm">
                                <Text className="font-semibold text-gray-700">
                                    Tags
                                </Text>
                                <HStack className="flex-wrap" space="sm">
                                    {news.tags.map((tag) => (
                                        <Badge
                                            key={tag.id}
                                            variant="outline"
                                            className="mb-2"
                                        >
                                            <BadgeText className="text-sm">#{tag.name}</BadgeText>
                                        </Badge>
                                    ))}
                                </HStack>
                            </VStack>
                        )}

                        {news.gallery && news.gallery.length > 0 && (
                            <VStack space="sm">
                                <Text className="font-semibold text-gray-700">
                                    Galeria de Imagens
                                </Text>
                                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                                    <HStack space="sm">
                                        {news.gallery.map((imageId, index) => (
                                            <Box key={index} className="w-64 h-48 rounded-lg overflow-hidden">
                                                <DirectusImage
                                                    assetId={imageId}
                                                    className="w-full h-full"
                                                    resizeMode="cover"
                                                />
                                            </Box>
                                        ))}
                                    </HStack>
                                </ScrollView>
                            </VStack>
                        )}

                        {relatedNews.length > 0 && (
                            <VStack space="md" className="mt-8">
                                <Heading className="text-xl font-bold">
                                    {t('related_news')}
                                </Heading>
                                <VStack space="md">
                                    {relatedNews.map((item) => (
                                        <NewsCard
                                            key={item.id}
                                            news={item}
                                            variant="compact"
                                        />
                                    ))}
                                </VStack>
                            </VStack>
                        )}
                    </VStack>
                </Box>
            </ScrollView>
        </>
    );
}


