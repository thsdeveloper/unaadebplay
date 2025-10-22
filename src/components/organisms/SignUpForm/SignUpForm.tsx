import React, { memo, useState, useCallback, useEffect } from 'react';
import { View, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { Controller, FieldError } from 'react-hook-form';
import { 
  AvatarUpload, 
  ProgressIndicator, 
  Button, 
  Text,
  Input,
  Icon
} from '@/components/atoms';
import { 
  FormField, 
  EmailValidator, 
  DatePicker, 
  TermsCheckbox,
  PasswordStrengthIndicator,
  SectorSelect
} from '@/components/molecules';
import { UseFormReturn } from 'react-hook-form';
import { ChevronLeft, ChevronRight } from 'lucide-react-native';
import {HStack} from "@/components/ui/hstack";
import {Box} from "@/components/ui/box";

// Helper function to extract error message safely
const getErrorMessage = (error: any): string | undefined => {
  if (!error) return undefined;
  if (typeof error === 'string') return error;
  if (error.message) return error.message;
  return undefined;
};

interface SignUpFormProps {
  currentStep: number;
  loading: boolean;
  verificationLoading: boolean;
  resendTimer: number;
  step1Form: UseFormReturn<any>;
  step2Form: UseFormReturn<any>;
  onNextStep: () => void;
  onPreviousStep: () => void;
  onSubmit: (code: string) => void;
  onResendCode: () => void;
  checkIfMinor: (date: Date) => boolean;
}

export const SignUpForm = memo<SignUpFormProps>(({
  currentStep,
  loading,
  verificationLoading,
  resendTimer,
  step1Form,
  step2Form,
  onNextStep,
  onPreviousStep,
  onSubmit,
  onResendCode,
  checkIfMinor,
}) => {
  const [verificationCode, setVerificationCode] = useState('');
  const [isStep1Valid, setIsStep1Valid] = useState(false);
  const isMinor = step2Form.watch('isMinor');
  
  // Watch valores críticos para forçar revalidação
  const watchedValues = step1Form.watch(['birthdate', 'gender', 'first_name', 'last_name', 'sector']);
  
  // Force revalidation when critical values change
  useEffect(() => {
    console.log('🔍 [SignUpForm] useEffect triggered');
    console.log('🔍 [SignUpForm] watchedValues:', watchedValues);
    
    const checkValidation = async () => {
      console.log('🔍 [SignUpForm] Starting validation check...');
      
      // Get current form state before validation
      const currentValues = step1Form.getValues();
      const currentErrors = step1Form.formState.errors;
      const currentIsValid = step1Form.formState.isValid;
      
      console.log('🔍 [SignUpForm] Before trigger - Values:', currentValues);
      console.log('🔍 [SignUpForm] Before trigger - Errors:', currentErrors);
      console.log('🔍 [SignUpForm] Before trigger - IsValid:', currentIsValid);
      
      const isValid = await step1Form.trigger();
      
      console.log('🔍 [SignUpForm] After trigger - Result:', isValid);
      console.log('🔍 [SignUpForm] After trigger - Errors:', step1Form.formState.errors);
      console.log('🔍 [SignUpForm] After trigger - IsValid:', step1Form.formState.isValid);
      
      setIsStep1Valid(isValid);
      console.log('🔍 [SignUpForm] Set local state to:', isValid);
    };
    
    checkValidation();
  }, [watchedValues, step1Form]);
  
  // console.log('Step 1 Values:', step1Values);
  // console.log('Step 1 Is Valid:', step1IsValid);
  // console.log('Step 1 Errors:', step1Errors);

  const renderStep1 = () => (
    <ScrollView showsVerticalScrollIndicator={false}>
      <View style={{ gap: 16 }}>
        <Text variant="h3" className="mb-6 text-center">
          Informações Pessoais
        </Text>

        {/* Avatar Upload */}
        <Controller
          control={step1Form.control}
          name="avatar"
          render={({ field: { value, onChange } }) => (
            <AvatarUpload
              value={value}
              onChange={onChange}
              error={getErrorMessage(step1Form.formState.errors.avatar)}
              className="mb-6"
            />
          )}
        />

        {/* Nome e Sobrenome */}
        <View className="flex-row" style={{ gap: 12 }}>
          <Controller
            control={step1Form.control}
            name="first_name"
            render={({ field: { value, onChange, onBlur } }) => (
              <View className="flex-1">
                <Input
                  label="Nome"
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  error={getErrorMessage(step1Form.formState.errors.first_name)}
                  autoCapitalize="words"
                />
              </View>
            )}
          />

          <Controller
            control={step1Form.control}
            name="last_name"
            render={({ field: { value, onChange, onBlur } }) => (
              <View className="flex-1">
                <Input
                  label="Sobrenome"
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  error={getErrorMessage(step1Form.formState.errors.last_name)}
                  autoCapitalize="words"
                />
              </View>
            )}
          />
        </View>

        {/* Data de Nascimento */}
        <Controller
          control={step1Form.control}
          name="birthdate"
          render={({ field: { value, onChange } }) => (
            <DatePicker
              value={value}
              onChange={(date) => {
                onChange(date);
                checkIfMinor(date);
              }}
              label="Data de Nascimento"
              error={getErrorMessage(step1Form.formState.errors.birthdate)}
            />
          )}
        />

        {/* Gênero */}
        <Controller
          control={step1Form.control}
          name="gender"
          render={({ field: { value, onChange } }) => (
            <Box>
              <Text variant="label" className="mb-2">Gênero</Text>
              <HStack space={'sm'}>
                {[
                  { label: 'Masculino', value: 'M' },
                  { label: 'Feminino', value: 'F' },
                ].map((option) => (
                  <Button
                    key={option.value}
                    variant={value === option.value ? 'primary' : 'outline'}
                    size="large"
                    onPress={() => onChange(option.value)}
                    className="flex-1 rounded-full"
                  >
                    {option.label}
                  </Button>
                ))}
              </HStack>
              {getErrorMessage(step1Form.formState.errors.gender) && (
                <Text className="mt-1 text-red-500">
                  {getErrorMessage(step1Form.formState.errors.gender)}
                </Text>
              )}
            </Box>
          )}
        />

        {/* Setor */}
        <Controller
          control={step1Form.control}
          name="sector"
          render={({ field: { value, onChange } }) => (
            <SectorSelect
              value={value}
              onChange={onChange}
              label="Setor"
              error={getErrorMessage(step1Form.formState.errors.sector)}
            />
          )}
        />

        {/* Debug temporário */}
        <Button
          variant="outline"
          size="small"
          onPress={() => {
            const values = step1Form.getValues();
            const errors = step1Form.formState.errors;
            const isValid = step1Form.formState.isValid;
            console.log('🐛 Debug Form:');
            console.log('Values:', values);
            console.log('Value types:', {
              first_name: typeof values.first_name,
              last_name: typeof values.last_name,
              birthdate: typeof values.birthdate,
              gender: typeof values.gender,
              sector: typeof values.sector,
              avatar: typeof values.avatar
            });
            console.log('Errors:', errors);
            console.log('IsValid:', isValid);
            
            // Test each field individually
            const { z } = require('zod');
            console.log('Testing individual fields:');
            console.log('first_name valid:', z.string().trim().min(2).safeParse(values.first_name));
            console.log('last_name valid:', z.string().trim().min(2).safeParse(values.last_name));
            console.log('birthdate valid:', z.date().safeParse(values.birthdate));
            console.log('gender valid:', z.enum(['M', 'F']).safeParse(values.gender));
            console.log('sector valid:', z.string().trim().min(1).safeParse(values.sector));
            
            // Trigger validation
            step1Form.trigger().then(valid => {
              console.log('After trigger - Valid:', valid);
              console.log('After trigger - Errors:', step1Form.formState.errors);
              console.log('After trigger - IsValid:', step1Form.formState.isValid);
              const currentWatchedValues = step1Form.watch(['birthdate', 'gender', 'first_name', 'last_name', 'sector']);
              
              alert(`
📊 FORM STATE SUMMARY:
===================
Form Valid (before): ${isValid}
After Trigger: ${valid}
Form Valid (after): ${step1Form.formState.isValid}
Local Valid State: ${isStep1Valid}

📝 VALUES:
==========
Birthdate: ${values.birthdate ? values.birthdate.toString() : 'NOT SET'}
Gender: ${values.gender || 'NOT SET'}
First Name: "${values.first_name}" (${values.first_name?.length} chars)
Last Name: "${values.last_name}" (${values.last_name?.length} chars)
Sector: "${values.sector}" (${values.sector?.length} chars)

❌ ERRORS: ${Object.keys(errors).join(', ') || 'NONE'}

🔍 WATCHED VALUES: ${JSON.stringify(currentWatchedValues)}
              `);
            });
          }}
          fullWidth
          style={{ marginBottom: 8 }}
        >
          🐛 Debug Form State
        </Button>

        {/* Botão para forçar valid state - TESTE */}
        <Button
          variant="secondary"
          size="small"
          onPress={() => {
            console.log('🔧 [TEST] Forcing valid state to true');
            setIsStep1Valid(true);
          }}
          fullWidth
          style={{ marginBottom: 8 }}
        >
          🔧 Force Valid State (TEST)
        </Button>

        <Button
          variant="primary"
          size="large"
          onPress={onNextStep}
          disabled={!isStep1Valid}
          fullWidth
          rightIcon={<Icon name={'arrow-right'} size={20} color="#fff" family={'Feather'} />}
        >
          Próximo {isStep1Valid ? '✅' : '❌'} (Local: {isStep1Valid ? 'T' : 'F'} | Form: {step1Form.formState.isValid ? 'T' : 'F'})
        </Button>
      </View>
    </ScrollView>
  );

  const renderStep2 = () => (
    <ScrollView showsVerticalScrollIndicator={false}>
      <View style={{ gap: 16 }}>
        <Text variant="h3" className="mb-6 text-center">
          Dados de Acesso
        </Text>

        {/* Email com validação */}
        <Controller
          control={step2Form.control}
          name="email"
          render={({ field: { value, onChange } }) => (
            <EmailValidator
              value={value}
              onChange={onChange}
              error={getErrorMessage(step2Form.formState.errors.email)}
            />
          )}
        />

        {/* Telefone */}
        <Controller
          control={step2Form.control}
          name="phone"
          render={({ field: { value, onChange, onBlur } }) => (
            <Input
              label="Telefone"
              value={value}
              onChangeText={onChange}
              onBlur={onBlur}
              error={getErrorMessage(step2Form.formState.errors.phone)}
              keyboardType="phone-pad"
              placeholder="(00) 00000-0000"
              maxLength={15}
            />
          )}
        />

        {/* Senha */}
        <Controller
          control={step2Form.control}
          name="password"
          render={({ field: { value, onChange, onBlur } }) => (
            <View>
              <Input
                label="Senha"
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
                error={getErrorMessage(step2Form.formState.errors.password)}
                secureTextEntry
                autoCapitalize="none"
              />
              <PasswordStrengthIndicator password={value} />
            </View>
          )}
        />

        {/* Confirmar Senha */}
        <Controller
          control={step2Form.control}
          name="confirmPassword"
          render={({ field: { value, onChange, onBlur } }) => (
            <Input
              label="Confirmar Senha"
              value={value}
              onChangeText={onChange}
              onBlur={onBlur}
              error={getErrorMessage(step2Form.formState.errors.confirmPassword)}
              secureTextEntry
              autoCapitalize="none"
            />
          )}
        />

        {/* Dados do Responsável (se menor) */}
        {isMinor && (
          <View className="p-4 bg-yellow-50 rounded-lg border border-yellow-200" style={{ gap: 16 }}>
            <Text variant="body" className="font-semibold">
              Dados do Responsável Legal
            </Text>

            <Controller
              control={step2Form.control}
              name="responsibleName"
              render={({ field: { value, onChange, onBlur } }) => (
                <Input
                  label="Nome do Responsável"
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  error={getErrorMessage(step2Form.formState.errors.responsibleName)}
                  autoCapitalize="words"
                />
              )}
            />

            <Controller
              control={step2Form.control}
              name="responsiblePhone"
              render={({ field: { value, onChange, onBlur } }) => (
                <Input
                  label="Telefone do Responsável"
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  error={getErrorMessage(step2Form.formState.errors.responsiblePhone)}
                  keyboardType="phone-pad"
                  placeholder="(00) 00000-0000"
                />
              )}
            />
          </View>
        )}

        {/* Termos */}
        <Controller
          control={step2Form.control}
          name="termsAccepted"
          render={({ field: { value, onChange } }) => (
            <TermsCheckbox
              value={value}
              onChange={onChange}
              error={getErrorMessage(step2Form.formState.errors.termsAccepted)}
            />
          )}
        />

        <View className="flex-row" style={{ gap: 12 }}>
          <Button
            variant="outline"
            size="large"
            onPress={onPreviousStep}
            className="flex-1"
            leftIcon={<Icon name={ChevronLeft} size={20} color="#3b82f6" />}
          >
            Voltar
          </Button>

          <Button
            variant="primary"
            size="large"
            onPress={onNextStep}
            disabled={!step2Form.formState.isValid}
            className="flex-1"
            rightIcon={<Icon name={ChevronRight} size={20} color="#fff" />}
          >
            Próximo
          </Button>
        </View>
      </View>
    </ScrollView>
  );

  const renderStep3 = () => (
    <View className="flex-1 justify-center">
      <View style={{ gap: 24 }}>
        <View className="items-center mb-8">
          <Text variant="h3" className="mb-2">
            Verificação
          </Text>
          <Text variant="body" color="#6b7280" className="text-center">
            Digite o código de 6 dígitos enviado para{'\n'}
            {step2Form.getValues('phone')}
          </Text>
        </View>

        <Input
          label="Código de Verificação"
          value={verificationCode}
          onChangeText={setVerificationCode}
          placeholder="000000"
          keyboardType="number-pad"
          maxLength={6}
          autoFocus
          inputStyle={{ textAlign: 'center', fontSize: 24 }}
        />

        {resendTimer > 0 ? (
          <Text variant="caption" color="#6b7280" className="text-center">
            Reenviar código em {resendTimer}s
          </Text>
        ) : (
          <Button
            variant="ghost"
            size="small"
            onPress={onResendCode}
            disabled={verificationLoading}
          >
            Reenviar código
          </Button>
        )}

        <View className="flex-row" style={{ gap: 12 }}>
          <Button
            variant="outline"
            size="large"
            onPress={onPreviousStep}
            disabled={loading}
            className="flex-1"
            leftIcon={<Icon name={ChevronLeft} size={20} color="#3b82f6" />}
          >
            Voltar
          </Button>

          <Button
            variant="primary"
            size="large"
            onPress={() => onSubmit(verificationCode)}
            disabled={verificationCode.length !== 6 || loading}
            loading={loading}
            className="flex-1"
          >
            Verificar e Criar Conta
          </Button>
        </View>
      </View>
    </View>
  );

  const steps = [renderStep1, renderStep2, renderStep3];

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      className="flex-1"
    >
      <View className="flex-1">
        <ProgressIndicator
          currentStep={currentStep}
          totalSteps={3}
          labels={['Pessoal', 'Acesso', 'Verificação']}
          className="mb-6"
        />

        <View className="flex-1">
          {steps[currentStep - 1]()}
        </View>
      </View>
    </KeyboardAvoidingView>
  );
});

SignUpForm.displayName = 'SignUpForm';