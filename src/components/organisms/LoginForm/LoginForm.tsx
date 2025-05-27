import React, { useRef, useCallback } from 'react';
import { View, TextInput } from 'react-native';
import { Control, Controller, FieldErrors } from 'react-hook-form';
import { FormField } from '@/components/molecules/FormField';
import { RememberMeCheckbox } from '@/components/molecules/RememberMeCheckbox';
import { Button } from '@/components/atoms/Button';
import { Icon } from '@/components/atoms/Icon';

interface LoginFormData {
  email: string;
  password: string;
}

interface LoginFormProps {
  control: Control<LoginFormData>;
  errors: FieldErrors<LoginFormData>;
  isValid: boolean;
  loading: boolean;
  rememberMe: boolean;
  onRememberMeChange: (value: boolean) => void;
  onSubmit: () => void;
}

export const LoginForm: React.FC<LoginFormProps> = React.memo(({
  control,
  errors,
  isValid,
  loading,
  rememberMe,
  onRememberMeChange,
  onSubmit,
}) => {
  const passwordInputRef = useRef<TextInput>(null);

  const focusPasswordInput = useCallback(() => {
    passwordInputRef.current?.focus();
  }, []);

  return (
    <View>
      {/* Email Field */}
      <Controller
        control={control}
        name="email"
        render={({ field: { onChange, onBlur, value } }) => (
          <FormField
            icon="email"
            placeholder="Email"
            value={value}
            onChangeText={onChange}
            onBlur={onBlur}
            error={errors.email?.message}
            keyboardType="email-address"
            autoCapitalize="none"
            returnKeyType="next"
            onSubmitEditing={focusPasswordInput}
          />
        )}
      />

      {/* Password Field */}
      <Controller
        control={control}
        name="password"
        render={({ field: { onChange, onBlur, value } }) => (
          <FormField
            inputRef={passwordInputRef}
            icon="lock"
            placeholder="Senha"
            value={value}
            onChangeText={onChange}
            onBlur={onBlur}
            error={errors.password?.message}
            secureTextEntry={true}
            autoCapitalize="none"
            returnKeyType="done"
            onSubmitEditing={onSubmit}
          />
        )}
      />

      {/* Remember Me */}
      <RememberMeCheckbox
        checked={rememberMe}
        onChange={onRememberMeChange}
      />

      {/* Submit Button */}
      <Button
        variant="primary"
        size="large"
        loading={loading}
        disabled={!isValid || loading}
        onPress={onSubmit}
        fullWidth
        leftIcon={
          !loading && (
            <Icon
              family="Ionicons"
              name="log-in"
              size={24}
              color="white"
            />
          )
        }
      >
        Entrar
      </Button>
    </View>
  );
});

LoginForm.displayName = 'LoginForm';