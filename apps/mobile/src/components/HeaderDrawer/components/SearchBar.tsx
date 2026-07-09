import React from 'react';
import { TextInput, View, TouchableOpacity } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { Box } from '@/components/ui/box';

interface SearchBarProps {
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
}

export const SearchBar: React.FC<SearchBarProps> = ({ 
  value, 
  onChangeText, 
  placeholder = "Buscar no menu..." 
}) => {
  return (
    <Box className="mx-4 mb-4">
      <View className="flex-row items-center bg-background-100 dark:bg-background-800 rounded-xl px-4 py-3 border border-outline-200 dark:border-outline-800">
        <Feather 
          name="search" 
          size={20} 
          color="#9CA3AF"
          style={{ marginRight: 12 }}
        />
        <TextInput
          className="flex-1 text-typography-900 dark:text-typography-100 text-base"
          placeholder={placeholder}
          placeholderTextColor="#9CA3AF"
          value={value}
          onChangeText={onChangeText}
          autoCapitalize="none"
          autoCorrect={false}
        />
        {value.length > 0 && (
          <TouchableOpacity onPress={() => onChangeText('')}>
            <Feather name="x" size={18} color="#9CA3AF" />
          </TouchableOpacity>
        )}
      </View>
    </Box>
  );
};