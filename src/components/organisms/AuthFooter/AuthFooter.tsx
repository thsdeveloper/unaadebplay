import React from 'react';
import { View } from 'react-native';
import { Text } from '@/components/atoms/Text';
import { Button } from '@/components/atoms/Button';
import { Divider } from '@/components/atoms/Divider';

interface AuthFooterProps {
  showSignUp?: boolean;
  showSignIn?: boolean;
  copyrightText?: string;
  onSignUpPress?: () => void;
  onSignInPress?: () => void;
}

export const AuthFooter: React.FC<AuthFooterProps> = React.memo(({
  showSignUp = false,
  showSignIn = false,
  copyrightText,
  onSignUpPress,
  onSignInPress,
}) => {
  const showDivider = showSignUp || showSignIn;

  return (
    <View>
      {showDivider && <Divider text="ou" />}

      {showSignUp && onSignUpPress && (
        <Button
          variant="outline"
          size="large"
          onPress={onSignUpPress}
          fullWidth
          style={{ marginBottom: 16 }}
        >
          Criar Conta
        </Button>
      )}

      {showSignIn && onSignInPress && (
        <View style={{ alignItems: 'center', marginBottom: 16 }}>
          <Text variant="body">
            Já tem uma conta?{' '}
            <Text
              variant="body"
              color="#60a5fa"
              weight="semibold"
              onPress={onSignInPress}
            >
              Entrar
            </Text>
          </Text>
        </View>
      )}

      {copyrightText && (
        <View style={{ alignItems: 'center', marginTop: 40 }}>
          <Text
            variant="caption"
            align="center"
            color="rgba(255,255,255,0.4)"
          >
            {copyrightText}
          </Text>
        </View>
      )}
    </View>
  );
});

AuthFooter.displayName = 'AuthFooter';