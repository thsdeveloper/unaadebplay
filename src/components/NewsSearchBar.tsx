import React, { useState, useCallback, useRef, useEffect } from 'react';
import { TextInput, useColorScheme, Keyboard, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Box } from '@/components/ui/box';
import { HStack } from '@/components/ui/hstack';
import { Pressable } from '@/components/ui/pressable';
import { Text } from '@/components/ui/text';
import debounce from 'lodash/debounce';

interface NewsSearchBarProps {
  onSearch: (query: string) => void;
  placeholder?: string;
  value?: string;
  onFocus?: () => void;
  onBlur?: () => void;
  autoFocus?: boolean;
}

export const NewsSearchBar = ({
  onSearch,
  placeholder = 'Buscar notícias...',
  value = '',
  onFocus,
  onBlur,
  autoFocus = false
}: NewsSearchBarProps) => {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const [searchQuery, setSearchQuery] = useState(value);
  const [isFocused, setIsFocused] = useState(false);
  const inputRef = useRef<TextInput>(null);

  // Debounce search to avoid too many API calls
  const debouncedSearch = useRef(
    debounce((query: string) => {
      onSearch(query);
    }, 500)
  ).current;

  useEffect(() => {
    return () => {
      debouncedSearch.cancel();
    };
  }, [debouncedSearch]);

  useEffect(() => {
    setSearchQuery(value);
  }, [value]);

  const handleChangeText = useCallback((text: string) => {
    setSearchQuery(text);
    debouncedSearch(text);
  }, [debouncedSearch]);

  const handleClear = useCallback(() => {
    setSearchQuery('');
    onSearch('');
    inputRef.current?.focus();
  }, [onSearch]);

  const handleFocus = useCallback(() => {
    setIsFocused(true);
    onFocus?.();
  }, [onFocus]);

  const handleBlur = useCallback(() => {
    setIsFocused(false);
    onBlur?.();
  }, [onBlur]);

  const handleCancel = useCallback(() => {
    handleClear();
    Keyboard.dismiss();
    handleBlur();
  }, [handleClear, handleBlur]);

  return (
    <HStack
      className={`px-4 py-3 rounded-xl items-center ${
        isFocused
          ? 'border-2 border-blue-500'
          : `border ${isDark ? 'border-gray-700' : 'border-gray-300'}`
      } ${isDark ? 'bg-gray-800' : 'bg-gray-100'}`}
      space="sm"
    >
      <Ionicons
        name="search"
        size={20}
        color={isFocused ? '#3B82F6' : isDark ? '#9CA3AF' : '#6B7280'}
      />
      
      <TextInput
        ref={inputRef}
        value={searchQuery}
        onChangeText={handleChangeText}
        onFocus={handleFocus}
        onBlur={handleBlur}
        placeholder={placeholder}
        placeholderTextColor={isDark ? '#6B7280' : '#9CA3AF'}
        autoFocus={autoFocus}
        returnKeyType="search"
        autoCapitalize="none"
        autoCorrect={false}
        style={{
          flex: 1,
          fontSize: 16,
          color: isDark ? '#FFFFFF' : '#000000',
          paddingVertical: Platform.OS === 'ios' ? 8 : 4,
        }}
      />
      
      {searchQuery.length > 0 && (
        <Pressable onPress={handleClear} hitSlop={8}>
          <Ionicons
            name="close-circle"
            size={20}
            color={isDark ? '#6B7280' : '#9CA3AF'}
          />
        </Pressable>
      )}
      
      {isFocused && Platform.OS === 'ios' && (
        <Pressable onPress={handleCancel} hitSlop={8}>
          <Text className="text-blue-500 font-medium">Cancelar</Text>
        </Pressable>
      )}
    </HStack>
  );
};

export default NewsSearchBar;