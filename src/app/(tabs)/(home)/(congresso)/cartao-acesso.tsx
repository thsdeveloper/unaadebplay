import React, { useCallback, useContext, useEffect, useState } from 'react';
import { View, Text as RNText, Pressable, ScrollView, ActivityIndicator, Linking, StyleSheet } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { Image as ExpoImage } from 'expo-image';
import * as Clipboard from 'expo-clipboard';
import axios from 'axios';
import {
  ArrowLeft, QrCode, Copy, ExternalLink, CheckCircle2, Clock, Ticket, BedDouble, RefreshCw,
} from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import AlertContext from '@/contexts/AlertContext';
import { useAuth } from '@/contexts/AuthContext';
import { getItems, getItemSingleton, setUpdateItem } from '@/services/items';
import { formatCurrency } from '@/utils/directus';
import { SHEET } from '@/constants/sheetTokens';
import type { HospedagemTypes } from '@/types/HospedagemTypes';

const PAYMENT_ENDPOINT = 'https://back-unaadeb.onrender.com/mercado-pago/pagamento';

const CartaoAcesso = React.memo(() => {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const alert = useContext(AlertContext);
  const { user } = useAuth();

  const [loading, setLoading] = useState(true);
  const [paying, setPaying] = useState(false);
  const [hospedagem, setHospedagem] = useState<HospedagemTypes>();
  const [subscribed, setSubscribed] = useState<any[]>();
  const [payment, setPayment] = useState<any>();

  const load = useCallback(async () => {
    if (!user?.id) return;
    try {
      const [hos, subs] = await Promise.all([
        getItemSingleton<HospedagemTypes>('hospedagem'),
        getItems<any[]>('subscribed_hos', { filter: { member: { _eq: user.id } } }),
      ]);
      setHospedagem(hos);
      setSubscribed(subs);
      if (subs?.length && subs[0].payment) setPayment(subs[0].payment);
    } catch {
      alert.error('Houve um erro ao carregar os dados. Tente novamente mais tarde.', 8000);
    } finally {
      setLoading(false);
    }
  }, [user?.id, alert]);

  useEffect(() => { load(); }, [load]);

  const pagar = useCallback(async () => {
    if (!hospedagem || !subscribed?.length) return;
    setPaying(true);
    try {
      const { data } = await axios.post(PAYMENT_ENDPOINT, {
        transaction_amount: Number(hospedagem.custo),
        description: 'Inscrição de acesso — Hospedagem',
        payment_method_id: 'pix',
        email: user?.email,
      });
      setPayment(data);
      await setUpdateItem('subscribed_hos', subscribed[0].id, { payment: data, payment_id: String(data?.id ?? ''), payment_status: data?.status ?? 'pending' });
      alert.success('Pagamento PIX gerado! Escaneie o QR code para concluir.');
    } catch (e) {
      alert.error('Erro ao gerar o pagamento. Tente novamente.');
    } finally {
      setPaying(false);
    }
  }, [hospedagem, subscribed, user?.email, alert]);

  const copyPix = useCallback(async () => {
    const code = payment?.point_of_interaction?.transaction_data?.qr_code;
    if (!code) return;
    await Clipboard.setStringAsync(code);
    alert.success('Código PIX copiado!');
  }, [payment, alert]);

  const openTicket = useCallback(async () => {
    const url = payment?.point_of_interaction?.transaction_data?.ticket_url;
    if (!url) return;
    const can = await Linking.canOpenURL(url);
    if (can) Linking.openURL(url); else alert.error('Não foi possível abrir o link.');
  }, [payment, alert]);

  const header = (
    <View style={[h.bar, { paddingTop: insets.top + 6 }]} pointerEvents="box-none">
      <Pressable onPress={() => router.back()} hitSlop={8} style={h.pill} accessibilityRole="button" accessibilityLabel="Voltar">
        <ArrowLeft size={21} color={SHEET.textPrimary} strokeWidth={2.5} />
      </Pressable>
    </View>
  );

  const qrBase64 = payment?.point_of_interaction?.transaction_data?.qr_code_base64;
  const amount = payment?.transaction_amount;
  const expiration = payment?.date_of_expiration ? new Date(payment.date_of_expiration) : null;
  const comodidades: string[] = Array.isArray(hospedagem?.comodidades) ? (hospedagem!.comodidades as any) : [];

  return (
    <View style={s.screen}>
      <Stack.Screen options={{ headerShown: false }} />
      {header}

      {loading ? (
        <View style={s.centered}>
          <ActivityIndicator size="large" color={SHEET.brand} />
          <RNText style={s.loadingText}>Carregando...</RNText>
        </View>
      ) : (
        <ScrollView contentContainerStyle={[s.scroll, { paddingTop: insets.top + 64 }]} showsVerticalScrollIndicator={false}>
          {/* CARTÃO DE ACESSO */}
          <View style={s.accessCard}>
            <View style={s.accessTop}>
              <View style={s.accessIcon}><Ticket size={20} color="#fff" /></View>
              <View style={{ flex: 1 }}>
                <RNText style={s.accessLabel}>CARTÃO DE ACESSO · HOSPEDAGEM</RNText>
                <RNText style={s.accessName} numberOfLines={1}>{user?.first_name || 'Congressista'}</RNText>
              </View>
            </View>
            <View style={s.accessStatusRow}>
              {payment ? (
                <View style={[s.statusPill, { backgroundColor: 'rgba(251,191,36,0.14)', borderColor: '#FBBF24' }]}>
                  <Clock size={13} color="#FBBF24" />
                  <RNText style={[s.statusText, { color: '#FBBF24' }]}>Aguardando pagamento</RNText>
                </View>
              ) : (
                <View style={[s.statusPill, { backgroundColor: SHEET.brandTint, borderColor: SHEET.brand }]}>
                  <BedDouble size={13} color={SHEET.brand} />
                  <RNText style={[s.statusText, { color: SHEET.brand }]}>Pagamento pendente</RNText>
                </View>
              )}
            </View>
          </View>

          {!payment ? (
            /* SEM PAGAMENTO — resumo + gerar PIX */
            <View style={{ gap: 14, marginTop: 16 }}>
              {!!hospedagem?.titulo && (
                <View style={s.card}>
                  <RNText style={s.cardTitle}>{hospedagem.titulo}</RNText>
                  {!!hospedagem?.descricao && <RNText style={s.cardBody}>{hospedagem.descricao}</RNText>}
                </View>
              )}

              {comodidades.length > 0 && (
                <View style={s.card}>
                  <RNText style={s.sectionTitle}>Comodidades</RNText>
                  <View style={{ marginTop: 8, gap: 8 }}>
                    {comodidades.map((c, i) => (
                      <View key={i} style={s.bulletRow}>
                        <CheckCircle2 size={16} color={SHEET.brand} />
                        <RNText style={s.bulletText}>{c}</RNText>
                      </View>
                    ))}
                  </View>
                </View>
              )}

              {!!hospedagem?.regras && (
                <View style={s.card}>
                  <RNText style={s.sectionTitle}>Observações</RNText>
                  <RNText style={s.cardBody}>{hospedagem.regras}</RNText>
                </View>
              )}

              <View style={s.payBar}>
                <View style={s.payInfo}>
                  <RNText style={s.payLabel}>Valor</RNText>
                  <RNText style={s.payValue}>{hospedagem?.custo != null ? formatCurrency(hospedagem.custo) : 'A definir'}</RNText>
                </View>
                <Pressable onPress={pagar} disabled={paying} style={[s.payBtn, paying && { opacity: 0.7 }]} accessibilityRole="button" accessibilityLabel="Pagar com PIX">
                  {paying ? <ActivityIndicator color="#fff" /> : (
                    <>
                      <QrCode size={18} color="#fff" />
                      <RNText style={s.payBtnText}>Pagar com PIX</RNText>
                    </>
                  )}
                </Pressable>
              </View>

              <View style={s.pixNote}>
                <QrCode size={16} color={SHEET.textMuted} />
                <RNText style={s.pixNoteText}>O pagamento é via PIX identificado. Em breve outros meios de pagamento.</RNText>
              </View>
            </View>
          ) : (
            /* PAGAMENTO GERADO — QR PIX */
            <View style={{ gap: 14, marginTop: 16 }}>
              <View style={s.card}>
                <View style={s.sectionHeaderRow}>
                  <QrCode size={17} color={SHEET.brand} />
                  <RNText style={s.sectionTitle}>Pagamento via PIX</RNText>
                </View>

                {typeof amount === 'number' && (
                  <View style={s.amountRow}>
                    <RNText style={s.amountLabel}>Valor</RNText>
                    <RNText style={s.amountValue}>R$ {amount.toFixed(2)}</RNText>
                  </View>
                )}

                {qrBase64 ? (
                  <View style={s.qrWrap}>
                    <ExpoImage source={{ uri: `data:image/png;base64,${qrBase64}` }} style={s.qr} contentFit="contain" />
                  </View>
                ) : (
                  <RNText style={s.cardBody}>Não foi possível carregar o QR code. Use o código copia-e-cola abaixo.</RNText>
                )}

                <Pressable onPress={copyPix} style={s.outlineBtn} accessibilityRole="button" accessibilityLabel="Copiar código PIX">
                  <Copy size={18} color={SHEET.textPrimary} />
                  <RNText style={s.outlineBtnText}>Copiar código PIX (copia e cola)</RNText>
                </Pressable>

                {!!payment?.point_of_interaction?.transaction_data?.ticket_url && (
                  <Pressable onPress={openTicket} style={s.linkRow} accessibilityRole="button" accessibilityLabel="Abrir cobrança no banco">
                    <ExternalLink size={16} color={SHEET.brand} />
                    <RNText style={s.linkText}>Abrir cobrança no app do banco</RNText>
                  </Pressable>
                )}
              </View>

              {expiration && (
                <View style={s.expiryRow}>
                  <Clock size={15} color={SHEET.textMuted} />
                  <RNText style={s.expiryText}>Pague até {expiration.toLocaleString('pt-BR')}</RNText>
                </View>
              )}

              <Pressable onPress={load} style={s.refreshBtn} accessibilityRole="button" accessibilityLabel="Atualizar status">
                <RefreshCw size={16} color={SHEET.textSecondary} />
                <RNText style={s.refreshText}>Atualizar status</RNText>
              </Pressable>
            </View>
          )}
        </ScrollView>
      )}
    </View>
  );
});

CartaoAcesso.displayName = 'CartaoAcesso';

export default CartaoAcesso;

const PILL_BG = 'rgba(10,12,20,0.58)';
const PILL_BORDER = 'rgba(255,255,255,0.22)';

const h = StyleSheet.create({
  bar: {
    position: 'absolute', top: 0, left: 0, right: 0, zIndex: 20,
    flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingBottom: 6,
  },
  pill: {
    width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center',
    backgroundColor: PILL_BG, borderWidth: StyleSheet.hairlineWidth, borderColor: PILL_BORDER,
  },
});

const s = StyleSheet.create({
  screen: { flex: 1, backgroundColor: SHEET.bg },
  scroll: { paddingBottom: 40, paddingHorizontal: 16 },
  centered: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  loadingText: { color: SHEET.textMuted, fontSize: 14, marginTop: 12 },

  accessCard: {
    borderRadius: 20, padding: 16, backgroundColor: SHEET.surface,
    borderWidth: 1, borderColor: SHEET.border, overflow: 'hidden',
  },
  accessTop: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  accessIcon: { width: 44, height: 44, borderRadius: 12, alignItems: 'center', justifyContent: 'center', backgroundColor: SHEET.brand },
  accessLabel: { color: SHEET.textFaint, fontSize: 10, letterSpacing: 1, fontWeight: '700' },
  accessName: { color: SHEET.textPrimary, fontSize: 18, fontWeight: '800', marginTop: 2 },
  accessStatusRow: { flexDirection: 'row', marginTop: 14 },
  statusPill: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 11, paddingVertical: 6, borderRadius: 999, borderWidth: 1 },
  statusText: { fontSize: 12, fontWeight: '700' },

  card: { borderRadius: 18, backgroundColor: SHEET.glass, borderWidth: 1, borderColor: SHEET.border, padding: 16 },
  cardTitle: { color: SHEET.textPrimary, fontSize: 16, fontWeight: '800' },
  cardBody: { color: SHEET.textSecondary, fontSize: 14.5, lineHeight: 22, marginTop: 8 },
  sectionTitle: { color: SHEET.textPrimary, fontSize: 15.5, fontWeight: '800' },
  sectionHeaderRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 4 },

  bulletRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  bulletText: { color: SHEET.textSecondary, fontSize: 14, flex: 1 },

  payBar: {
    flexDirection: 'row', alignItems: 'center', gap: 12, borderRadius: 18, padding: 14,
    backgroundColor: SHEET.surface, borderWidth: 1, borderColor: SHEET.border,
  },
  payInfo: { flex: 1 },
  payLabel: { color: SHEET.textFaint, fontSize: 11, fontWeight: '700', letterSpacing: 0.5 },
  payValue: { color: SHEET.textPrimary, fontSize: 22, fontWeight: '800', marginTop: 2 },
  payBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
    height: 52, paddingHorizontal: 20, borderRadius: 16, backgroundColor: SHEET.brand,
  },
  payBtnText: { color: '#fff', fontSize: 15, fontWeight: '800' },

  pixNote: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: 4 },
  pixNoteText: { color: SHEET.textMuted, fontSize: 12.5, flex: 1, lineHeight: 17 },

  amountRow: { flexDirection: 'row', alignItems: 'baseline', justifyContent: 'space-between', marginTop: 10 },
  amountLabel: { color: SHEET.textMuted, fontSize: 13 },
  amountValue: { color: SHEET.textPrimary, fontSize: 24, fontWeight: '800' },
  qrWrap: { alignItems: 'center', justifyContent: 'center', backgroundColor: '#fff', borderRadius: 16, padding: 12, marginTop: 14 },
  qr: { width: 220, height: 220 },
  outlineBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, height: 50,
    borderRadius: 14, marginTop: 14, backgroundColor: SHEET.glass, borderWidth: 1, borderColor: SHEET.border,
  },
  outlineBtnText: { color: SHEET.textPrimary, fontSize: 14.5, fontWeight: '700' },
  linkRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, marginTop: 14 },
  linkText: { color: SHEET.brand, fontSize: 13.5, fontWeight: '700' },

  expiryRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6 },
  expiryText: { color: SHEET.textMuted, fontSize: 13 },
  refreshBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, paddingVertical: 10 },
  refreshText: { color: SHEET.textSecondary, fontSize: 13.5, fontWeight: '700' },
});
