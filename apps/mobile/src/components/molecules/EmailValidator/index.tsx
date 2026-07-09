import React, { memo, useEffect, useState, useCallback } from 'react';
import { View, ActivityIndicator } from 'react-native';
import { Check, X } from 'lucide-react-native';
import { Input } from '@/components/atoms/Input';
import { Icon } from '@/components/atoms/Icon';
import { Text } from '@/components/atoms/Text';
import { userService } from '@/services/user';
import { useDebouncedCallback } from 'use-debounce';

interface EmailValidatorProps {
  value: string;
  onChange: (value: string) => void;
  onValidationChange?: (isValid: boolean) => void;
  error?: string;
  disabled?: boolean;
  className?: string;
}

export const EmailValidator = memo<EmailValidatorProps>(({ 
  value,
  onChange,
  onValidationChange,
  error,
  disabled = false,
  className
}) => {
  const [checking, setChecking] = useState(false);
  const [isAvailable, setIsAvailable] = useState<boolean | null>(null);
  const [validationError, setValidationError] = useState<string>('');

  const checkEmailAvailability = useCallback(async (email: string) => {
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setIsAvailable(null);
      setValidationError('');
      return;
    }

    try {
      setChecking(true);
      const available = await userService.checkEmailAvailability(email);
      setIsAvailable(available);
      setValidationError(available ? '' : 'Este email já está em uso');
      onValidationChange?.(available);
    } catch (error) {
      setValidationError('Erro ao verificar email');
      setIsAvailable(null);
    } finally {
      setChecking(false);
    }
  }, [onValidationChange]);

  const debouncedCheck = useDebouncedCallback(checkEmailAvailability, 500);

  useEffect(() => {
    if (value) {
      debouncedCheck(value);
    }
  }, [value, debouncedCheck]);

  const getIcon = () => {
    if (checking) {
      return <ActivityIndicator size="small" color="#60a5fa" />;
    }
    if (isAvailable === true) {
      return <Icon name={Check} size={20} color="#10b981" />;
    }
    if (isAvailable === false) {
      return <Icon name={X} size={20} color="#ef4444" />;
    }
    return null;
  };

  return (
    <View className={className}>
      <View className="relative">
        <Input
          value={value}
          onChangeText={onChange}
          placeholder="seu@email.com"
          keyboardType="email-address"
          autoCapitalize="none"
          autoCorrect={false}
          error={error || validationError}
          disabled={disabled}
          className="pr-10"
        />
        
        <View className="absolute right-3 top-3">
          {getIcon()}
        </View>
      </View>
      
      {validationError && (
        <Text variant="caption" color="error" className="mt-1">
          {validationError}
        </Text>
      )}
    </View>
  );
});

EmailValidator.displayName = 'EmailValidator';