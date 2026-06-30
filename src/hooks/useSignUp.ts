import { useState, useCallback } from 'react';
import { useRouter } from 'expo-router';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import * as Haptics from 'expo-haptics';
import { Alert } from 'react-native';
import { useAuth } from '@/contexts/AuthContext';
import { filesService } from '@/services/files';

const step1Schema = z.object({
  avatar: z.string().optional(),
  first_name: z.string().min(1, 'Nome é obrigatório'),
  last_name: z.string().min(1, 'Sobrenome é obrigatório'),
  birthdate: z.date(),
  gender: z.enum(['M', 'F']),
  sector: z.string().min(1, 'Setor é obrigatório'),
});

const step2Schema = z
  .object({
    email: z.string().min(1, 'Email é obrigatório').email('Email inválido'),
    phone: z
      .string()
      .min(1, 'Telefone é obrigatório')
      .regex(/^\d{10,11}$/, 'Telefone inválido'),
    password: z
      .string()
      .min(8, 'Senha deve ter no mínimo 8 caracteres')
      .regex(/[A-Z]/, 'Deve conter uma letra maiúscula')
      .regex(/[a-z]/, 'Deve conter uma letra minúscula')
      .regex(/[0-9]/, 'Deve conter um número')
      .regex(/[^A-Za-z0-9]/, 'Deve conter um caractere especial'),
    confirmPassword: z.string().min(1, 'Confirmação é obrigatória'),
    termsAccepted: z.boolean().refine((val) => val === true, 'Você deve aceitar os termos'),
    isMinor: z.boolean().optional(),
    responsibleName: z.string().optional(),
    responsiblePhone: z.string().optional(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Senhas não conferem',
    path: ['confirmPassword'],
  })
  .refine((data) => !data.isMinor || !!data.responsibleName, {
    message: 'Nome do responsável é obrigatório',
    path: ['responsibleName'],
  })
  .refine((data) => !data.isMinor || !!data.responsiblePhone, {
    message: 'Telefone do responsável é obrigatório',
    path: ['responsiblePhone'],
  });

export type Step1FormData = z.infer<typeof step1Schema>;
export type Step2FormData = z.infer<typeof step2Schema>;
export interface SignUpFormData extends Step1FormData, Step2FormData {}

export const useSignUp = () => {
  const router = useRouter();
  const { register } = useAuth();
  const [loading, setLoading] = useState(false);

  const step1Form = useForm<Step1FormData>({
    resolver: zodResolver(step1Schema),
    mode: 'all',
    reValidateMode: 'onChange',
    defaultValues: {
      first_name: '',
      last_name: '',
      birthdate: undefined as unknown as Date,
      gender: undefined as unknown as 'M' | 'F',
      sector: '',
      avatar: '',
    },
  });

  const step2Form = useForm<Step2FormData>({
    resolver: zodResolver(step2Schema),
    mode: 'onChange',
    defaultValues: {
      email: '',
      phone: '',
      password: '',
      confirmPassword: '',
      termsAccepted: false,
      isMinor: false,
      responsibleName: '',
      responsiblePhone: '',
    },
  });

  const uploadAvatar = useCallback(async (uri: string): Promise<string | null> => {
    try {
      const response = await filesService.uploadImage(uri, 'avatars');
      return response.id;
    } catch (error) {
      console.error('Erro ao fazer upload do avatar:', error);
      return null;
    }
  }, []);

  // Cria a conta no Supabase (autenticação por email/senha). Sem verificação por SMS.
  // Retorna `true` em sucesso; `false` se houve erro (a UI esconde o overlay de sucesso).
  const handleSubmit = useCallback(async (): Promise<boolean> => {
    const data = { ...step1Form.getValues(), ...step2Form.getValues() };

    try {
      setLoading(true);
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

      // Upload do avatar (Supabase Storage) se existir
      let avatarId: string | null = null;
      if (data.avatar) {
        avatarId = await uploadAvatar(data.avatar);
      }

      const registrationData = {
        first_name: data.first_name,
        last_name: data.last_name,
        email: data.email,
        password: data.password,
        phone: data.phone,
        birthdate: data.birthdate ? new Date(data.birthdate).toISOString() : undefined,
        gender: data.gender,
        sector: data.sector,
        avatar: avatarId,
        responsibleName: data.responsibleName,
        responsiblePhone: data.responsiblePhone,
      };

      const { needsConfirmation } = await register(registrationData);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

      if (needsConfirmation) {
        Alert.alert(
          'Quase lá!',
          'Enviamos um email de confirmação. Confirme seu email para acessar sua conta.',
          [{ text: 'OK', onPress: () => router.replace('/(auth)/sign-in') }]
        );
      }
      // Em caso de sucesso com sessão, o AuthContext.register já navega para a home.
      return true;
    } catch (error: any) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      Alert.alert('Erro ao criar conta', error.message || 'Ocorreu um erro ao criar sua conta');
      return false;
    } finally {
      setLoading(false);
    }
  }, [step1Form, step2Form, register, router, uploadAvatar]);

  // Verificar se é menor de idade (define isMinor no form para habilitar o passo do responsável)
  const checkIfMinor = useCallback(
    (birthdate: Date) => {
      const age = Math.floor(
        (new Date().getTime() - birthdate.getTime()) / (365.25 * 24 * 60 * 60 * 1000)
      );
      const isMinor = age < 18;
      step2Form.setValue('isMinor', isMinor);
      return isMinor;
    },
    [step2Form]
  );

  return {
    loading,
    step1Form,
    step2Form,
    handleSubmit,
    checkIfMinor,
  };
};
