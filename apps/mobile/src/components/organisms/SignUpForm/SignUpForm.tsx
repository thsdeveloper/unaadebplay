import React, { memo, useCallback, useMemo, useRef, useState, useEffect } from 'react';
import { View, ScrollView, KeyboardAvoidingView, Platform, Pressable, StyleSheet, Animated, Text as RNText, Modal } from 'react-native';
import { UseFormReturn, useController } from 'react-hook-form';
import { useRouter } from 'expo-router';
import { ChevronLeft, Mail, Lock, Phone, User, Pencil, LogIn } from 'lucide-react-native';
import { emailExists } from '@/services/user';

import { Text } from '@/components/atoms';
import { AvatarUpload } from '@/components/atoms';
import { DatePicker, TermsCheckbox, PasswordStrengthIndicator } from '@/components/molecules';
import { GlassInput } from '@/components/molecules/GlassInput';
import { GradientButton } from '@/components/atoms/GradientButton';
import { ProgressThread, SegmentedGender, MinorBadge, SuccessOverlay } from '@/components/molecules/ConversationControls';
import { SectorBeat } from './SectorBeat';
import { maskPhoneBR } from '@/utils/masks';

const err = (e: any): string | undefined => (!e ? undefined : typeof e === 'string' ? e : e.message);

interface SignUpFormProps {
  loading: boolean;
  step1Form: UseFormReturn<any>;
  step2Form: UseFormReturn<any>;
  onSubmit: () => Promise<boolean> | void;
  checkIfMinor: (date: Date) => boolean;
}

type Beat = 'identity' | 'about' | 'sector' | 'guardian' | 'contact' | 'security' | 'review';

// Slide-in wrapper (remount per beat via key)
const StepScreen: React.FC<{ dir: number; children: React.ReactNode }> = ({ dir, children }) => {
  const tx = useRef(new Animated.Value(dir * 28)).current;
  const op = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.parallel([
      Animated.spring(tx, { toValue: 0, useNativeDriver: true, friction: 9, tension: 60 }),
      Animated.timing(op, { toValue: 1, duration: 260, useNativeDriver: true }),
    ]).start();
  }, []);
  return <Animated.View style={{ flex: 1, opacity: op, transform: [{ translateX: tx }] }}>{children}</Animated.View>;
};

export const SignUpForm = memo<SignUpFormProps>(({
  loading,
  step1Form,
  step2Form,
  onSubmit,
  checkIfMinor,
}) => {
  const router = useRouter();
  const [beat, setBeat] = useState<Beat>('identity');
  const [dir, setDir] = useState(1);
  const [submitting, setSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [minorAge, setMinorAge] = useState<number | null>(null);
  const [checkingEmail, setCheckingEmail] = useState(false);
  const [emailTaken, setEmailTaken] = useState(false);

  const firstName = (step1Form.watch('first_name') || '').trim();
  const isMinor = !!step2Form.watch('isMinor');

  const order: Beat[] = useMemo(() => {
    const o: Beat[] = ['identity', 'about', 'sector'];
    if (isMinor) o.push('guardian');
    o.push('contact', 'security', 'review');
    return o;
  }, [isMinor]);

  const beatIndex = order.indexOf(beat);
  const progress = order.length > 1 ? beatIndex / (order.length - 1) : 0;

  const go = useCallback((to: Beat, d: number) => { setDir(d); setBeat(to); }, []);

  const next = useCallback(async () => {
    if (checkingEmail) return; // evita reentrância/double-tap durante a checagem de email
    const i = order.indexOf(beat);
    const validateMap: Record<string, () => Promise<boolean>> = {
      identity: () => step1Form.trigger(['first_name', 'last_name']),
      about: () => step1Form.trigger(['birthdate', 'gender']),
      sector: () => step1Form.trigger(['sector']),
      guardian: () => step2Form.trigger(['responsibleName', 'responsiblePhone']),
      contact: () => step2Form.trigger(['email', 'phone']),
      security: () => step2Form.trigger(['password', 'confirmPassword', 'termsAccepted']),
    };
    if (validateMap[beat]) {
      const ok = await validateMap[beat]();
      if (!ok) return;
    }
    // No passo de contato: se o email já tem conta, oferece login em vez de avançar.
    if (beat === 'contact') {
      const email = (step2Form.getValues('email') || '').trim();
      if (email) {
        setCheckingEmail(true);
        const exists = await emailExists(email);
        setCheckingEmail(false);
        if (exists) { setEmailTaken(true); return; }
      }
    }
    const nextBeat = order[i + 1];
    if (nextBeat) go(nextBeat, 1);
  }, [beat, order, step1Form, step2Form, go, checkingEmail]);

  // "Já tenho conta" a partir do modal: leva ao login com o email preenchido.
  const goToLoginWithEmail = useCallback(() => {
    const email = (step2Form.getValues('email') || '').trim();
    setEmailTaken(false);
    router.replace({ pathname: '/(auth)/sign-in', params: { email } } as any);
  }, [step2Form, router]);

  const back = useCallback(() => {
    const i = order.indexOf(beat);
    if (i > 0) go(order[i - 1], -1);
  }, [beat, order, go]);

  // Cria a conta direto (autenticação por email/senha — sem SMS). Mostra o overlay de sucesso;
  // se o registro falhar, esconde o overlay para o usuário tentar de novo.
  const submit = useCallback(async () => {
    setSubmitting(true);
    setShowSuccess(true);
    const ok = await Promise.resolve(onSubmit());
    if (ok === false) {
      setShowSuccess(false);
      setSubmitting(false);
    }
    // Em caso de sucesso, o AuthContext.register navega para a home (overlay cobre a transição).
  }, [onSubmit]);

  /* ───── beat content ───── */
  const headline = (() => {
    switch (beat) {
      case 'identity': return 'Vamos começar! Como podemos te chamar?';
      case 'about': return firstName ? `${firstName}, quando você nasceu?` : 'Quando você nasceu?';
      case 'sector': return 'De qual setor você é?';
      case 'guardian': return 'Dados do seu responsável';
      case 'contact': return firstName ? `${firstName}, qual seu contato?` : 'Qual seu contato?';
      case 'security': return 'Bora criar uma senha forte';
      case 'review': return firstName ? `Tudo certo, ${firstName}? 👀` : 'Tudo certo por aqui? 👀';
    }
  })();

  const helper = (() => {
    switch (beat) {
      case 'identity': return 'Comece com uma foto e seu nome.';
      case 'about': return 'Sua data de nascimento e gênero.';
      case 'sector': return 'Escolha o setor que você faz parte.';
      case 'guardian': return 'Como você é menor de idade, precisamos de um responsável.';
      case 'contact': return 'Email e telefone para contato.';
      case 'security': return 'Crie uma senha segura e aceite os termos.';
      case 'review': return 'Confira seus dados antes de criar a conta.';
    }
  })();

  const renderBeat = () => {
    switch (beat) {
      case 'identity':
        return (
          <View style={{ gap: 16 }}>
            <View className="items-center">
              <Controller2 form={step1Form} name="avatar">
                {(v, on) => <AvatarUpload value={v} onChange={on} />}
              </Controller2>
            </View>
            <View className="flex-row" style={{ gap: 12 }}>
              <Controller2 form={step1Form} name="first_name">
                {(v, on, ob) => (
                  <View className="flex-1">
                    <GlassInput placeholder="Nome" value={v} onChangeText={on} onBlur={ob} autoCapitalize="words" error={err(step1Form.formState.errors.first_name)} />
                  </View>
                )}
              </Controller2>
              <Controller2 form={step1Form} name="last_name">
                {(v, on, ob) => (
                  <View className="flex-1">
                    <GlassInput placeholder="Sobrenome" value={v} onChangeText={on} onBlur={ob} autoCapitalize="words" error={err(step1Form.formState.errors.last_name)} />
                  </View>
                )}
              </Controller2>
            </View>
            <Pressable onPress={() => router.replace('/(auth)/sign-in')} hitSlop={8} className="items-center mt-1">
              <RNText style={styles.signinLink}>Já tenho conta · <RNText style={styles.link}>Entrar</RNText></RNText>
            </Pressable>
          </View>
        );
      case 'about':
        return (
          <View style={{ gap: 16 }}>
            <Controller2 form={step1Form} name="birthdate">
              {(v, on) => (
                <DatePicker
                  value={v}
                  label="Data de nascimento"
                  showAge
                  error={err(step1Form.formState.errors.birthdate)}
                  onChange={(date: Date) => {
                    on(date);
                    const m = checkIfMinor(date);
                    const age = Math.floor((Date.now() - new Date(date).getTime()) / (365.25 * 864e5));
                    setMinorAge(m ? age : null);
                  }}
                />
              )}
            </Controller2>
            {minorAge !== null && <MinorBadge age={minorAge} />}
            <View>
              <Text variant="label" className="mb-2 text-typography-300">Gênero</Text>
              <Controller2 form={step1Form} name="gender">
                {(v, on) => <SegmentedGender value={v} onChange={on} />}
              </Controller2>
              {err(step1Form.formState.errors.gender) && <RNText style={styles.fieldErr}>{err(step1Form.formState.errors.gender)}</RNText>}
            </View>
          </View>
        );
      case 'sector':
        return (
          <Controller2 form={step1Form} name="sector">
            {(v, on) => <SectorBeat value={v} onChange={on} error={err(step1Form.formState.errors.sector)} />}
          </Controller2>
        );
      case 'guardian':
        return (
          <View style={{ gap: 14 }}>
            <Controller2 form={step2Form} name="responsibleName">
              {(v, on, ob) => <GlassInput icon={<User size={20} color="rgba(226,232,240,0.7)" />} placeholder="Nome do responsável" value={v} onChangeText={on} onBlur={ob} autoCapitalize="words" error={err(step2Form.formState.errors.responsibleName)} />}
            </Controller2>
            <Controller2 form={step2Form} name="responsiblePhone">
              {(v, on, ob) => <GlassInput icon={<Phone size={20} color="rgba(226,232,240,0.7)" />} placeholder="Telefone do responsável — (00) 00000-0000" value={v} onChangeText={(t) => on(maskPhoneBR(t))} onBlur={ob} keyboardType="phone-pad" maxLength={16} error={err(step2Form.formState.errors.responsiblePhone)} />}
            </Controller2>
          </View>
        );
      case 'contact':
        return (
          <View style={{ gap: 14 }}>
            <Controller2 form={step2Form} name="email">
              {(v, on, ob) => <GlassInput icon={<Mail size={20} color="rgba(226,232,240,0.7)" />} placeholder="Email" value={v} onChangeText={on} onBlur={ob} keyboardType="email-address" error={err(step2Form.formState.errors.email)} />}
            </Controller2>
            <Controller2 form={step2Form} name="phone">
              {(v, on, ob) => <GlassInput icon={<Phone size={20} color="rgba(226,232,240,0.7)" />} placeholder="Telefone — (00) 00000-0000" value={v} onChangeText={(t) => on(maskPhoneBR(t))} onBlur={ob} keyboardType="phone-pad" maxLength={16} error={err(step2Form.formState.errors.phone)} />}
            </Controller2>
          </View>
        );
      case 'security':
        return (
          <View style={{ gap: 14 }}>
            <Controller2 form={step2Form} name="password">
              {(v, on, ob) => (
                <View>
                  <GlassInput
                    icon={<Lock size={20} color="rgba(226,232,240,0.7)" />}
                    placeholder="Senha"
                    value={v}
                    // Revalida a confirmação junto — senão o erro "Senhas não conferem" fica
                    // preso quando a senha é editada DEPOIS da confirmação já preenchida.
                    onChangeText={(t) => { on(t); if (step2Form.getValues('confirmPassword')) step2Form.trigger('confirmPassword'); }}
                    onBlur={ob}
                    password
                    error={err(step2Form.formState.errors.password)}
                  />
                  <PasswordStrengthIndicator password={v} />
                </View>
              )}
            </Controller2>
            <Controller2 form={step2Form} name="confirmPassword">
              {(v, on, ob) => <GlassInput icon={<Lock size={20} color="rgba(226,232,240,0.7)" />} placeholder="Confirmar senha" value={v} onChangeText={on} onBlur={ob} password error={err(step2Form.formState.errors.confirmPassword)} />}
            </Controller2>
            <Controller2 form={step2Form} name="termsAccepted">
              {(v, on) => <TermsCheckbox value={!!v} onChange={on} error={err(step2Form.formState.errors.termsAccepted)} />}
            </Controller2>
          </View>
        );
      case 'review':
        return <ReviewCard step1={step1Form} step2={step2Form} isMinor={isMinor} firstName={firstName} onEdit={(b) => go(b, -1)} />;
    }
  };

  const ctaLabel = beat === 'review' ? 'Criar conta' : beat === 'security' ? 'Revisar meus dados' : 'Continuar';

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} className="flex-1">
      {/* chrome: back + progress */}
      <View className="flex-row items-center mb-5" style={{ gap: 12 }}>
        <Pressable onPress={() => (beatIndex === 0 ? router.replace('/(auth)/sign-in') : back())} hitSlop={10} style={styles.backBtn}>
          <ChevronLeft size={22} color="#E2E8F0" />
        </Pressable>
        <View className="flex-1"><ProgressThread progress={progress} /></View>
        <Text variant="caption" className="text-typography-400">{beatIndex + 1}/{order.length}</Text>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled" contentContainerStyle={{ flexGrow: 1, paddingBottom: 16 }}>
        <StepScreen key={beat} dir={dir}>
          <Text className="text-typography-0 mb-1" style={styles.headline}>{headline}</Text>
          <Text className="text-typography-400 mb-7" style={styles.helper}>{helper}</Text>
          {renderBeat()}
        </StepScreen>
      </ScrollView>

      <View style={{ paddingTop: 8 }}>
        <GradientButton
          label={ctaLabel}
          onPress={beat === 'review' ? submit : next}
          loading={(beat === 'review' && (loading || submitting)) || (beat === 'contact' && checkingEmail)}
        />
      </View>

      {showSuccess && <SuccessOverlay firstName={firstName} />}

      {/* Modal: email já cadastrado → oferece login (com o email preenchido) */}
      <Modal visible={emailTaken} transparent animationType="fade" onRequestClose={() => setEmailTaken(false)}>
        <View style={styles.modalBackdrop}>
          <View style={styles.modalCard}>
            <View style={styles.modalIcon}><Mail size={26} color="#E51C44" /></View>
            <RNText style={styles.modalTitle}>Email já cadastrado</RNText>
            <RNText style={styles.modalBody}>Já existe uma conta com este email. Deseja entrar?</RNText>
            <View style={{ width: '100%' }}>
              <GradientButton label="Entrar" leftIcon={<LogIn size={18} color="#fff" />} onPress={goToLoginWithEmail} />
            </View>
            <Pressable onPress={() => setEmailTaken(false)} hitSlop={8} style={styles.modalGhost}>
              <RNText style={styles.modalGhostText}>Usar outro email</RNText>
            </Pressable>
          </View>
        </View>
      </Modal>
    </KeyboardAvoidingView>
  );
});

SignUpForm.displayName = 'SignUpForm';

/* tiny inline RHF Controller (avoids importing Controller everywhere) */
const Controller2: React.FC<{ form: UseFormReturn<any>; name: string; children: (v: any, onChange: (x: any) => void, onBlur: () => void) => React.ReactNode }> = ({ form, name, children }) => {
  const { field } = useController({ control: form.control, name });
  return <>{children(field.value, field.onChange, field.onBlur)}</>;
};

/* ───── Review card ───── */
const ReviewCard: React.FC<{ step1: UseFormReturn<any>; step2: UseFormReturn<any>; isMinor: boolean; firstName: string; onEdit: (b: Beat) => void }> = ({ step1, step2, isMinor, onEdit }) => {
  const s1 = step1.getValues();
  const s2 = step2.getValues();
  const fullName = `${s1.first_name || ''} ${s1.last_name || ''}`.trim();
  const initials = `${(s1.first_name || '?')[0] || ''}${(s1.last_name || '')[0] || ''}`.toUpperCase();
  const birth = s1.birthdate ? new Date(s1.birthdate).toLocaleDateString('pt-BR') : '—';

  const Row = ({ k, v }: { k: string; v: string }) => (
    <View className="flex-row justify-between py-1.5">
      <RNText style={rc.k}>{k}</RNText>
      <RNText style={rc.v} numberOfLines={1}>{v || '—'}</RNText>
    </View>
  );
  const Section = ({ title, beat, children }: { title: string; beat: Beat; children: React.ReactNode }) => (
    <View style={rc.section}>
      <View className="flex-row items-center justify-between mb-1">
        <RNText style={rc.sectionTitle}>{title}</RNText>
        <Pressable onPress={() => onEdit(beat)} hitSlop={8} className="flex-row items-center" style={{ gap: 4 }}>
          <Pencil size={13} color="#FF4D6D" />
          <RNText style={rc.edit}>Editar</RNText>
        </Pressable>
      </View>
      {children}
    </View>
  );

  return (
    <View style={{ gap: 14 }}>
      <View className="items-center">
        <View style={rc.avatar}><RNText style={rc.avatarTxt}>{initials}</RNText></View>
        <RNText style={rc.name}>{fullName}</RNText>
      </View>

      <Section title="Você" beat="identity">
        <Row k="Nascimento" v={birth} />
        <Row k="Gênero" v={s1.gender === 'M' ? 'Masculino' : s1.gender === 'F' ? 'Feminino' : '—'} />
      </Section>

      <Section title="Acesso" beat="contact">
        <Row k="Email" v={s2.email} />
        <Row k="Telefone" v={s2.phone} />
        <Row k="Senha" v={s2.password ? '••••••••' : '—'} />
      </Section>

      {isMinor && (
        <Section title="Responsável" beat="guardian">
          <Row k="Nome" v={s2.responsibleName} />
          <Row k="Telefone" v={s2.responsiblePhone} />
        </Section>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  headline: { fontSize: 27, fontWeight: '700', lineHeight: 33 },
  helper: { fontSize: 15 },
  backBtn: { width: 38, height: 38, borderRadius: 12, alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(255,255,255,0.05)' },
  fieldErr: { color: '#FCA5A5', fontSize: 12, marginTop: 6, marginLeft: 4 },
  link: { color: '#FF4D6D', fontWeight: '600', fontSize: 15 },
  signinLink: { color: '#94A3B8', fontSize: 14 },

  // Modal "email já cadastrado"
  modalBackdrop: { flex: 1, backgroundColor: 'rgba(8,12,22,0.72)', alignItems: 'center', justifyContent: 'center', padding: 28 },
  modalCard: { width: '100%', maxWidth: 380, backgroundColor: '#111A2E', borderRadius: 24, borderWidth: 1, borderColor: 'rgba(255,255,255,0.10)', padding: 24, alignItems: 'center' },
  modalIcon: { width: 56, height: 56, borderRadius: 28, alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(229,28,68,0.14)', borderWidth: 1, borderColor: 'rgba(229,28,68,0.35)', marginBottom: 14 },
  modalTitle: { color: '#F8FAFC', fontSize: 19, fontWeight: '800', textAlign: 'center' },
  modalBody: { color: '#94A3B8', fontSize: 14.5, textAlign: 'center', marginTop: 8, marginBottom: 18, lineHeight: 20 },
  modalGhost: { marginTop: 14, paddingVertical: 6 },
  modalGhostText: { color: '#94A3B8', fontSize: 14.5, fontWeight: '600' },
});

const rc = StyleSheet.create({
  avatar: { width: 72, height: 72, borderRadius: 36, alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(229,28,68,0.18)', borderWidth: 1, borderColor: 'rgba(229,28,68,0.4)' },
  avatarTxt: { color: '#fff', fontSize: 26, fontWeight: '800' },
  name: { color: '#F8FAFC', fontSize: 20, fontWeight: '700', marginTop: 10 },
  section: { padding: 16, borderRadius: 18, backgroundColor: 'rgba(255,255,255,0.05)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.10)' },
  sectionTitle: { color: '#94A3B8', fontSize: 12, fontWeight: '700', letterSpacing: 1, textTransform: 'uppercase' },
  edit: { color: '#FF4D6D', fontSize: 13, fontWeight: '600' },
  k: { color: '#94A3B8', fontSize: 14 },
  v: { color: '#E2E8F0', fontSize: 14, fontWeight: '600', maxWidth: '60%' },
});
