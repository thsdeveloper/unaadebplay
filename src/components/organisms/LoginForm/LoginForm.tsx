import React, { useRef, useCallback } from 'react';
import { TextInput } from 'react-native';
import { Control, Controller, FieldErrors } from 'react-hook-form';
import { FormField } from '@/components/molecules/FormField';
import { RememberMeCheckbox } from '@/components/molecules/RememberMeCheckbox';
import { VStack } from '@/components/ui/vstack';
import { Button, ButtonText, ButtonIcon, ButtonSpinner } from '@/components/ui/button';
import { Icon } from '@/components/ui/icon';
import { LogIn } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';

export interface LoginFormData {
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

  const handleSubmit = useCallback(() => {
    if (!loading && isValid) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      onSubmit();
    }
  }, [loading, isValid, onSubmit]);

  return (
    <VStack space="md" className="w-full">
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
            onSubmitEditing={handleSubmit}
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
        action="primary"
        variant="solid"
        size="lg"
        isDisabled={!isValid || loading}
        onPress={handleSubmit}
        className="w-full mt-2"
      >
        {loading ? (
          <ButtonSpinner />
        ) : (
          <>
            <ButtonIcon as={LogIn} />
            <ButtonText>Entrar</ButtonText>
          </>
        )}
      </Button>
    </VStack>
  );
});

LoginForm.displayName = 'LoginForm';