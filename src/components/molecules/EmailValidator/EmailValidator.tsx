import React, { useState, useEffect } from 'react';
import { View } from 'react-native';
import { Input } from '@/components/atoms/Input';
import { Text } from '@/components/atoms/Text';
import { checkEmailAvailability } from '@/services/user';

interface EmailValidatorProps {
  value: string;
  onChange: (value: string) => void;
  error?: string;
}

export const EmailValidator: React.FC<EmailValidatorProps> = React.memo(({
  value,
  onChange,
  error,
}) => {
  const [checking, setChecking] = useState(false);
  const [emailAvailable, setEmailAvailable] = useState<boolean | null>(null);

  useEffect(() => {
    if (!value || !value.includes('@')) {
      setEmailAvailable(null);
      return;
    }

    const timer = setTimeout(async () => {
      setChecking(true);
      try {
        const available = await checkEmailAvailability(value);
        setEmailAvailable(available);
      } catch (err) {
        setEmailAvailable(null);
      } finally {
        setChecking(false);
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [value]);

  const getStatusMessage = () => {
    if (checking) return 'Verificando...';
    if (emailAvailable === true) return 'Email disponível';
    if (emailAvailable === false) return 'Email já cadastrado';
    return null;
  };

  const statusMessage = getStatusMessage();
  const statusColor = emailAvailable === true ? '#10b981' : emailAvailable === false ? '#ef4444' : '#6b7280';

  return (
    <View>
      <Input
        label="Email"
        value={value}
        onChangeText={onChange}
        error={error}
        keyboardType="email-address"
        autoCapitalize="none"
        autoCorrect={false}
        placeholder="seu@email.com"
        icon="email"
      />
      {statusMessage && !error && (
        <Text
          variant="caption"
          color={statusColor}
          className="mt-1"
        >
          {statusMessage}
        </Text>
      )}
    </View>
  );
});

EmailValidator.displayName = 'EmailValidator';