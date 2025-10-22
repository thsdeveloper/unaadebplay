import { useState, useCallback } from 'react';
import { useRouter } from 'expo-router';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import * as Haptics from 'expo-haptics';
import { Alert } from 'react-native';
import { useAuth } from '@/contexts/AuthContext';
import { twilioService } from '@/services/twilio';
import { userService } from '@/services/user';
import { filesService } from '@/services/files';

// Schema SIMPLIFICADO para teste - vou remover as validações complexas
const step1Schema = z.object({
  avatar: z.string().optional(),
  first_name: z.string().min(1, 'Nome é obrigatório'),
  last_name: z.string().min(1, 'Sobrenome é obrigatório'),
  birthdate: z.date(),
  gender: z.enum(['M', 'F']),
  sector: z.string().min(1, 'Setor é obrigatório'),
});

console.log('🔍 [Schema] Created simplified step1Schema:', step1Schema);

const step2Schema = z.object({
  email: z
    .string()
    .min(1, 'Email é obrigatório')
    .email('Email inválido'),
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
  termsAccepted: z
    .boolean()
    .refine(val => val === true, 'Você deve aceitar os termos'),
  isMinor: z.boolean().optional(),
  // Campos do responsável (se menor)
  responsibleName: z.string().optional(),
  responsiblePhone: z.string().optional(),
}).refine(data => data.password === data.confirmPassword, {
  message: 'Senhas não conferem',
  path: ['confirmPassword'],
}).refine(data => {
  if (data.isMinor && !data.responsibleName) {
    return false;
  }
  return true;
}, {
  message: 'Nome do responsável é obrigatório',
  path: ['responsibleName'],
}).refine(data => {
  if (data.isMinor && !data.responsiblePhone) {
    return false;
  }
  return true;
}, {
  message: 'Telefone do responsável é obrigatório',
  path: ['responsiblePhone'],
});

// Tipos inferidos do Zod
export type Step1FormData = z.infer<typeof step1Schema>;
export type Step2FormData = z.infer<typeof step2Schema>;

export interface SignUpFormData extends Step1FormData, Step2FormData {
  // Step 3
  verificationCode?: string;
}

export const useSignUp = () => {
  const router = useRouter();
  const { register } = useAuth();
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [verificationLoading, setVerificationLoading] = useState(false);
  const [formData, setFormData] = useState<Partial<SignUpFormData>>({});
  const [verificationId, setVerificationId] = useState<string>('');
  const [resendTimer, setResendTimer] = useState(0);

  // Custom zodResolver with logs
  const customZodResolver = (schema: any) => {
    return async (values: any, context: any, options: any) => {
      console.log('🔍 [zodResolver] Input values:', values);
      console.log('🔍 [zodResolver] Schema:', schema);
      
      const result = await zodResolver(schema)(values, context, options);
      
      console.log('🔍 [zodResolver] Result:', result);
      console.log('🔍 [zodResolver] Has errors:', Object.keys(result.errors || {}).length > 0);
      
      return result;
    };
  };

  console.log('🔍 [useSignUp] Creating form with defaultValues:', {
    first_name: formData.first_name || '',
    last_name: formData.last_name || '',
    birthdate: formData.birthdate || undefined,
    gender: formData.gender || undefined,
    sector: formData.sector || '',
    avatar: formData.avatar || '',
  });

  // Form para step 1
  const step1Form = useForm<Step1FormData>({
    resolver: customZodResolver(step1Schema),
    mode: 'all',
    reValidateMode: 'onChange',
    defaultValues: {
      first_name: formData.first_name || '',
      last_name: formData.last_name || '',
      birthdate: formData.birthdate || undefined,
      gender: formData.gender || undefined,
      sector: formData.sector || '',
      avatar: formData.avatar || '',
    },
  });

  // Debug: monitor form state
  console.log('========================================');
  console.log('🔍 [useSignUp] FORM STATE MONITORING');
  console.log('========================================');
  console.log('🔍 [useSignUp] Form Data State:', formData);
  console.log('🔍 [useSignUp] Step1 Form Values:', step1Form.watch());
  console.log('🔍 [useSignUp] Step1 Form Errors:', step1Form.formState.errors);
  console.log('🔍 [useSignUp] Step1 Form isValid:', step1Form.formState.isValid);
  console.log('🔍 [useSignUp] Step1 Form isDirty:', step1Form.formState.isDirty);
  console.log('🔍 [useSignUp] Step1 Form isTouched:', step1Form.formState.touchedFields);
  console.log('========================================');

  // Form para step 2
  const step2Form = useForm<Step2FormData>({
    resolver: zodResolver(step2Schema),
    mode: 'onChange',
    defaultValues: {
      email: formData.email || '',
      phone: formData.phone || '',
      password: formData.password || '',
      confirmPassword: formData.confirmPassword || '',
      termsAccepted: formData.termsAccepted || false,
      isMinor: formData.isMinor || false,
      responsibleName: formData.responsibleName || '',
      responsiblePhone: formData.responsiblePhone || '',
    },
  });

  // Enviar código de verificação
  const sendVerificationCode = useCallback(async (phone: string) => {
    try {
      setVerificationLoading(true);
      const response = await twilioService.sendVerificationSMS(phone);
      setVerificationId(response.id);
      setResendTimer(60); // 60 segundos para reenvio
      
      // Timer countdown
      const interval = setInterval(() => {
        setResendTimer(prev => {
          if (prev <= 1) {
            clearInterval(interval);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch (error) {
      Alert.alert('Erro', 'Não foi possível enviar o código de verificação');
      throw error;
    } finally {
      setVerificationLoading(false);
    }
  }, []);

  // Navegar entre steps
  const goToStep = useCallback((step: number) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setCurrentStep(step);
  }, []);

  // Avançar para próximo step
  const handleNextStep = useCallback(async () => {
    try {
      console.log('🔍 [handleNextStep] Called - currentStep:', currentStep);
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      
      if (currentStep === 1) {
        console.log('🔍 [handleNextStep] Triggering step1 validation...');
        const isValid = await step1Form.trigger();
        console.log('🔍 [handleNextStep] Step 1 validation result:', isValid);
        console.log('🔍 [handleNextStep] Step 1 errors:', step1Form.formState.errors);
        console.log('🔍 [handleNextStep] Step 1 values:', step1Form.getValues());
        
        if (!isValid) {
          console.log('🔍 [handleNextStep] Validation failed - not proceeding');
          return;
        }
        
        const data = step1Form.getValues();
        console.log('🔍 [handleNextStep] Setting form data:', data);
        setFormData(prev => ({ ...prev, ...data }));
        console.log('🔍 [handleNextStep] Moving to step 2');
        setCurrentStep(2);
      } 
      else if (currentStep === 2) {
        const isValid = await step2Form.trigger();
        // console.log('Step 2 validation:', isValid);
        // console.log('Step 2 errors:', step2Form.formState.errors);
        
        if (!isValid) return;
        
        const data = step2Form.getValues();
        setFormData(prev => ({ ...prev, ...data }));
        
        // Enviar SMS de verificação
        await sendVerificationCode(data.phone);
        setCurrentStep(3);
      }
    } catch (error) {
      console.error('Error in handleNextStep:', error);
      Alert.alert('Erro', 'Ocorreu um erro ao processar seus dados');
    }
  }, [currentStep, step1Form, step2Form, sendVerificationCode]);

  // Voltar para step anterior
  const handlePreviousStep = useCallback(() => {
    if (currentStep > 1) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      setCurrentStep(currentStep - 1);
    }
  }, [currentStep]);

  // Reenviar código
  const resendCode = useCallback(async () => {
    if (resendTimer > 0 || !formData.phone) return;
    await sendVerificationCode(formData.phone);
  }, [formData.phone, resendTimer, sendVerificationCode]);

  // Upload de avatar
  const uploadAvatar = useCallback(async (uri: string): Promise<string | null> => {
    try {
      const response = await filesService.uploadImage(uri, 'avatars');
      return response.id;
    } catch (error) {
      console.error('Erro ao fazer upload do avatar:', error);
      return null;
    }
  }, []);

  // Submeter cadastro completo
  const handleSubmit = useCallback(async (verificationCode: string) => {
    if (!verificationCode || verificationCode.length !== 6) {
      Alert.alert('Erro', 'Código inválido');
      return;
    }

    try {
      setLoading(true);
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

      // Verificar código usando o telefone como ID
      const isValid = await twilioService.verifyCode(formData.phone!, verificationCode);
      if (!isValid) {
        Alert.alert('Erro', 'Código de verificação inválido');
        return;
      }

      // Upload do avatar se existir
      let avatarId = null;
      if (formData.avatar) {
        avatarId = await uploadAvatar(formData.avatar);
      }

      // Validar dados obrigatórios
      if (!formData.birthdate || !formData.gender) {
        Alert.alert('Erro', 'Por favor, preencha todos os campos obrigatórios');
        return;
      }

      // Preparar dados para registro
      const registrationData = {
        first_name: formData.first_name!,
        last_name: formData.last_name!,
        email: formData.email!,
        password: formData.password!,
        phone: formData.phone!,
        birthdate: formData.birthdate.toISOString(),
        gender: formData.gender,
        sector: formData.sector!,
        avatar: avatarId,
        responsibleName: formData.responsibleName,
        responsiblePhone: formData.responsiblePhone,
      };

      // Registrar usuário
      await register(registrationData);
      
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      Alert.alert(
        'Sucesso!',
        'Sua conta foi criada com sucesso!',
        [
          {
            text: 'OK',
            onPress: () => router.replace('/'),
          },
        ]
      );
    } catch (error: any) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      Alert.alert(
        'Erro ao criar conta',
        error.message || 'Ocorreu um erro ao criar sua conta'
      );
    } finally {
      setLoading(false);
    }
  }, [formData, verificationId, register, router, uploadAvatar]);

  // Verificar se é menor de idade
  const checkIfMinor = useCallback((birthdate: Date) => {
    const age = Math.floor(
      (new Date().getTime() - birthdate.getTime()) / (365.25 * 24 * 60 * 60 * 1000)
    );
    const isMinor = age < 18;
    step2Form.setValue('isMinor', isMinor);
    return isMinor;
  }, [step2Form]);

  return {
    // Estados
    currentStep,
    loading,
    verificationLoading,
    resendTimer,
    formData,
    
    // Forms
    step1Form,
    step2Form,
    
    // Ações
    goToStep,
    handleNextStep,
    handlePreviousStep,
    handleSubmit,
    resendCode,
    checkIfMinor,
  };
};