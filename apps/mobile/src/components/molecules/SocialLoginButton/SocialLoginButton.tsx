import React from 'react';
import { TouchableOpacity, View, ViewStyle } from 'react-native';
import { Icon, IconFamily } from '@/components/atoms/Icon';
import { Text } from '@/components/atoms/Text';
import { LoadingSpinner } from '@/components/atoms/LoadingSpinner';

export type SocialProvider = 'google' | 'facebook' | 'apple' | 'twitter';

interface SocialLoginButtonProps {
  provider: SocialProvider;
  onPress: () => void;
  loading?: boolean;
  disabled?: boolean;
  style?: ViewStyle;
}

const providerConfig: Record<SocialProvider, {
  icon: string;
  family: IconFamily;
  color: string;
  backgroundColor: string;
  text: string;
}> = {
  google: {
    icon: 'google',
    family: 'FontAwesome',
    color: '#DB4437',
    backgroundColor: 'white',
    text: 'Continuar com Google',
  },
  facebook: {
    icon: 'facebook',
    family: 'FontAwesome',
    color: '#4267B2',
    backgroundColor: 'white',
    text: 'Continuar com Facebook',
  },
  apple: {
    icon: 'apple',
    family: 'FontAwesome',
    color: 'black',
    backgroundColor: 'white',
    text: 'Continuar com Apple',
  },
  twitter: {
    icon: 'twitter',
    family: 'FontAwesome',
    color: '#1DA1F2',
    backgroundColor: 'white',
    text: 'Continuar com Twitter',
  },
};

export const SocialLoginButton: React.FC<SocialLoginButtonProps> = React.memo(({
  provider,
  onPress,
  loading = false,
  disabled = false,
  style,
}) => {
  const config = providerConfig[provider];
  const isDisabled = disabled || loading;

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={isDisabled}
      style={[{
        backgroundColor: config.backgroundColor,
        borderRadius: 12,
        paddingVertical: 14,
        paddingHorizontal: 20,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        opacity: isDisabled ? 0.6 : 1,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
      }, style]}
    >
      {loading ? (
        <LoadingSpinner size="small" color={config.color} />
      ) : (
        <>
          <Icon
            family={config.family}
            name={config.icon}
            size={20}
            color={config.color}
            style={{ marginRight: 12 }}
          />
          <Text
            size="md"
            weight="medium"
            color="black"
          >
            {config.text}
          </Text>
        </>
      )}
    </TouchableOpacity>
  );
});

SocialLoginButton.displayName = 'SocialLoginButton';