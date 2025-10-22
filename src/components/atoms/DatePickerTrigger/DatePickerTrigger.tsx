import React, { memo } from 'react';
import { TouchableOpacity } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { Text } from '../Text';
import { DatePickerTriggerProps } from './types';

export const DatePickerTrigger = memo<DatePickerTriggerProps>(({
  value,
  placeholder = 'Selecione uma data',
  label,
  error,
  onPress,
  disabled = false,
  className,
}) => {
  const formatDate = (date: Date) => {
    return date.toLocaleDateString('pt-BR');
  };

  return (
    <>
      {label && (
        <Text variant="label" className="mb-2">
          {label}
        </Text>
      )}
      
      <TouchableOpacity
        onPress={onPress}
        disabled={disabled}
        className={`
          rounded-2xl
          border
          ${error ? 'border-red-500' : 'border-white/20'}
          bg-white/5
          px-4
          py-4.5
          flex-row
          items-center
          justify-between
          ${disabled ? 'opacity-50' : 'active:bg-white/10'}
          ${className || ''}
        `.trim()}
        activeOpacity={0.8}
      >
        <Text 
          className={`
            ${value ? 'text-white' : 'text-white/30'}
            text-base
          `.trim()}
        >
          {value ? formatDate(value) : placeholder}
        </Text>
        
        <MaterialIcons 
          name="calendar-today" 
          size={20} 
          color="rgba(255,255,255,0.5)" 
        />
      </TouchableOpacity>

      {error && (
        <Text variant="error" className="mt-1">
          {error}
        </Text>
      )}
    </>
  );
});

DatePickerTrigger.displayName = 'DatePickerTrigger';