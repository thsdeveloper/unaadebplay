import React from 'react';
import { View, Alert } from 'react-native';
import { BiometricButton } from '@/components/molecules/BiometricButton';
import { Text } from '@/components/atoms/Text';

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
    <View style={{ marginTop: 16 }}>
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
          variant="caption"
          align="center"
          style={{ marginTop: 8 }}
        >
          Use {biometricName} para login rápido e seguro
        </Text>
      )}
    </View>
  );
});

BiometricLogin.displayName = 'BiometricLogin';