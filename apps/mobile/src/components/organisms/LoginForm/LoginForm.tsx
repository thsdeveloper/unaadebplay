import React, { useRef, useCallback } from 'react';
import { TextInput, View, Pressable, StyleSheet } from 'react-native';
import { Control, Controller, FieldErrors } from 'react-hook-form';
import { Link } from 'expo-router';
import { Mail, Lock, ArrowRight, Check } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';

import { VStack } from '@/components/ui/vstack';
import { HStack } from '@/components/ui/hstack';
import { Text } from '@/components/ui/text';
import { GlassInput } from '@/components/molecules/GlassInput';
import { GradientButton } from '@/components/atoms/GradientButton';

const BRAND = '#E51C44';

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
    if (!loading && isValid) onSubmit();
  }, [loading, isValid, onSubmit]);

  const toggleRemember = useCallback(() => {
    Haptics.selectionAsync();
    onRememberMeChange(!rememberMe);
  }, [rememberMe, onRememberMeChange]);

  return (
    <VStack space="lg" className="w-full">
      <Controller
        control={control}
        name="email"
        render={({ field: { onChange, onBlur, value } }) => (
          <GlassInput
            icon={<Mail size={20} color="rgba(226,232,240,0.7)" />}
            placeholder="Email"
            value={value}
            onChangeText={onChange}
            onBlur={onBlur}
            error={errors.email?.message}
            keyboardType="email-address"
            returnKeyType="next"
            onSubmitEditing={focusPasswordInput}
          />
        )}
      />

      <Controller
        control={control}
        name="password"
        render={({ field: { onChange, onBlur, value } }) => (
          <GlassInput
            inputRef={passwordInputRef}
            icon={<Lock size={20} color="rgba(226,232,240,0.7)" />}
            placeholder="Senha"
            value={value}
            onChangeText={onChange}
            onBlur={onBlur}
            error={errors.password?.message}
            password
            returnKeyType="done"
            onSubmitEditing={handleSubmit}
          />
        )}
      />

      {/* Lembrar-me + Esqueceu a senha */}
      <HStack className="items-center justify-between mt-1">
        <Pressable onPress={toggleRemember} hitSlop={8}>
          <HStack className="items-center" space="sm">
            <View style={[styles.checkbox, rememberMe && styles.checkboxChecked]}>
              {rememberMe && <Check size={14} color="#fff" strokeWidth={3} />}
            </View>
            <Text className="text-typography-300 text-sm">Lembrar-me</Text>
          </HStack>
        </Pressable>

        <Link href="/(auth)/forget-password" asChild>
          <Pressable hitSlop={8}>
            <Text style={styles.linkText}>Esqueceu a senha?</Text>
          </Pressable>
        </Link>
      </HStack>

      <GradientButton
        label="Entrar"
        onPress={handleSubmit}
        loading={loading}
        disabled={!isValid}
        rightIcon={<ArrowRight size={20} color="#fff" />}
        style={{ marginTop: 8 }}
      />
    </VStack>
  );
});

LoginForm.displayName = 'LoginForm';

const styles = StyleSheet.create({
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 7,
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.3)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxChecked: { backgroundColor: BRAND, borderColor: BRAND },
  linkText: { color: '#FF4D6D', fontSize: 14, fontWeight: '600' },
});
