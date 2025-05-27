import React, { useState, useCallback, useContext, useRef } from 'react';
import { TextInput, Animated } from 'react-native';
import { Box } from '@/components/ui/box';
import { HStack } from '@/components/ui/hstack';
import { Icon } from '@/components/ui/icon';
import { Pressable } from '@/components/ui/pressable';
import { MaterialIcons, Ionicons } from '@expo/vector-icons';
import TranslationContext from '@/contexts/TranslationContext';

interface EventSearchBarProps {
  onSearch: (query: string) => void;
  placeholder?: string;
  value?: string;
}

export const EventSearchBar: React.FC<EventSearchBarProps> = ({
  onSearch,
  placeholder,
  value = '',
}) => {
  const [searchQuery, setSearchQuery] = useState(value);
  const [isFocused, setIsFocused] = useState(false);
  const { t } = useContext(TranslationContext);
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const handleFocus = useCallback(() => {
    setIsFocused(true);
    Animated.spring(scaleAnim, {
      toValue: 1.02,
      useNativeDriver: true,
    }).start();
  }, [scaleAnim]);

  const handleBlur = useCallback(() => {
    setIsFocused(false);
    Animated.spring(scaleAnim, {
      toValue: 1,
      useNativeDriver: true,
    }).start();
  }, [scaleAnim]);

  const handleSearch = useCallback((text: string) => {
    setSearchQuery(text);
    onSearch(text);
  }, [onSearch]);

  const handleClear = useCallback(() => {
    setSearchQuery('');
    onSearch('');
  }, [onSearch]);

  return (
    <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
      <Box
        className={`mx-4 mb-4 bg-white rounded-xl shadow-sm border ${
          isFocused ? 'border-purple-500' : 'border-gray-200'
        }`}
      >
        <HStack className="items-center px-4 py-2">
          <Icon
            as={Ionicons}
            name="search"
            size="md"
            className={isFocused ? 'text-purple-600' : 'text-gray-400'}
          />
          
          <TextInput
            value={searchQuery}
            onChangeText={handleSearch}
            onFocus={handleFocus}
            onBlur={handleBlur}
            placeholder={placeholder || t('search_events') || 'Buscar eventos...'}
            placeholderTextColor="#9CA3AF"
            className="flex-1 ml-3 text-base text-gray-900"
            returnKeyType="search"
            autoCorrect={false}
            autoCapitalize="none"
          />
          
          {searchQuery.length > 0 && (
            <Pressable onPress={handleClear} className="p-1">
              <Icon
                as={MaterialIcons}
                name="clear"
                size="sm"
                className="text-gray-400"
              />
            </Pressable>
          )}
        </HStack>
      </Box>
    </Animated.View>
  );
};

export default EventSearchBar;