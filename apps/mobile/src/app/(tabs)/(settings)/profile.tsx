import React, { useContext, useState, useCallback, useMemo, useRef } from 'react';
import {
  View,
  Text as RNText,
  TextInput,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ActivityIndicator,
  StyleSheet,
} from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import * as Yup from 'yup';
import { Controller, useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { ShieldCheck, ChevronLeft, Instagram, Linkedin, Music2, MessageCircle } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import AvatarUpdated from '@/components/AvatarUpdated';
import { CoverUpload } from '@/components/molecules/CoverUpload';
import { SectorSelect } from '@/components/molecules/SectorSelect';
import { useSectors } from '@/hooks/useSectors';
import { SHEET } from '@/constants/sheetTokens';
import { updateUserMe } from '@/services/user';
import authContext from '@/contexts/AuthContext';
import AlertContext from '@/contexts/AlertContext';
import { handleErrors } from '@/utils/directus';

// Limite da bio (profiles.description) — curto o suficiente para caber no card do perfil.
const BIO_MAX_LENGTH = 160;
// Altura da capa "sangrando" no topo (inclui a área sob a status bar).
const COVER_H = 200;

// E-mail NÃO é editável aqui (trocar o login exige supabase.auth.updateUser + confirmação).
// Gênero usa 'M'/'F' — o mesmo vocabulário que o cadastro grava em profiles.gender.
const schema = Yup.object({
  first_name: Yup.string().trim().min(2, 'Mínimo de 2 caracteres').required('Informe seu nome'),
  last_name: Yup.string().trim().min(2, 'Mínimo de 2 caracteres').required('Informe seu sobrenome'),
  location: Yup.string().trim().min(2, 'Informe sua localização').required('Informe sua localização'),
  description: Yup.string().trim().max(BIO_MAX_LENGTH, `Máximo de ${BIO_MAX_LENGTH} caracteres`).notRequired(),
  gender: Yup.string().oneOf(['M', 'F']).notRequired(),
  instagram: Yup.string().trim().max(60).notRequired(),
  linkedin: Yup.string().trim().max(120).notRequired(),
  tiktok: Yup.string().trim().max(60).notRequired(),
  whatsapp: Yup.string().trim().max(30).notRequired(),
});
type FormData = Yup.InferType<typeof schema>;

// Normalizações: handles sem '@'; whatsapp só dígitos/+; string vazia vira null (limpa a coluna).
const stripHandle = (v?: string | null) => (v ?? '').replace(/^@+/, '').trim() || null;
const stripPhone = (v?: string | null) => (v ?? '').replace(/[^\d+]/g, '') || null;
const orNull = (v?: string | null) => (v ?? '').trim() || null;

/**
 * Linha inline estilo Instagram: rótulo fixo à esquerda + campo à direita,
 * separado por um hairline. Sem caixas/bordas/ícones por campo — visual plano.
 */
const FieldRow: React.FC<{ label: string; icon?: React.ReactNode; error?: string; top?: boolean; children: React.ReactNode }> = ({
  label,
  icon,
  error,
  top,
  children,
}) => (
  <View>
    <View style={[s.row, top && s.rowTop]}>
      <View style={s.rowLabelWrap}>
        {icon}
        <RNText style={s.rowLabel}>{label}</RNText>
      </View>
      <View style={s.rowField}>{children}</View>
    </View>
    {!!error && <RNText style={s.errText}>{error}</RNText>}
    <View style={s.separator} />
  </View>
);

export default function ProfileScreen() {
  const alert = useContext(AlertContext);
  const { user, setUser } = useContext(authContext);
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [saving, setSaving] = useState(false);
  // Abridor do seletor de foto exposto pelo AvatarUpdated (p/ o rótulo externo acionar).
  const openPhotoPicker = useRef<() => void>(() => {});

  // Setor é UUID em profiles.sector; o SectorSelect trabalha com o TÍTULO. Guardamos o id
  // localmente e mapeamos id↔título pela lista de setores (cacheada em módulo).
  const { sectors } = useSectors(true);
  const [sectorId, setSectorId] = useState<string | undefined>(user?.sector || undefined);
  const sectorTitle = useMemo(
    () => sectors.find((sec) => sec.id === sectorId)?.title ?? '',
    [sectors, sectorId],
  );
  const onChangeSector = useCallback(
    (title: string) => {
      const found = sectors.find((sec) => sec.title === title);
      if (found) setSectorId(found.id);
    },
    [sectors],
  );

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
      instagram: user?.instagram ?? '',
      linkedin: user?.linkedin ?? '',
      tiktok: user?.tiktok ?? '',
      whatsapp: user?.whatsapp ?? '',
    },
  });

  const onSave = useCallback(async (d: FormData) => {
    setSaving(true);
    try {
      // NÃO enviar `title`: essa coluna guarda o CARGO/liderança (Coordenador, Pastor…),
      // definido no cadastro/admin. Não há campo de título aqui — sobrescrevê-lo apagaria o
      // cargo do usuário. Idem `gender`: só envia quando de fato definido (não trava legados).
      const updated = await updateUserMe({
        first_name: d.first_name,
        last_name: d.last_name,
        location: d.location,
        description: orNull(d.description),
        ...(d.gender ? { gender: d.gender } : {}),
        ...(sectorId ? { sector: sectorId } : {}),
        instagram: stripHandle(d.instagram),
        linkedin: orNull(d.linkedin),
        tiktok: stripHandle(d.tiktok),
        whatsapp: stripPhone(d.whatsapp),
      });
      await setUser(updated);
      alert.success('Perfil atualizado com sucesso');
    } catch (e: any) {
      alert.error(`Erro ao atualizar: ${handleErrors(e)}`);
    } finally {
      setSaving(false);
    }
  }, [sectorId, setUser, alert]);

  const submit = handleSubmit(onSave);

  return (
    <View style={s.screen}>
      <Stack.Screen options={{ headerShown: false }} />
      <StatusBar style="light" />

      <KeyboardAvoidingView style={s.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView
          contentContainerStyle={s.content}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* HERO — capa full-bleed (sobrepõe a status bar) + scrim p/ legibilidade */}
          <View style={{ height: COVER_H }}>
            <CoverUpload coverImageId={user?.cover_image} fullBleed height={COVER_H} />
            <LinearGradient
              pointerEvents="none"
              colors={['rgba(0,0,0,0.5)', 'transparent', 'rgba(0,0,0,0.28)']}
              locations={[0, 0.45, 1]}
              style={StyleSheet.absoluteFill}
            />
          </View>

          {/* IDENTIDADE — avatar sobreposto + link da foto + título/e-mail */}
          <View style={s.identity}>
            <AvatarUpdated
              userAvatarID={user?.avatar}
              hideLabel
              registerOpen={(fn) => { openPhotoPicker.current = fn; }}
            />
            <Pressable
              onPress={() => openPhotoPicker.current?.()}
              hitSlop={8}
              accessibilityRole="button"
              accessibilityLabel="Editar foto ou avatar"
            >
              <RNText style={s.photoLink}>Editar foto ou avatar</RNText>
            </Pressable>
            {!!user?.title && (
              <View style={s.titleBadge}>
                <ShieldCheck size={12} color={SHEET.gold} />
                <RNText style={s.titleBadgeText}>{user.title}</RNText>
              </View>
            )}
            {!!user?.email && <RNText style={s.email} numberOfLines={1}>{user.email}</RNText>}
          </View>

          {/* Campos inline (estilo "Editar perfil") */}
          <View style={s.rows}>
            <Controller control={control} name="first_name" render={({ field: { onChange, onBlur, value } }) => (
              <FieldRow label="Nome" error={errors.first_name?.message}>
                <TextInput
                  style={s.input}
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  placeholder="Seu nome"
                  placeholderTextColor={SHEET.textFaint}
                  autoCapitalize="words"
                  accessibilityLabel="Nome"
                />
              </FieldRow>
            )} />

            <Controller control={control} name="last_name" render={({ field: { onChange, onBlur, value } }) => (
              <FieldRow label="Sobrenome" error={errors.last_name?.message}>
                <TextInput
                  style={s.input}
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  placeholder="Seu sobrenome"
                  placeholderTextColor={SHEET.textFaint}
                  autoCapitalize="words"
                  accessibilityLabel="Sobrenome"
                />
              </FieldRow>
            )} />

            <Controller control={control} name="location" render={({ field: { onChange, onBlur, value } }) => (
              <FieldRow label="Localização" error={errors.location?.message}>
                <TextInput
                  style={s.input}
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  placeholder="Cidade, Estado"
                  placeholderTextColor={SHEET.textFaint}
                  autoCapitalize="words"
                  accessibilityLabel="Localização"
                />
              </FieldRow>
            )} />

            {/* Setor — seletor em bottom sheet; mapeia título↔id internamente */}
            <View style={s.sectorField}>
              <SectorSelect value={sectorTitle} onChange={onChangeSector} label="Setor" />
            </View>

            <Controller control={control} name="description" render={({ field: { onChange, onBlur, value } }) => (
              <FieldRow label="Bio" error={errors.description?.message} top>
                <TextInput
                  style={[s.input, s.bioInput]}
                  value={value ?? ''}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  placeholder="Conte um pouco sobre você..."
                  placeholderTextColor={SHEET.textFaint}
                  multiline
                  numberOfLines={4}
                  maxLength={BIO_MAX_LENGTH}
                  textAlignVertical="top"
                  autoCapitalize="sentences"
                  accessibilityLabel="Bio"
                />
                <RNText style={s.counter}>{(value?.length ?? 0)}/{BIO_MAX_LENGTH}</RNText>
              </FieldRow>
            )} />

            <Controller control={control} name="gender" render={({ field: { onChange, value } }) => (
              <FieldRow label="Gênero" error={errors.gender?.message}>
                <Pressable
                  onPress={() => { Haptics.selectionAsync(); onChange(value === 'M' ? 'F' : 'M'); }}
                  hitSlop={8}
                  accessibilityRole="button"
                  accessibilityLabel="Alternar gênero"
                  style={s.genderPress}
                >
                  <RNText style={[s.genderValue, !value && s.genderPlaceholder]}>
                    {value === 'F' ? 'Feminino' : value === 'M' ? 'Masculino' : 'Selecionar'}
                  </RNText>
                </Pressable>
              </FieldRow>
            )} />
          </View>

          {/* REDES SOCIAIS — handles; a visibilidade (o que exibir) fica em Ajustes */}
          <RNText style={s.sectionTitle}>REDES SOCIAIS</RNText>
          <RNText style={s.sectionHint}>
            Cadastre seus perfis. Você escolhe quais exibir em Ajustes › Redes sociais.
          </RNText>
          <View style={s.rows}>
            <Controller control={control} name="instagram" render={({ field: { onChange, onBlur, value } }) => (
              <FieldRow label="Instagram" icon={<Instagram size={16} color={SHEET.textMuted} />} error={errors.instagram?.message}>
                <TextInput
                  style={s.input}
                  value={value ?? ''}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  placeholder="@seu_usuario"
                  placeholderTextColor={SHEET.textFaint}
                  autoCapitalize="none"
                  autoCorrect={false}
                  accessibilityLabel="Instagram"
                />
              </FieldRow>
            )} />

            <Controller control={control} name="linkedin" render={({ field: { onChange, onBlur, value } }) => (
              <FieldRow label="LinkedIn" icon={<Linkedin size={16} color={SHEET.textMuted} />} error={errors.linkedin?.message}>
                <TextInput
                  style={s.input}
                  value={value ?? ''}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  placeholder="URL ou usuário"
                  placeholderTextColor={SHEET.textFaint}
                  autoCapitalize="none"
                  autoCorrect={false}
                  keyboardType="url"
                  accessibilityLabel="LinkedIn"
                />
              </FieldRow>
            )} />

            <Controller control={control} name="tiktok" render={({ field: { onChange, onBlur, value } }) => (
              <FieldRow label="TikTok" icon={<Music2 size={16} color={SHEET.textMuted} />} error={errors.tiktok?.message}>
                <TextInput
                  style={s.input}
                  value={value ?? ''}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  placeholder="@seu_usuario"
                  placeholderTextColor={SHEET.textFaint}
                  autoCapitalize="none"
                  autoCorrect={false}
                  accessibilityLabel="TikTok"
                />
              </FieldRow>
            )} />

            <Controller control={control} name="whatsapp" render={({ field: { onChange, onBlur, value } }) => (
              <FieldRow label="WhatsApp" icon={<MessageCircle size={16} color={SHEET.textMuted} />} error={errors.whatsapp?.message}>
                <TextInput
                  style={s.input}
                  value={value ?? ''}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  placeholder="(00) 00000-0000"
                  placeholderTextColor={SHEET.textFaint}
                  keyboardType="phone-pad"
                  accessibilityLabel="WhatsApp"
                />
              </FieldRow>
            )} />
          </View>

          <View style={{ height: 24 }} />
        </ScrollView>
      </KeyboardAvoidingView>

      {/* HEADER OVERLAY FIXO — voltar + salvar por cima da capa (pills sólidos p/ legibilidade).
          Scrim no topo garante contraste dos pills quando o conteúdo rola por baixo. */}
      <LinearGradient
        pointerEvents="none"
        colors={['rgba(0,0,0,0.55)', 'transparent']}
        style={[s.headerScrim, { height: insets.top + 60 }]}
      />
      <View style={[s.overlayHeader, { paddingTop: insets.top + 6 }]}>
        <Pressable
          onPress={() => router.back()}
          hitSlop={10}
          accessibilityRole="button"
          accessibilityLabel="Voltar"
          style={s.circleBtn}
        >
          <ChevronLeft size={24} color={SHEET.textPrimary} />
        </Pressable>
        <Pressable
          onPress={() => submit()}
          disabled={saving}
          hitSlop={10}
          accessibilityRole="button"
          accessibilityLabel="Salvar alterações"
          style={[s.savePill, saving && { opacity: 0.7 }]}
        >
          {saving ? (
            <ActivityIndicator size="small" color="#FFFFFF" />
          ) : (
            <RNText style={s.savePillText}>Salvar</RNText>
          )}
        </Pressable>
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  screen: { flex: 1, backgroundColor: SHEET.bg },
  flex: { flex: 1 },
  content: { paddingBottom: 32 },

  // header overlay (flutua acima do scroll, sempre visível)
  headerScrim: { position: 'absolute', top: 0, left: 0, right: 0 },
  overlayHeader: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    paddingBottom: 6,
  },
  circleBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: SHEET.border,
  },
  savePill: {
    minWidth: 76,
    height: 40,
    paddingHorizontal: 16,
    borderRadius: 999,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: SHEET.brand,
  },
  savePillText: { color: '#FFFFFF', fontSize: 15, fontWeight: '700' },

  // identidade
  identity: { alignItems: 'center', marginTop: -48, paddingHorizontal: 16 },
  photoLink: { color: SHEET.brand, fontSize: 14.5, fontWeight: '600', marginTop: 10 },
  titleBadge: { flexDirection: 'row', alignItems: 'center', gap: 5, marginTop: 10, paddingHorizontal: 10, paddingVertical: 5, borderRadius: 999, backgroundColor: SHEET.glass, borderWidth: 1, borderColor: SHEET.border },
  titleBadgeText: { color: SHEET.gold, fontSize: 12, fontWeight: '700' },
  email: { color: SHEET.textFaint, fontSize: 13, marginTop: 6 },

  // seções
  sectionTitle: { color: SHEET.textFaint, fontSize: 11, letterSpacing: 1.5, fontWeight: '700', marginTop: 24, marginBottom: 4, paddingHorizontal: 16 },
  sectionHint: { color: SHEET.textMuted, fontSize: 12.5, paddingHorizontal: 16, marginBottom: 4 },

  // linhas
  rows: { marginTop: 12, paddingHorizontal: 16 },
  row: { flexDirection: 'row', alignItems: 'center', paddingVertical: 14 },
  rowTop: { alignItems: 'flex-start' },
  rowLabelWrap: { width: 116, flexDirection: 'row', alignItems: 'center', gap: 7 },
  rowLabel: { color: SHEET.textSecondary, fontSize: 15 },
  rowField: { flex: 1 },
  input: { color: SHEET.textPrimary, fontSize: 16, padding: 0, margin: 0 },
  bioInput: { minHeight: 76 },
  counter: { color: SHEET.textFaint, fontSize: 11, textAlign: 'right', marginTop: 6 },
  separator: { height: StyleSheet.hairlineWidth, backgroundColor: SHEET.border },

  // setor
  sectorField: { paddingVertical: 12 },

  // gênero (valor tocável que alterna M↔F)
  genderPress: { alignSelf: 'flex-start' },
  genderValue: { color: SHEET.textPrimary, fontSize: 16 },
  genderPlaceholder: { color: SHEET.textFaint },

  // erros
  errText: { color: '#FCA5A5', fontSize: 12, marginLeft: 116, marginBottom: 8 },
});
