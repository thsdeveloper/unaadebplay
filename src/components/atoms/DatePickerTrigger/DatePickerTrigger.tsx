import React, { memo } from 'react';
import { Pressable } from 'react-native';
import { Calendar } from 'lucide-react-native';
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
  const formatDate = (date: Date) =>
    date.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' });

  return (
    <>
      {label && (
        <Text variant="label" className="mb-2 text-typography-300">
          {label}
        </Text>
      )}

      <Pressable
        onPress={onPress}
        disabled={disabled}
        className={`
          h-14
          rounded-2xl
          border
          ${error ? 'border-error-500' : 'border-white/10'}
          bg-white/[0.06]
          px-4
          flex-row
          items-center
          ${disabled ? 'opacity-50' : 'active:bg-white/10'}
          ${className || ''}
        `.trim()}
      >
        <Calendar size={20} color="rgba(226,232,240,0.7)" />
        <Text
          numberOfLines={1}
          className={`flex-1 ml-3 text-base ${value ? 'text-typography-0' : 'text-typography-500'}`}
        >
          {value ? formatDate(value) : placeholder}
        </Text>
      </Pressable>

      {error && (
        <Text variant="error" className="mt-1.5 ml-1">
          {error}
        </Text>
      )}
    </>
  );
});

DatePickerTrigger.displayName = 'DatePickerTrigger';
