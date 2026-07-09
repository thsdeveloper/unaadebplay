import React from 'react';
import { TouchableOpacity, View, ViewStyle } from 'react-native';
import { BlurView } from 'expo-blur';
import { Icon } from '@/components/atoms/Icon';
import { Text } from '@/components/atoms/Text';
import { LoadingSpinner } from '@/components/atoms/LoadingSpinner';

interface BiometricButtonProps {
  biometricType: string;
  isEnabled: boolean;
  isLocked: boolean;
  loading?: boolean;
  lockoutTime?: number;
  onPress: () => void;
  style?: ViewStyle;
}

export const BiometricButton: React.FC<BiometricButtonProps> = React.memo(({
  biometricType,
  isEnabled,
  isLocked,
  loading = false,
  lockoutTime,
  onPress,
  style,
}) => {
  const getButtonState = () => {
    if (isLocked) return 'locked';
    if (isEnabled) return 'enabled';
    return 'setup';
  };

  const state = getButtonState();
  
  const config = {
    locked: {
      borderColor: '#ef4444',
      iconColor: '#ef4444',
      textColor: '#ef4444',
      text: `Bloqueado${lockoutTime ? ` (${lockoutTime}min)` : ''}`,
      iconName: 'lock' as const,
    },
    enabled: {
      borderColor: '#10b981',
      iconColor: '#10b981',
      textColor: '#10b981',
      text: `Entrar com ${biometricType}`,
      iconName: biometricType.toLowerCase().includes('face') ? 'smile' : 'fingerprint',
    },
    setup: {
      borderColor: 'rgba(255,255,255,0.2)',
      iconColor: 'rgba(255,255,255,0.6)',
      textColor: 'rgba(255,255,255,0.8)',
      text: `Configurar ${biometricType}`,
      iconName: biometricType.toLowerCase().includes('face') ? 'smile' : 'fingerprint',
    },
  };

  const currentConfig = config[state];

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={loading}
      style={[{
        borderRadius: 16,
        overflow: 'hidden',
        borderWidth: 2,
        borderColor: currentConfig.borderColor,
        opacity: loading ? 0.6 : 1,
      }, style]}
    >
      <BlurView intensity={20} tint="dark">
        <View style={{
          paddingVertical: 16,
          flexDirection: 'row',
          justifyContent: 'center',
          alignItems: 'center',
          backgroundColor: 'rgba(255,255,255,0.05)',
        }}>
          {loading ? (
            <LoadingSpinner size="small" color={currentConfig.iconColor} />
          ) : (
            <>
              <Icon
                family={state === 'locked' ? 'MaterialIcons' : 'FontAwesome5'}
                name={currentConfig.iconName}
                size={24}
                color={currentConfig.iconColor}
                style={{ marginRight: 12 }}
              />
              <Text
                size="md"
                weight="semibold"
                color={currentConfig.textColor}
              >
                {currentConfig.text}
              </Text>
            </>
          )}
        </View>
      </BlurView>
    </TouchableOpacity>
  );
});

BiometricButton.displayName = 'BiometricButton';