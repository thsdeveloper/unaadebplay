import React, { useContext } from 'react';
import { AuthTemplate } from '@/components/templates';
import { SignUpForm } from '@/components/organisms/SignUpForm';
import { useSignUp } from '@/hooks/useSignUp';
import ConfigContext from '@/contexts/ConfigContext';

export default function SignUp() {
  const config = useContext(ConfigContext);
  const signUp = useSignUp();

  return (
    <AuthTemplate isLoading={(config as any)?.isLoading}>
      <SignUpForm
        loading={signUp.loading}
        step1Form={signUp.step1Form}
        step2Form={signUp.step2Form}
        onSubmit={signUp.handleSubmit}
        checkIfMinor={signUp.checkIfMinor}
      />
    </AuthTemplate>
  );
}
