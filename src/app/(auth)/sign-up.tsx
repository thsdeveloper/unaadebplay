import React, { useContext } from 'react';
import { useRouter } from 'expo-router';
import { AuthTemplate } from '@/components/templates';
import { SignUpForm } from '@/components/organisms/SignUpForm';
import { AuthFooter } from '@/components/organisms/AuthFooter';
import { useSignUp } from '@/hooks/useSignUp';
import ConfigContext from '@/contexts/ConfigContext';
import TranslationContext from '@/contexts/TranslationContext';

export default function SignUp() {
  const router = useRouter();
  const config = useContext(ConfigContext);
  const { t } = useContext(TranslationContext);
  
  const signUp = useSignUp();

  return (
    <AuthTemplate
      isLoading={(config as any)?.isLoading}
      showHeader={false}
      onBack={() => router.back()}
    >
      <SignUpForm
        currentStep={signUp.currentStep}
        loading={signUp.loading}
        verificationLoading={signUp.verificationLoading}
        resendTimer={signUp.resendTimer}
        step1Form={signUp.step1Form}
        step2Form={signUp.step2Form}
        onNextStep={signUp.handleNextStep}
        onPreviousStep={signUp.handlePreviousStep}
        onSubmit={signUp.handleSubmit}
        onResendCode={signUp.resendCode}
        checkIfMinor={signUp.checkIfMinor}
      />

      {signUp.currentStep === 1 && (
        <AuthFooter
          showSignIn
          copyrightText={(config as any)?.copyright_text}
          onSignInPress={() => router.push('/sign-in')}
        />
      )}
    </AuthTemplate>
  );
}