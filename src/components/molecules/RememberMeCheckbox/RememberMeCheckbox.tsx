import React from 'react';
import {
  Checkbox,
  CheckboxIndicator,
  CheckboxLabel,
  CheckboxIcon,
} from '@/components/ui/checkbox';
import { CheckIcon } from '@/components/ui/icon';
import { HStack } from '@/components/ui/hstack';
import { Link, LinkText } from '@/components/ui/link';
import { useRouter } from 'expo-router';

interface RememberMeCheckboxProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  showForgotPassword?: boolean;
}

export const RememberMeCheckbox: React.FC<RememberMeCheckboxProps> = React.memo(({
  checked,
  onChange,
  showForgotPassword = true,
}) => {
  const router = useRouter();

  const handleForgotPasswordPress = () => {
    router.push('/(auth)/forget-password');
  };

  return (
    <HStack className="justify-between items-center my-4">
      <Checkbox
        size="sm"
        value="remember"
        isChecked={checked}
        onChange={onChange}
      >
        <CheckboxIndicator>
          <CheckboxIcon as={CheckIcon} />
        </CheckboxIndicator>
        <CheckboxLabel size="sm">
          Lembrar-me
        </CheckboxLabel>
      </Checkbox>

      {showForgotPassword && (
        <Link onPress={handleForgotPasswordPress}>
          <LinkText size="sm">
            Esqueceu a senha?
          </LinkText>
        </Link>
      )}
    </HStack>
  );
});

RememberMeCheckbox.displayName = 'RememberMeCheckbox';