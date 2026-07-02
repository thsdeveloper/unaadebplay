import React, { memo } from 'react';
import { Pressable } from 'react-native';
import { ChevronDown } from 'lucide-react-native';
import { Text } from '../Text';
import { SelectTriggerProps } from './types';

/**
 * Gatilho "vidro fosco" genérico para campos de seleção (padrão dos formulários
 * de auth). Generaliza o DatePickerTrigger: ícone opcional à esquerda, valor/
 * placeholder no centro e chevron à direita. Pressable cru (não wrapper Gluestack),
 * seguindo a precedência dos gatilhos já existentes.
 */
export const SelectTrigger = memo<SelectTriggerProps>(({
  value,
  placeholder = 'Selecione',
  label,
  error,
  leftIcon,
  onPress,
  disabled = false,
  className,
  accessibilityHint,
}) => (
  <>
    {label && (
      <Text variant="label" className="mb-2 text-typography-300">
        {label}
      </Text>
    )}

    <Pressable
      onPress={onPress}
      disabled={disabled}
      accessibilityRole="button"
      accessibilityLabel={`${label ?? 'Seleção'}: ${value || 'nenhum item selecionado'}`}
      accessibilityHint={accessibilityHint}
      accessibilityState={{ disabled }}
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
      {leftIcon}
      <Text
        numberOfLines={1}
        className={`flex-1 ${leftIcon ? 'ml-3' : ''} text-base ${value ? 'text-typography-0' : 'text-typography-500'}`}
      >
        {value || placeholder}
      </Text>
      <ChevronDown size={20} color="rgba(226,232,240,0.7)" />
    </Pressable>

    {error && (
      <Text variant="error" className="mt-1.5 ml-1">
        {error}
      </Text>
    )}
  </>
));

SelectTrigger.displayName = 'SelectTrigger';
