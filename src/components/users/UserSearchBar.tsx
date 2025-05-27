import React, { useState, useRef } from 'react';
import { TextInput, View, Animated, Keyboard } from 'react-native';
import { Search, X } from 'lucide-react-native';
import { Pressable } from '@/components/ui/pressable';
import { HStack } from '@/components/ui/hstack';
import { useColorScheme } from 'react-native';

interface UserSearchBarProps {
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
}

export function UserSearchBar({
  value,
  onChangeText,
  placeholder = 'Buscar usuários...'
}: UserSearchBarProps) {
  const [isFocused, setIsFocused] = useState(false);
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const animatedValue = useRef(new Animated.Value(0)).current;

  const handleFocus = () => {
    setIsFocused(true);
    Animated.timing(animatedValue, {
      toValue: 1,
      duration: 200,
      useNativeDriver: false,
    }).start();
  };

  const handleBlur = () => {
    setIsFocused(false);
    Animated.timing(animatedValue, {
      toValue: 0,
      duration: 200,
      useNativeDriver: false,
    }).start();
  };

  const handleClear = () => {
    onChangeText('');
    Keyboard.dismiss();
  };

  const borderColor = animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: [
      isDark ? '#374151' : '#e5e7eb',
      '#3b82f6'
    ],
  });

  const shadowOpacity = animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 0.1],
  });

  return (
    <Animated.View
      style={{
        borderWidth: 1.5,
        borderColor,
        borderRadius: 12,
        backgroundColor: isDark ? '#1f2937' : '#f9fafb',
        shadowColor: '#3b82f6',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity,
        shadowRadius: 4,
        elevation: isFocused ? 3 : 0,
      }}
    >
      <HStack className="items-center px-4 py-3">
        <Search
          size={20}
          color={isFocused ? '#3b82f6' : isDark ? '#9ca3af' : '#6b7280'}
        />
        
        <TextInput
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={isDark ? '#6b7280' : '#9ca3af'}
          onFocus={handleFocus}
          onBlur={handleBlur}
          style={{
            flex: 1,
            marginLeft: 12,
            fontSize: 16,
            color: isDark ? '#f3f4f6' : '#111827',
            paddingVertical: 0,
          }}
          returnKeyType="search"
          autoCapitalize="none"
          autoCorrect={false}
        />

        {value.length > 0 && (
          <Pressable
            onPress={handleClear}
            className="ml-2 p-1"
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <View className="bg-gray-200 dark:bg-gray-700 rounded-full p-1">
              <X size={14} color={isDark ? '#f3f4f6' : '#374151'} />
            </View>
          </Pressable>
        )}
      </HStack>
    </Animated.View>
  );
}