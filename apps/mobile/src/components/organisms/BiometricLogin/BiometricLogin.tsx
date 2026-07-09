import React from 'react';
import { Alert } from 'react-native';
import { VStack } from '@/components/ui/vstack';
import { Text } from '@/components/ui/text';
import { BiometricButton } from '@/components/molecules/BiometricButton';

interface BiometricLoginProps {
  isAvailable: boolean;
  isEnabled: boolean;
  isLocked: boolean;
  isLoading: boolean;
  biometricName: string;
  lockoutRemaining?: number;
  onBiometricLogin: () => void;
  onSetupBiometric: () => void;
}

export const BiometricLogin: React.FC<BiometricLoginProps> = React.memo(({
  isAvailable,
  isEnabled,
  isLocked,
  isLoading,
  biometricName,
  lockoutRemaining,
  onBiometricLogin,
  onSetupBiometric,
}) => {
  if (!isAvailable) return null;

  const handlePress = () => {
    if (isEnabled && !isLocked) {
      onBiometricLogin();
    } else if (isLocked) {
      Alert.alert(
        'Bloqueado',
        `${biometricName} está bloqueado por ${lockoutRemaining} minutos.`,
        [{ text: 'OK' }]
      );
    } else {
      onSetupBiometric();
    }
  };

  return (
    <VStack space="sm" className="mt-4">
      <BiometricButton
        biometricType={biometricName}
        isEnabled={isEnabled}
        isLocked={isLocked}
        loading={isLoading}
        lockoutTime={lockoutRemaining}
        onPress={handlePress}
      />

      {!isEnabled && !isLocked && (
        <Text
          size="xs"
          className="text-center text-typography-400"
        >
          Use {biometricName} para login rápido e seguro
        </Text>
      )}
    </VStack>
  );
});

BiometricLogin.displayName = 'BiometricLogin';