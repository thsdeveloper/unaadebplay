import React, { useContext, useState, useCallback } from 'react';
import { View, Text as RNText, ScrollView, KeyboardAvoidingView, Platform, StyleSheet } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import * as Yup from 'yup';
import { Controller, useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { User, MapPin, FileText, Bell } from 'lucide-react-native';
import AvatarUpdated from '@/components/AvatarUpdated';
import { GlassInput } from '@/components/molecules/GlassInput';
import { GradientButton } from '@/components/atoms/GradientButton';
import { SheetGroup } from '@/components/molecules/SheetGroup';
import { SheetRow } from '@/components/molecules/SheetRow';
import { SegmentedGender } from '@/components/molecules/ConversationControls';
import { SHEET } from '@/constants/sheetTokens';
import { updateUserMe } from '@/services/user';
import authContext from '@/contexts/AuthContext';
import AlertContext from '@/contexts/AlertContext';
import TranslationContext from '@/contexts/TranslationContext';
import { handleErrors } from '@/utils/directus';

// E-mail NÃO é editável aqui (trocar o login exige supabase.auth.updateUser + confirmação);
// fica visível/read-only no bloco de identidade. Gênero usa 'M'/'F' — o mesmo vocabulário
// que o cadastro grava em profiles.gender (evita encoding misto no banco).
const schema = Yup.object({
  first_name: Yup.string().trim().min(2, 'Mínimo de 2 caracteres').required('Informe seu nome'),
  last_name: Yup.string().trim().min(2, 'Mínimo de 2 caracteres').required('Informe seu sobrenome'),
  location: Yup.string().trim().min(2, 'Informe sua localização').required('Informe sua localização'),
  description: Yup.string().trim().notRequired(),
  gender: Yup.string().oneOf(['M', 'F']).required('Selecione o gênero'),
});
type FormData = Yup.InferType<typeof schema>;

export default function SettingsScreen() {
  const { t } = useContext(TranslationContext);
  const alert = useContext(AlertContext);
  const { user, setUser } = useContext(authContext);
  const [saving, setSaving] = useState(false);

  // Só semeia o gênero se já estiver no vocabulário canônico ('M'/'F'); valores legados
  // ('masculino'/vazio) ficam sem seleção e o usuário escolhe (normalizando para 'M'/'F').
  const seedGender = user?.gender === 'M' || user?.gender === 'F' ? user.gender : undefined;

  const { control, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: yupResolver(schema),
    mode: 'onTouched',
    defaultValues: {
      first_name: user?.first_name ?? '',
      last_name: user?.last_name ?? '',
      location: user?.location ?? '',
      description: user?.description ?? '',
      gender: seedGender,
    },
  });

  const onSave = useCallback(async (d: FormData) => {
    setSaving(true);
    try {
      const memberTitle = t('member_unaadeb');
      const updated = await updateUserMe({
        ...d,
        title: memberTitle === 'member_unaadeb' ? 'Membro UNAADEB' : memberTitle,
      });
      await setUser(updated);
      alert.success('Perfil atualizado com sucesso');
    } catch (e: any) {
      alert.error(`Erro ao atualizar: ${handleErrors(e)}`);
    } finally {
      setSaving(false);
    }
  }, [t, setUser, alert]);

  const goNotif = useCallback(() => router.push('/(tabs)/(settings)/notification-settings'), []);

  return (
    <SafeAreaView style={s.safe} edges={['top']}>
      <StatusBar style="light" />
      <KeyboardAvoidingView style={s.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <View style={s.header}>
          <RNText style={s.eyebrow}>MINHA CONTA</RNText>
          <RNText style={s.title}>Configurações</RNText>
        </View>

        <ScrollView contentContainerStyle={s.content} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
          {/* identidade editável (sem novo organism) */}
          <View style={s.identity}>
            <AvatarUpdated userAvatarID={user?.avatar} hideLabel />
            <RNText style={s.editHint}>Toque para editar a foto</RNText>
            <RNText style={s.name} numberOfLines={1}>{user?.first_name} {user?.last_name}</RNText>
            {!!user?.email && <RNText style={s.email} numberOfLines={1}>{user?.email}</RNText>}
            {!!user?.title && (
              <View style={s.badge}>
                <RNText style={s.badgeText}>{user.title}</RNText>
              </View>
            )}
          </View>

          {/* seção de edição do perfil */}
          <View>
            <RNText style={s.groupTitle}>PERFIL</RNText>
            <View style={{ gap: 12 }}>
              <Controller control={control} name="first_name" render={({ field: { onChange, onBlur, value } }) => (
                <GlassInput icon={<User size={20} color={SHEET.textMuted} />} placeholder="Primeiro nome" value={value} onChangeText={onChange} onBlur={onBlur} error={errors.first_name?.message} autoCapitalize="words" accessibilityLabel="Primeiro nome" />
              )} />
              <Controller control={control} name="last_name" render={({ field: { onChange, onBlur, value } }) => (
                <GlassInput icon={<User size={20} color={SHEET.textMuted} />} placeholder="Sobrenome" value={value} onChangeText={onChange} onBlur={onBlur} error={errors.last_name?.message} autoCapitalize="words" accessibilityLabel="Sobrenome" />
              )} />
              <Controller control={control} name="location" render={({ field: { onChange, onBlur, value } }) => (
                <GlassInput icon={<MapPin size={20} color={SHEET.textMuted} />} placeholder="Cidade, Estado" value={value} onChangeText={onChange} onBlur={onBlur} error={errors.location?.message} autoCapitalize="words" accessibilityLabel="Localização" />
              )} />
              <Controller control={control} name="description" render={({ field: { onChange, onBlur, value } }) => (
                <GlassInput icon={<FileText size={20} color={SHEET.textMuted} />} placeholder="Conte um pouco sobre você..." value={value} onChangeText={onChange} onBlur={onBlur} error={errors.description?.message} multiline numberOfLines={4} autoCapitalize="sentences" accessibilityLabel="Sobre você" />
              )} />
              <View style={{ gap: 8 }}>
                <RNText style={s.fieldLabel}>Gênero</RNText>
                <Controller control={control} name="gender" render={({ field: { onChange, value } }) => (
                  <SegmentedGender value={value} onChange={onChange} />
                )} />
                {!!errors.gender && <RNText style={s.errText}>{errors.gender.message}</RNText>}
              </View>
              <GradientButton label="Salvar alterações" onPress={handleSubmit(onSave)} loading={saving} style={{ marginTop: 6 }} />
            </View>
          </View>

          {/* único destino real de configuração */}
          <SheetGroup title="Preferências">
            <SheetRow icon={<Bell size={18} color={SHEET.gold} />} label="Notificações" description="Permissões e alertas" onPress={goNotif} />
          </SheetGroup>

          <RNText style={s.footer}>Tema, suporte e conta ficam em “Minha conta”, no avatar da home.</RNText>
          <View style={{ height: 16 }} />
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: SHEET.bg },
  flex: { flex: 1 },
  header: { paddingHorizontal: 16, paddingTop: 8, paddingBottom: 4 },
  eyebrow: { color: SHEET.textFaint, fontSize: 11, letterSpacing: 1.5, fontWeight: '600' },
  title: { color: SHEET.textPrimary, fontSize: 28, fontWeight: '800', marginTop: 4 },
  content: { paddingHorizontal: 16, paddingBottom: 32, gap: 20 },
  identity: { alignItems: 'center', paddingTop: 8 },
  editHint: { color: SHEET.textMuted, fontSize: 12.5, marginTop: 6 },
  name: { color: SHEET.textPrimary, fontSize: 20, fontWeight: '700', marginTop: 10 },
  email: { color: SHEET.textMuted, fontSize: 14, marginTop: 2 },
  badge: { marginTop: 10, paddingHorizontal: 12, paddingVertical: 6, borderRadius: 999, backgroundColor: SHEET.glass, borderWidth: 1, borderColor: SHEET.border },
  badgeText: { color: SHEET.gold, fontSize: 12.5, fontWeight: '600' },
  groupTitle: { color: SHEET.textMuted, fontSize: 13, fontWeight: '600', marginBottom: 10, marginLeft: 4 },
  fieldLabel: { color: SHEET.textSecondary, fontSize: 14, fontWeight: '600', marginLeft: 4 },
  errText: { color: '#FCA5A5', fontSize: 12, marginLeft: 4 },
  footer: { color: SHEET.textFaint, fontSize: 12.5, textAlign: 'center', lineHeight: 18 },
});
