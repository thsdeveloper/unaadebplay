import React, { useRef, useCallback } from 'react';
import { View, TextInput } from 'react-native';
import { Control, Controller, FieldErrors } from 'react-hook-form';
import { FormField } from '@/components/molecules/FormField';
import { PasswordStrengthIndicator } from '@/components/molecules/PasswordStrengthIndicator';
import { Checkbox } from '@/components/atoms/Checkbox';
import { Button } from '@/components/atoms/Button';
import { Icon } from '@/components/atoms/Icon';
import { Text } from '@/components/atoms/Text';
import { Link } from '@/components/atoms/Link';

interface SignUpFormData {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
}

interface SignUpFormProps {
  control: Control<SignUpFormData>;
  errors: FieldErrors<SignUpFormData>;
  isValid: boolean;
  loading: boolean;
  acceptTerms: boolean;
  onAcceptTermsChange: (value: boolean) => void;
  onSubmit: () => void;
  password: string;
}

export const SignUpForm: React.FC<SignUpFormProps> = React.memo(({
  control,
  errors,
  isValid,
  loading,
  acceptTerms,
  onAcceptTermsChange,
  onSubmit,
  password,
}) => {
  const emailInputRef = useRef<TextInput>(null);
  const passwordInputRef = useRef<TextInput>(null);
  const confirmPasswordInputRef = useRef<TextInput>(null);

  const focusEmailInput = useCallback(() => {
    emailInputRef.current?.focus();
  }, []);

  const focusPasswordInput = useCallback(() => {
    passwordInputRef.current?.focus();
  }, []);

  const focusConfirmPasswordInput = useCallback(() => {
    confirmPasswordInputRef.current?.focus();
  }, []);

  return (
    <View>
      {/* Name Field */}
      <Controller
        control={control}
        name="name"
        render={({ field: { onChange, onBlur, value } }) => (
          <FormField
            icon="person"
            placeholder="Nome completo"
            value={value}
            onChangeText={onChange}
            onBlur={onBlur}
            error={errors.name?.message}
            autoCapitalize="words"
            returnKeyType="next"
            onSubmitEditing={focusEmailInput}
          />
        )}
      />

      {/* Email Field */}
      <Controller
        control={control}
        name="email"
        render={({ field: { onChange, onBlur, value } }) => (
          <FormField
            inputRef={emailInputRef}
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
          <View>
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
              returnKeyType="next"
              onSubmitEditing={focusConfirmPasswordInput}
            />
            <PasswordStrengthIndicator password={value} />
          </View>
        )}
      />

      {/* Confirm Password Field */}
      <Controller
        control={control}
        name="confirmPassword"
        render={({ field: { onChange, onBlur, value } }) => (
          <FormField
            inputRef={confirmPasswordInputRef}
            icon="lock"
            placeholder="Confirmar senha"
            value={value}
            onChangeText={onChange}
            onBlur={onBlur}
            error={errors.confirmPassword?.message}
            secureTextEntry={true}
            autoCapitalize="none"
            returnKeyType="done"
            onSubmitEditing={onSubmit}
          />
        )}
      />

      {/* Terms and Conditions */}
      <View style={{ marginVertical: 16 }}>
        <View style={{ flexDirection: 'row', alignItems: 'flex-start' }}>
          <Checkbox
            checked={acceptTerms}
            onChange={onAcceptTermsChange}
            style={{ marginTop: 2 }}
          />
          <View style={{ flex: 1, marginLeft: 8 }}>
            <Text variant="caption">
              Li e aceito os{' '}
              <Link href="/terms" color="#60a5fa">
                Termos de Uso
              </Link>
              {' '}e a{' '}
              <Link href="/privacy" color="#60a5fa">
                Política de Privacidade
              </Link>
            </Text>
          </View>
        </View>
      </View>

      {/* Submit Button */}
      <Button
        variant="primary"
        size="large"
        loading={loading}
        disabled={!isValid || !acceptTerms || loading}
        onPress={onSubmit}
        fullWidth
        leftIcon={
          !loading && (
            <Icon
              family="MaterialIcons"
              name="person-add"
              size={24}
              color="white"
            />
          )
        }
      >
        Criar Conta
      </Button>
    </View>
  );
});

SignUpForm.displayName = 'SignUpForm';