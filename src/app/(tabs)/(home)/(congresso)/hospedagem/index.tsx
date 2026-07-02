import React, { useContext, useEffect, useState } from 'react';
import {
  View, Text as RNText, Pressable, ScrollView, TextInput,
  KeyboardAvoidingView, Platform, ActivityIndicator, StyleSheet,
} from 'react-native';
import { useForm, Controller } from 'react-hook-form';
import * as Yup from 'yup';
import { yupResolver } from '@hookform/resolvers/yup';
import { Stack, useRouter } from 'expo-router';
import { QrCode, BedDouble, Baby, Pill, Droplet, HeartPulse, Phone, ScrollText, ArrowLeft } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth } from '@/contexts/AuthContext';
import AlertContext from '@/contexts/AlertContext';
import { getItems, getItemSingleton, setCreateItem } from '@/services/items';
import { GradientButton } from '@/components/atoms/GradientButton';
import { formatCurrency } from '@/utils/directus';
import { SHEET } from '@/constants/sheetTokens';
import type { HospedagemTypes } from '@/types/HospedagemTypes';

const schema = Yup.object({
  accommodation: Yup.boolean().required('Você deve concordar com o termo').oneOf([true], 'Você deve concordar com o termo'),
  child_companion: Yup.boolean().required('O campo acompanhante é obrigatório'),
  take_medication: Yup.boolean().required('O campo medicamentos é obrigatório'),
  take_medication_description: Yup.string().optional(),
  blood_type: Yup.string().required('O campo Tipo sanguíneo é obrigatório'),
  blood_type_rh: Yup.string().required('O campo Fator RH é obrigatório'),
  allergies: Yup.boolean().required('O campo alergia é obrigatório'),
  allergies_description: Yup.string().optional(),
  emergency_contact: Yup.string().required('O campo contato de emergência é obrigatório'),
  normas_um: Yup.boolean().required('Você deve concordar com o termo').oneOf([true], 'Você deve concordar com o termo'),
  normas_dois: Yup.boolean().required('Você deve concordar com o termo').oneOf([true], 'Você deve concordar com o termo'),
  normas_tres: Yup.boolean().required('Você deve concordar com o termo').oneOf([true], 'Você deve concordar com o termo'),
  normas_quatro: Yup.boolean().required('Você deve concordar com o termo').oneOf([true], 'Você deve concordar com o termo'),
  normas_cinco: Yup.boolean().required('Você deve concordar com o termo').oneOf([true], 'Você deve concordar com o termo'),
  normas_seis: Yup.boolean().required('Você deve concordar com o termo').oneOf([true], 'Você deve concordar com o termo'),
  normas_sete: Yup.boolean().required('Você deve concordar com o termo').oneOf([true], 'Você deve concordar com o termo'),
  normas_oito: Yup.boolean().required('Você deve concordar com o termo').oneOf([true], 'Você deve concordar com o termo'),
  normas_nove: Yup.boolean().required('Você deve concordar com o termo').oneOf([true], 'Você deve concordar com o termo'),
  normas_dez: Yup.boolean().required('Você deve concordar com o termo').oneOf([true], 'Você deve concordar com o termo'),
  member: Yup.string().required(),
});
type FormData = Yup.InferType<typeof schema>;

const BLOOD_TYPES = [
  { value: 'a', label: 'A' },
  { value: 'b', label: 'B' },
  { value: 'ab', label: 'AB' },
  { value: 'o', label: 'O' },
  { value: 'nao_sabe', label: 'Não sei meu tipo sanguíneo' },
];
const BLOOD_RH = [
  { value: 'positivo', label: 'Positivo' },
  { value: 'negativo', label: 'Negativo' },
  { value: 'nao_sabe', label: 'Não sei meu fator Rh' },
];

const ACCOMMODATION_TEXT =
  'A Secretaria de Hospedagem estará disponibilizando espaços no Arena Hall, local de realização do Congresso, para os inscritos para a hospedagem. Será fornecido somente o colchonete; cada inscrito deverá levar sua roupa de cama, travesseiro e itens de higiene pessoal.';
const CHILD_TEXT =
  'Crianças de até 10 anos só podem se hospedar quando acompanhados por um dos pais ou representante legal. A criança menor de 10 anos é isenta do pagamento. Lembrando que os alojamentos são separados para meninos/varões e meninas/irmãs.';

const NORMAS: { name: keyof FormData; text: string }[] = [
  { name: 'normas_um', text: 'Direitos do inscrito: Colchonete para a hospedagem; A alimentação será café-da-manhã, almoço e jantar; A Pulseira de identificação que servirá como um passaporte para as refeições e alojamentos. Obs: como a hospedagem será no próprio Arena Hall, não teremos transporte incluso na hospedagem.' },
  { name: 'normas_dois', text: 'O primeiro objetivo da hospedagem é apoiar a Diretoria Geral da UNAADEB na realização da hospedagem para o Congresso Geral, oferecendo um local acessível aos congressistas que optarem por se hospedar no evento.' },
  { name: 'normas_tres', text: 'Como o Congresso é um local de reunião e adoração a Deus, esperamos de cada um atitude digna de cristão, observando os critérios disciplinares, evitando conversas apimentadas, gritarias, algazarras e todo comportamento que possa prejudicar o ambiente harmonioso.' },
  { name: 'normas_quatro', text: 'A distribuição dos inscritos nos respectivos alojamentos será por Setores da ADEB, desde que a inscrição seja realizada até a data limite; a partir desta data não serão aceitas novas inscrições por meio deste formulário. No início do Congresso, se ainda estiverem vagas, a Secretaria de Hospedagem irá disponibilizar vagas para novos inscritos, não sendo garantido que o inscrito fique junto com seu Setor.' },
  { name: 'normas_cinco', text: 'A troca de alojamentos não será autorizada, a não ser por motivo justificado à Secretaria de Hospedagem.' },
  { name: 'normas_seis', text: 'Os hóspedes devem zelar pela conservação dos alojamentos, mantendo sempre arrumados e limpos os quartos e banheiros dos locais de hospedagem.' },
  { name: 'normas_sete', text: 'Só será permitida a presença nos alojamentos de pessoas devidamente inscritas pela Secretaria de Hospedagem. Não será permitido o ingresso de meninos no alojamento das meninas e vice-versa.' },
  { name: 'normas_oito', text: 'O inscrito menor só poderá se ausentar dos locais programados com prévia autorização do responsável e informado à Secretaria de Hospedagem para controle.' },
  { name: 'normas_nove', text: 'Os inscritos deverão zelar pelos seus objetos de valor e/ou aparelhos eletrônicos, sendo os mesmos de responsabilidade única e exclusiva do seu dono, eximindo de qualquer responsabilidade a Secretaria de Hospedagem.' },
  { name: 'normas_dez', text: 'Concordo com as Regras e Normas Gerais. Estou ciente de que, se desrespeitar as Regras e Normas acima, poderei ter a minha permanência suspensa a qualquer momento; meus pais e/ou responsáveis poderão ter sua presença solicitada pela Secretaria de Hospedagem e o valor pago por mim não será restituído. Todos os assuntos omissos neste regulamento serão tratados pela Secretaria de Hospedagem.' },
];

// ---- Controles dark (SHEET) ----
const Toggle: React.FC<{ value?: boolean; onChange: (v: boolean) => void; labelTrue?: string; labelFalse?: string; error?: string }> = ({
  value, onChange, labelTrue = 'Concordo', labelFalse = 'Discordo', error,
}) => (
  <View>
    <View style={f.toggleRow}>
      <Pressable onPress={() => onChange(true)} style={[f.toggleOpt, value === true && f.toggleOptOn]}>
        <RNText style={[f.toggleText, value === true && f.toggleTextOn]}>{labelTrue}</RNText>
      </Pressable>
      <Pressable onPress={() => onChange(false)} style={[f.toggleOpt, value === false && f.toggleOptOff]}>
        <RNText style={[f.toggleText, value === false && f.toggleTextOff]}>{labelFalse}</RNText>
      </Pressable>
    </View>
    {!!error && <RNText style={f.error}>{error}</RNText>}
  </View>
);

const RadioGroup: React.FC<{ value?: string; onChange: (v: string) => void; options: { value: string; label: string }[]; error?: string }> = ({
  value, onChange, options, error,
}) => (
  <View style={{ gap: 8 }}>
    {options.map((o) => {
      const on = value === o.value;
      return (
        <Pressable key={o.value} onPress={() => onChange(o.value)} style={[f.radio, on && f.radioOn]}>
          <View style={[f.radioDot, on && f.radioDotOn]}>{on && <View style={f.radioDotInner} />}</View>
          <RNText style={[f.radioLabel, on && f.radioLabelOn]}>{o.label}</RNText>
        </Pressable>
      );
    })}
    {!!error && <RNText style={f.error}>{error}</RNText>}
  </View>
);

const Field: React.FC<{ value?: string; onChangeText: (v: string) => void; onBlur?: () => void; placeholder?: string; error?: string; multiline?: boolean }> = ({
  value, onChangeText, onBlur, placeholder, error, multiline,
}) => (
  <View>
    <TextInput
      style={[f.input, multiline && { height: 90, textAlignVertical: 'top', paddingTop: 12 }]}
      value={value}
      onChangeText={onChangeText}
      onBlur={onBlur}
      placeholder={placeholder}
      placeholderTextColor={SHEET.textFaint}
      multiline={multiline}
    />
    {!!error && <RNText style={f.error}>{error}</RNText>}
  </View>
);

const SectionCard: React.FC<{ Icon?: any; title: string; children: React.ReactNode }> = ({ Icon, title, children }) => (
  <View style={f.card}>
    <View style={f.cardHead}>
      {Icon && <View style={f.cardIcon}><Icon size={17} color={SHEET.brand} /></View>}
      <RNText style={f.cardTitle}>{title}</RNText>
    </View>
    {children}
  </View>
);

const RegistrationFormHospedagem = React.memo(() => {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  const alert = useContext(AlertContext);

  const [hos, setHos] = useState<HospedagemTypes>();
  const [loading, setLoading] = useState(true);

  const { control, handleSubmit, watch, setValue, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: yupResolver(schema) as any,
    defaultValues: {
      member: user?.id,
      accommodation: false,
      take_medication: false,
      child_companion: false,
      allergies: false,
    },
    mode: 'all',
  });

  useEffect(() => { if (user?.id) setValue('member', user.id); }, [user?.id, setValue]);

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const data = await getItemSingleton<HospedagemTypes>('hospedagem');
        if (alive) setHos(data);
      } catch {
        alert.error('Houve um erro ao carregar os dados. Tente novamente mais tarde.', 8000);
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => { alive = false; };
  }, [alert]);

  const takeMedication = watch('take_medication');
  const allergies = watch('allergies');

  const onSubmit = async (data: FormData) => {
    try {
      const existing = await getItems<any[]>('subscribed_hos', { filter: { member: { _eq: user?.id } } });
      if (existing && existing.length > 0) {
        alert.warning('Já existe uma inscrição de hospedagem para este usuário.', 8000);
        router.replace('/(tabs)/(home)/(congresso)/cartao-acesso');
        return;
      }
      const res = await setCreateItem('subscribed_hos', { ...data, member: user?.id });
      if (res) {
        alert.success('Inscrição realizada com sucesso!');
        router.replace('/(tabs)/(home)/(congresso)/cartao-acesso');
      }
    } catch {
      alert.error('Erro no processo de inscrição da hospedagem.');
    }
  };

  const onInvalid = () => alert.error('Existem campos obrigatórios que faltam ser preenchidos.');

  return (
    <View style={f.screen}>
      <Stack.Screen options={{ headerShown: false }} />
      <View style={[f.bar, { paddingTop: insets.top + 6 }]} pointerEvents="box-none">
        <Pressable onPress={() => router.back()} hitSlop={8} style={f.pill} accessibilityRole="button" accessibilityLabel="Voltar">
          <ArrowLeft size={21} color={SHEET.textPrimary} strokeWidth={2.5} />
        </Pressable>
        <RNText style={f.barTitle}>Hospedagem</RNText>
        <View style={{ width: 40 }} />
      </View>

      {loading ? (
        <View style={f.centered}><ActivityIndicator size="large" color={SHEET.brand} /><RNText style={f.loadingText}>Carregando...</RNText></View>
      ) : (
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
          <ScrollView
            contentContainerStyle={[f.scroll, { paddingTop: insets.top + 60, paddingBottom: insets.bottom + 100 }]}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            {/* Cabeçalho */}
            <RNText style={f.hello}>Solicitante, {user?.first_name || ''}</RNText>
            <View style={f.investRow}>
              <RNText style={f.investLabel}>Investimento</RNText>
              <RNText style={f.investValue}>{hos?.custo != null ? formatCurrency(hos.custo) : 'A definir'}</RNText>
            </View>

            <View style={f.pixNote}>
              <QrCode size={18} color={SHEET.gold} />
              <RNText style={f.pixNoteText}>No momento o método de pagamento é o PIX identificado. Estamos trabalhando para oferecer outros meios.</RNText>
            </View>

            {!!hos?.regras && <RNText style={f.intro}>{hos.regras}</RNText>}

            {/* Alojamento */}
            <SectionCard Icon={BedDouble} title="Alojamento">
              <RNText style={f.para}>{ACCOMMODATION_TEXT}</RNText>
              <Controller control={control} name="accommodation" render={({ field: { onChange, value } }) => (
                <Toggle value={value} onChange={onChange} error={errors.accommodation?.message} />
              )} />
            </SectionCard>

            {/* Hospedagem de crianças */}
            <SectionCard Icon={Baby} title="Hospedagem de crianças">
              <RNText style={f.para}>{CHILD_TEXT}</RNText>
              <Controller control={control} name="child_companion" render={({ field: { onChange, value } }) => (
                <Toggle value={value} onChange={onChange} labelTrue="Com acompanhante" labelFalse="Sem acompanhante" error={errors.child_companion?.message} />
              )} />
            </SectionCard>

            {/* Medicamentos */}
            <SectionCard Icon={Pill} title="Uso de medicamentos / cuidados médicos">
              <Controller control={control} name="take_medication" render={({ field: { onChange, value } }) => (
                <Toggle value={value} onChange={onChange} labelTrue="Sim" labelFalse="Não" error={errors.take_medication?.message} />
              )} />
              {takeMedication === true && (
                <View style={{ marginTop: 12 }}>
                  <Controller control={control} name="take_medication_description" render={({ field: { onChange, value, onBlur } }) => (
                    <Field value={value} onChangeText={onChange} onBlur={onBlur} multiline placeholder="Especifique o uso de medicamentos e os cuidados médicos necessários" error={errors.take_medication_description?.message} />
                  )} />
                </View>
              )}
            </SectionCard>

            {/* Tipo sanguíneo */}
            <SectionCard Icon={Droplet} title="Tipo sanguíneo">
              <Controller control={control} name="blood_type" render={({ field: { onChange, value } }) => (
                <RadioGroup value={value} onChange={onChange} options={BLOOD_TYPES} error={errors.blood_type?.message} />
              )} />
            </SectionCard>

            {/* Fator Rh */}
            <SectionCard Icon={Droplet} title="Fator Rh">
              <Controller control={control} name="blood_type_rh" render={({ field: { onChange, value } }) => (
                <RadioGroup value={value} onChange={onChange} options={BLOOD_RH} error={errors.blood_type_rh?.message} />
              )} />
            </SectionCard>

            {/* Alergia */}
            <SectionCard Icon={HeartPulse} title="Possui alergia?">
              <Controller control={control} name="allergies" render={({ field: { onChange, value } }) => (
                <Toggle value={value} onChange={onChange} labelTrue="Sim" labelFalse="Não" error={errors.allergies?.message} />
              )} />
              {allergies === true && (
                <View style={{ marginTop: 12 }}>
                  <Controller control={control} name="allergies_description" render={({ field: { onChange, value } }) => (
                    <Field value={value} onChangeText={onChange} placeholder="Especifique qual alergia" error={errors.allergies_description?.message} />
                  )} />
                </View>
              )}
            </SectionCard>

            {/* Contato de emergência */}
            <SectionCard Icon={Phone} title="Contato de emergência">
              <RNText style={f.para}>Em caso de acidente ou mal súbito, ligar para:</RNText>
              <Controller control={control} name="emergency_contact" render={({ field: { onChange, value } }) => (
                <Field value={value} onChangeText={onChange} placeholder="Ex: José, (61) 99994-9449" error={errors.emergency_contact?.message} />
              )} />
            </SectionCard>

            {/* Normas gerais */}
            <SectionCard Icon={ScrollText} title="Orientações, regras e normas gerais">
              <View style={{ gap: 16 }}>
                {NORMAS.map((n) => (
                  <View key={n.name} style={f.consentItem}>
                    <RNText style={f.para}>{n.text}</RNText>
                    <Controller control={control} name={n.name as any} render={({ field: { onChange, value } }) => (
                      <Toggle value={value as boolean | undefined} onChange={onChange} error={(errors as any)[n.name]?.message} />
                    )} />
                  </View>
                ))}
              </View>
            </SectionCard>
          </ScrollView>

          {/* Rodapé fixo */}
          <View style={[f.footer, { paddingBottom: insets.bottom + 10 }]}>
            <GradientButton
              label={isSubmitting ? 'Cadastrando...' : 'Inscrever-se agora'}
              loading={isSubmitting}
              onPress={handleSubmit(onSubmit, onInvalid)}
            />
          </View>
        </KeyboardAvoidingView>
      )}
    </View>
  );
});

RegistrationFormHospedagem.displayName = 'RegistrationFormHospedagem';

export default RegistrationFormHospedagem;

const PILL_BG = 'rgba(10,12,20,0.58)';
const PILL_BORDER = 'rgba(255,255,255,0.22)';

const f = StyleSheet.create({
  screen: { flex: 1, backgroundColor: SHEET.bg },
  bar: {
    position: 'absolute', top: 0, left: 0, right: 0, zIndex: 20,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 16, paddingBottom: 6,
  },
  barTitle: { color: SHEET.textPrimary, fontSize: 16, fontWeight: '800' },
  pill: {
    width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center',
    backgroundColor: PILL_BG, borderWidth: StyleSheet.hairlineWidth, borderColor: PILL_BORDER,
  },
  centered: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  loadingText: { color: SHEET.textMuted, fontSize: 14, marginTop: 12 },

  scroll: { paddingHorizontal: 16, gap: 14 },
  hello: { color: SHEET.textPrimary, fontSize: 22, fontWeight: '800' },
  investRow: { flexDirection: 'row', alignItems: 'baseline', justifyContent: 'space-between', marginTop: -6 },
  investLabel: { color: SHEET.textMuted, fontSize: 13 },
  investValue: { color: SHEET.brand, fontSize: 18, fontWeight: '800' },

  pixNote: {
    flexDirection: 'row', alignItems: 'center', gap: 10, padding: 12, borderRadius: 14,
    backgroundColor: 'rgba(255,215,0,0.08)', borderWidth: 1, borderColor: 'rgba(255,215,0,0.28)',
  },
  pixNoteText: { color: SHEET.textSecondary, fontSize: 12.5, flex: 1, lineHeight: 17 },
  intro: { color: SHEET.textSecondary, fontSize: 14, lineHeight: 21 },

  card: { borderRadius: 18, backgroundColor: SHEET.glass, borderWidth: 1, borderColor: SHEET.border, padding: 16 },
  cardHead: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 12 },
  cardIcon: { width: 34, height: 34, borderRadius: 10, alignItems: 'center', justifyContent: 'center', backgroundColor: SHEET.brandTint },
  cardTitle: { color: SHEET.textPrimary, fontSize: 15.5, fontWeight: '800', flex: 1 },
  para: { color: SHEET.textSecondary, fontSize: 13.5, lineHeight: 20, marginBottom: 12 },

  consentItem: { paddingBottom: 16, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: SHEET.hairline },

  toggleRow: { flexDirection: 'row', gap: 10 },
  toggleOpt: { flex: 1, height: 44, borderRadius: 12, alignItems: 'center', justifyContent: 'center', backgroundColor: SHEET.surface, borderWidth: 1, borderColor: SHEET.border },
  toggleOptOn: { backgroundColor: SHEET.brandTint, borderColor: SHEET.brand },
  toggleOptOff: { backgroundColor: 'rgba(148,163,184,0.12)', borderColor: SHEET.textFaint },
  toggleText: { color: SHEET.textMuted, fontSize: 14, fontWeight: '700' },
  toggleTextOn: { color: SHEET.brand },
  toggleTextOff: { color: SHEET.textSecondary },

  radio: { flexDirection: 'row', alignItems: 'center', gap: 12, height: 48, paddingHorizontal: 14, borderRadius: 12, backgroundColor: SHEET.surface, borderWidth: 1, borderColor: SHEET.border },
  radioOn: { backgroundColor: SHEET.brandTint, borderColor: SHEET.brand },
  radioDot: { width: 20, height: 20, borderRadius: 10, borderWidth: 2, borderColor: SHEET.textFaint, alignItems: 'center', justifyContent: 'center' },
  radioDotOn: { borderColor: SHEET.brand },
  radioDotInner: { width: 10, height: 10, borderRadius: 5, backgroundColor: SHEET.brand },
  radioLabel: { color: SHEET.textSecondary, fontSize: 14.5, fontWeight: '600', flex: 1 },
  radioLabelOn: { color: SHEET.textPrimary },

  input: {
    minHeight: 48, borderRadius: 12, paddingHorizontal: 14, color: SHEET.textPrimary, fontSize: 14.5,
    backgroundColor: SHEET.surface, borderWidth: 1, borderColor: SHEET.border,
  },
  error: { color: SHEET.danger, fontSize: 12.5, marginTop: 6, fontWeight: '600' },

  footer: {
    position: 'absolute', left: 0, right: 0, bottom: 0, paddingHorizontal: 16, paddingTop: 10,
    backgroundColor: 'rgba(13,15,23,0.92)', borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: SHEET.border,
  },
});
