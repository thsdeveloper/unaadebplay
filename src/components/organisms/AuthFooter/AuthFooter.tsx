import React from 'react';
import { VStack } from '@/components/ui/vstack';
import { HStack } from '@/components/ui/hstack';
import { Text } from '@/components/ui/text';
import { Button, ButtonText } from '@/components/ui/button';
import { Divider } from '@/components/ui/divider';
import { Center } from '@/components/ui/center';
import { Link, LinkText } from '@/components/ui/link';

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
    <VStack space="lg" className="mt-6">
      {showDivider && (
        <HStack space="md" className="items-center">
          <Divider className="flex-1" />
          <Text size="sm" className="text-typography-400">
            ou
          </Text>
          <Divider className="flex-1" />
        </HStack>
      )}

      {showSignUp && onSignUpPress && (
        <Button
          action="secondary"
          variant="outline"
          size="lg"
          onPress={onSignUpPress}
          className="w-full"
        >
          <ButtonText>Criar Conta</ButtonText>
        </Button>
      )}

      {showSignIn && onSignInPress && (
        <Center className="mb-4">
          <HStack space="xs" className="items-center">
            <Text size="sm" className="text-typography-400">
              Já tem uma conta?
            </Text>
            <Link onPress={onSignInPress}>
              <LinkText size="sm" className="font-semibold">
                Entrar
              </LinkText>
            </Link>
          </HStack>
        </Center>
      )}

      {copyrightText && (
        <Center className="mt-10">
          <Text
            size="xs"
            className="text-center text-typography-300 opacity-40"
          >
            {copyrightText}
          </Text>
        </Center>
      )}
    </VStack>
  );
});

AuthFooter.displayName = 'AuthFooter';