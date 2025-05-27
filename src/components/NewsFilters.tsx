import React, { useState } from 'react';
import {
  Actionsheet,
  ActionsheetBackdrop,
  ActionsheetContent,
  ActionsheetDragIndicator,
  ActionsheetDragIndicatorWrapper,
  ActionsheetItem,
  ActionsheetItemText,
  ActionsheetSectionHeaderText,
} from '@/components/ui/actionsheet';
import { Box } from '@/components/ui/box';
import { HStack } from '@/components/ui/hstack';
import { VStack } from '@/components/ui/vstack';
import { Text } from '@/components/ui/text';
import { Pressable } from '@/components/ui/pressable';
import { Badge, BadgeText } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Switch } from '@/components/ui/switch';
import { Ionicons } from '@expo/vector-icons';
import { NewsFilters as NewsFiltersType, NewsCategory, NewsTag } from '@/types/NewsTypes';
import { useColorScheme } from 'react-native';

interface NewsFiltersProps {
  isOpen: boolean;
  onClose: () => void;
  filters: NewsFiltersType;
  onApplyFilters: (filters: NewsFiltersType) => void;
  categories: NewsCategory[];
  tags: NewsTag[];
}

export const NewsFilters = ({
  isOpen,
  onClose,
  filters,
  onApplyFilters,
  categories,
  tags
}: NewsFiltersProps) => {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const [localFilters, setLocalFilters] = useState<NewsFiltersType>(filters);

  const handleApply = () => {
    onApplyFilters(localFilters);
    onClose();
  };

  const handleReset = () => {
    setLocalFilters({});
  };

  const toggleTag = (tagId: string) => {
    const currentTags = localFilters.tags || [];
    const newTags = currentTags.includes(tagId)
      ? currentTags.filter(id => id !== tagId)
      : [...currentTags, tagId];
    setLocalFilters({ ...localFilters, tags: newTags });
  };

  const activeFiltersCount = Object.keys(localFilters).reduce((count, key) => {
    if (key === 'tags' && localFilters.tags?.length) return count + localFilters.tags.length;
    if (localFilters[key as keyof NewsFiltersType]) return count + 1;
    return count;
  }, 0);

  return (
    <Actionsheet isOpen={isOpen} onClose={onClose}>
      <ActionsheetBackdrop />
      <ActionsheetContent className="max-h-[80%]">
        <ActionsheetDragIndicatorWrapper>
          <ActionsheetDragIndicator />
        </ActionsheetDragIndicatorWrapper>
        
        <Box className="p-4 pb-8">
          <HStack className="justify-between items-center mb-4">
            <Text className="text-xl font-bold">Filtros</Text>
            <HStack space="md">
              {activeFiltersCount > 0 && (
                <Badge className="bg-blue-500">
                  <BadgeText className="text-white">{activeFiltersCount}</BadgeText>
                </Badge>
              )}
              <Pressable onPress={handleReset}>
                <Text className="text-blue-500 font-medium">Limpar</Text>
              </Pressable>
            </HStack>
          </HStack>

          <VStack space="lg">
            {/* Categorias */}
            <VStack space="sm">
              <Text className="font-semibold text-gray-700 mb-2">Categoria</Text>
              <VStack space="xs">
                {categories.map((category) => (
                  <Pressable
                    key={category.id}
                    onPress={() => setLocalFilters({ 
                      ...localFilters, 
                      category: localFilters.category === category.id ? undefined : category.id 
                    })}
                  >
                    <HStack
                      className={`p-3 rounded-lg items-center justify-between ${
                        localFilters.category === category.id
                          ? 'bg-blue-100 dark:bg-blue-900'
                          : isDark ? 'bg-gray-800' : 'bg-gray-100'
                      }`}
                    >
                      <HStack space="sm" className="items-center">
                        {category.icon && (
                          <Ionicons
                            name={category.icon as any}
                            size={20}
                            color={category.color || '#6B7280'}
                          />
                        )}
                        <Text className={localFilters.category === category.id ? 'font-semibold' : ''}>
                          {category.name}
                        </Text>
                      </HStack>
                      {localFilters.category === category.id && (
                        <Ionicons name="checkmark" size={20} color="#3B82F6" />
                      )}
                    </HStack>
                  </Pressable>
                ))}
              </VStack>
            </VStack>

            {/* Tags */}
            <VStack space="sm">
              <Text className="font-semibold text-gray-700 mb-2">Tags</Text>
              <Box className="flex-row flex-wrap gap-2">
                {tags.map((tag) => {
                  const isSelected = localFilters.tags?.includes(tag.id) || false;
                  return (
                    <Pressable
                      key={tag.id}
                      onPress={() => toggleTag(tag.id)}
                    >
                      <Badge
                        className={`${
                          isSelected
                            ? 'bg-blue-500'
                            : isDark ? 'bg-gray-700' : 'bg-gray-200'
                        }`}
                      >
                        <BadgeText
                          className={isSelected ? 'text-white' : ''}
                        >
                          #{tag.name}
                        </BadgeText>
                      </Badge>
                    </Pressable>
                  );
                })}
              </Box>
            </VStack>

            {/* Notícias em Destaque */}
            <HStack className="justify-between items-center">
              <Text className="font-semibold text-gray-700">Apenas Destaques</Text>
              <Switch
                value={localFilters.featured || false}
                onValueChange={(value) => setLocalFilters({ ...localFilters, featured: value })}
              />
            </HStack>
          </VStack>

          <HStack className="mt-6" space="sm">
            <Pressable
              onPress={onClose}
              className="flex-1 py-3 rounded-lg border border-gray-300 dark:border-gray-600"
            >
              <Text className="text-center font-medium">Cancelar</Text>
            </Pressable>
            <Pressable
              onPress={handleApply}
              className="flex-1 py-3 rounded-lg bg-blue-500"
            >
              <Text className="text-center text-white font-medium">Aplicar Filtros</Text>
            </Pressable>
          </HStack>
        </Box>
      </ActionsheetContent>
    </Actionsheet>
  );
};

export default NewsFilters;