import React, { useContext, useCallback, useState } from "react";
import { FlatList, RefreshControl, ActivityIndicator } from "react-native";
import { Ionicons } from '@expo/vector-icons';
import { NewsCard } from "@/components/NewsCard";
import NewsSearchBar from "@/components/NewsSearchBar";
import NewsFilters from "@/components/NewsFilters";
import TranslationContext from "@/contexts/TranslationContext";
import { useNews } from "@/hooks/useNews";
import { NewsListSkeleton } from "@/components/Skeletons/NewsSkeletons";
import AlertContext from "@/contexts/AlertContext";
import { Box } from "@/components/ui/box";
import { VStack } from "@/components/ui/vstack";
import { HStack } from "@/components/ui/hstack";
import { Heading } from "@/components/ui/heading";
import { Text } from "@/components/ui/text";
import { Pressable } from "@/components/ui/pressable";
import { Badge, BadgeText } from "@/components/ui/badge";
import { ScrollView } from "@/components/ui/scroll-view";
import { useColorScheme } from 'react-native';

export default function PostsTabs() {
    const { t } = useContext(TranslationContext);
    const alert = useContext(AlertContext);
    const colorScheme = useColorScheme();
    const isDark = colorScheme === 'dark';
    
    const {
        news,
        categories,
        tags,
        isLoading,
        isRefreshing,
        error,
        hasMore,
        filters,
        loadMore,
        refresh,
        setFilters,
        clearFilters
    } = useNews(10);
    
    console.log('[PostsTabs] News data:', {
        total_news: news.length,
        news_with_images: news.filter(item => !!item.featured_image).length,
        first_news: news[0] ? {
            id: news[0].id,
            title: news[0].title,
            featured_image: news[0].featured_image
        } : null
    });

    const [selectedCategory, setSelectedCategory] = React.useState<string | null>(null);
    const [showFilters, setShowFilters] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');

    const handleCategoryPress = useCallback((categoryId: string | null) => {
        setSelectedCategory(categoryId);
        if (categoryId) {
            setFilters({ ...filters, category: categoryId });
        } else {
            const { category, ...restFilters } = filters;
            setFilters(restFilters);
        }
    }, [filters, setFilters]);

    const handleSearch = useCallback((query: string) => {
        setSearchQuery(query);
        setFilters({ ...filters, search: query || undefined });
    }, [filters, setFilters]);

    const handleApplyFilters = useCallback((newFilters: typeof filters) => {
        setFilters(newFilters);
        setSelectedCategory(newFilters.category || null);
    }, [setFilters]);

    const activeFiltersCount = Object.keys(filters).reduce((count, key) => {
        if (key === 'tags' && filters.tags?.length) return count + filters.tags.length;
        if (key === 'search' && searchQuery) return count + 1;
        if (filters[key as keyof typeof filters]) return count + 1;
        return count;
    }, 0);

    const renderHeader = () => (
        <VStack className="bg-white dark:bg-gray-900" space="sm">
            <HStack className="px-4 py-2" space="sm">
                <Box className="flex-1">
                    <NewsSearchBar
                        value={searchQuery}
                        onSearch={handleSearch}
                        placeholder={t('search_news_placeholder')}
                    />
                </Box>
                <Pressable
                    onPress={() => setShowFilters(true)}
                    className="p-3 rounded-lg bg-gray-100 dark:bg-gray-800"
                >
                    <Box className="relative">
                        <Ionicons
                            name="filter"
                            size={24}
                            color={isDark ? '#E5E7EB' : '#374151'}
                        />
                        {activeFiltersCount > 0 && (
                            <Box className="absolute -top-2 -right-2 bg-blue-500 rounded-full w-5 h-5 items-center justify-center">
                                <Text className="text-white text-xs font-bold">
                                    {activeFiltersCount}
                                </Text>
                            </Box>
                        )}
                    </Box>
                </Pressable>
            </HStack>
            
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                <HStack space="sm" className="px-4 pb-3">
                    <Pressable
                        onPress={() => handleCategoryPress(null)}
                        className={`px-4 py-2 rounded-full ${
                            !selectedCategory
                                ? 'bg-blue-500'
                                : isDark ? 'bg-gray-700' : 'bg-gray-200'
                        }`}
                    >
                        <Text className={!selectedCategory ? 'text-white font-semibold' : ''}>
                            Todas
                        </Text>
                    </Pressable>
                
                {categories.map((category) => (
                    <Pressable
                        key={category.id}
                        onPress={() => handleCategoryPress(category.id)}
                        className={`px-4 py-2 rounded-full ${
                            selectedCategory === category.id
                                ? 'bg-blue-500'
                                : isDark ? 'bg-gray-700' : 'bg-gray-200'
                        }`}
                    >
                        <HStack space="xs" className="items-center">
                            {category.icon && (
                                <Ionicons
                                    name={category.icon as any}
                                    size={16}
                                    color={selectedCategory === category.id ? 'white' : category.color || '#6B7280'}
                                />
                            )}
                            <Text className={selectedCategory === category.id ? 'text-white font-semibold' : ''}>
                                {category.name}
                            </Text>
                        </HStack>
                    </Pressable>
                ))}
                </HStack>
            </ScrollView>
        </VStack>
    );

    const renderNewsItem = ({ item, index }: { item: any; index: number }) => {
        const variant = index === 0 && news.length > 3 && !searchQuery ? 'featured' : 'default';
        console.log(`[PostsTabs.renderNewsItem] Rendering item ${index}:`, {
            id: item.id,
            title: item.title,
            featured_image: item.featured_image,
            variant
        });
        return (
            <Box className="px-4">
                <NewsCard news={item} variant={variant} />
            </Box>
        );
    };

    const renderFooter = () => {
        if (!hasMore) return null;
        
        return (
            <Box className="py-4">
                <ActivityIndicator size="small" color="#3B82F6" />
            </Box>
        );
    };

    const renderEmpty = () => {
        if (isLoading) return null;
        
        return (
            <VStack className="flex-1 items-center justify-center p-8" space="md">
                <Ionicons 
                    name="newspaper-outline" 
                    size={64} 
                    color={isDark ? '#6B7280' : '#9CA3AF'} 
                />
                <Heading className="text-center text-gray-600">
                    {t('no_news_available')}
                </Heading>
                <Text className="text-center text-gray-500">
                    {t('check_back_later_for_updates')}
                </Text>
            </VStack>
        );
    };

    if (isLoading && news.length === 0) {
        return (
            <VStack className="flex-1">
                {renderHeader()}
                <Box className="px-4">
                    <NewsListSkeleton count={5} variant="default" />
                </Box>
            </VStack>
        );
    }

    if (error && news.length === 0) {
        return (
            <VStack className="flex-1 items-center justify-center p-8" space="md">
                <Ionicons 
                    name="alert-circle-outline" 
                    size={64} 
                    color="#EF4444" 
                />
                <Heading className="text-center text-red-600">
                    {t('error_loading_news')}
                </Heading>
                <Text className="text-center text-gray-500">
                    {error}
                </Text>
                <Pressable
                    onPress={refresh}
                    className="px-6 py-3 bg-blue-500 rounded-full"
                >
                    <Text className="text-white font-semibold">
                        {t('try_again')}
                    </Text>
                </Pressable>
            </VStack>
        );
    }

    return (
        <VStack className="flex-1">
            {renderHeader()}
            
            <FlatList
                data={news}
                renderItem={renderNewsItem}
                keyExtractor={(item) => item.id}
                contentContainerStyle={{ paddingBottom: 16 }}
                ItemSeparatorComponent={() => <Box className="h-4 mx-4" />}
                ListEmptyComponent={renderEmpty}
                ListFooterComponent={renderFooter}
                refreshControl={
                    <RefreshControl
                        refreshing={isRefreshing}
                        onRefresh={refresh}
                        tintColor="#3B82F6"
                    />
                }
                onEndReached={loadMore}
                onEndReachedThreshold={0.5}
                showsVerticalScrollIndicator={false}
            />
            
            <NewsFilters
                isOpen={showFilters}
                onClose={() => setShowFilters(false)}
                filters={filters}
                onApplyFilters={handleApplyFilters}
                categories={categories}
                tags={tags}
            />
        </VStack>
    );
}
