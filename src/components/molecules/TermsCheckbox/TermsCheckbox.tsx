import React from 'react';
import { View, TouchableOpacity } from 'react-native';
import { Checkbox } from '@/components/atoms/Checkbox';
import { Text } from '@/components/atoms/Text';
import { Link } from '@/components/atoms/Link';

interface TermsCheckboxProps {
  value: boolean;
  onChange: (value: boolean) => void;
  error?: string;
}

export const TermsCheckbox: React.FC<TermsCheckboxProps> = React.memo(({
  value,
  onChange,
  error,
}) => {
  return (
    <View>
      <TouchableOpacity
        onPress={() => onChange(!value)}
        style={{
          flexDirection: 'row',
          alignItems: 'flex-start',
        }}
      >
        <Checkbox
          value={value}
          onValueChange={onChange}
          style={{ marginRight: 8, marginTop: 2 }}
        />
        <View style={{ flex: 1 }}>
          <Text variant="body" style={{ lineHeight: 20 }}>
            Li e aceito os{' '}
            <Link href="/terms" style={{ color: '#3b82f6' }}>
              Termos de Uso
            </Link>
            {' '}e a{' '}
            <Link href="/privacy" style={{ color: '#3b82f6' }}>
              Política de Privacidade
            </Link>
          </Text>
        </View>
      </TouchableOpacity>
      
      {error && (
        <Text variant="error" className="mt-1">
          {error}
        </Text>
      )}
    </View>
  );
});

TermsCheckbox.displayName = 'TermsCheckbox';