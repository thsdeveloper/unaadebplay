import React from 'react';
import { View } from 'react-native';
import { Checkbox } from '@/components/atoms/Checkbox';
import { Link } from '@/components/atoms/Link';

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
  return (
    <View style={{
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginVertical: 16,
    }}>
      <Checkbox
        checked={checked}
        onChange={onChange}
        label="Lembrar-me"
      />
      
      {showForgotPassword && (
        <Link href="/(auth)/forget-password">
          Esqueceu a senha?
        </Link>
      )}
    </View>
  );
});

RememberMeCheckbox.displayName = 'RememberMeCheckbox';