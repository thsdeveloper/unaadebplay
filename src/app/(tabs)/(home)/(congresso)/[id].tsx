import React, { useContext, useCallback, useMemo, useState, useEffect } from 'react';
import { View, Text as RNText, Pressable, ScrollView, ActivityIndicator, Share, StyleSheet } from 'react-native';
import { useLocalSearchParams, Stack, useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import {
  ArrowLeft, Share2, CalendarDays, Clock, Users, Music, BedDouble,
  CheckCircle2, Lock, Info, ChevronRight, Sparkles,
} from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import AlertContext from '@/contexts/AlertContext';
import { DirectusImage } from '@/components/DirectusImage';
import { Avatar } from '@/components/Avatar';
import { GradientButton } from '@/components/atoms/GradientButton';
import { useAuth } from '@/contexts/AuthContext';
import { getItem } from '@/services/items';
import { supabase } from '@/services/supabase';
import { SHEET } from '@/constants/sheetTokens';
import type { CongressType } from '@/types/CongressType';

const HERO_HEIGHT = 360;

interface Guest {
  userId: string;
  role: string | null;
  first_name?: string | null;
  last_name?: string | null;
  avatar?: string | null;
  title?: string | null;
}

const capitalize = (s?: string | null) =>
  s ? s.charAt(0).toUpperCase() + s.slice(1) : '';

const fullName = (g: Guest) =>
  [g.first_name, g.last_name].filter(Boolean).join(' ').trim() || 'Convidado';

/** Linha de informação (dark, ícone em caixa com tint de marca) — padrão do detalhe de evento. */
const InfoRow: React.FC<{ Icon: any; label: string; value: string }> = ({ Icon, label, value }) => (
  <View style={s.infoRow}>
    <View style={s.infoIcon}><Icon size={18} color={SHEET.brand} /></View>
    <View style={{ flex: 1 }}>
      <RNText style={s.infoLabel}>{label}</RNText>
      <RNText style={s.infoValue}>{value}</RNText>
    </View>
  </View>
);

/** Card de um convidado (cantor/preletor) — avatar + nome + papel. */
const GuestCard = React.memo<{ guest: Guest; onPress: () => void }>(({ guest, onPress }) => (
  <Pressable onPress={onPress} style={s.guestCard} accessibilityRole="button" accessibilityLabel={fullName(guest)}>
    <View style={s.guestAvatarRing}>
      <Avatar userAvatarID={guest.avatar ?? undefined} name={guest.first_name ?? undefined} size={64} />
    </View>
    <RNText style={s.guestName} numberOfLines={1}>{fullName(guest)}</RNText>
    {!!(guest.role || guest.title) && (
      <RNText style={s.guestRole} numberOfLines={1}>{capitalize(guest.role) || guest.title}</RNText>
    )}
  </Pressable>
));
GuestCard.displayName = 'GuestCard';

const CongressoPage = React.memo(() => {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const alert = useContext(AlertContext);
  const { user } = useAuth();

  const [congress, setCongress] = useState<CongressType | null>(null);
  const [guests, setGuests] = useState<Guest[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSubscribed, setIsSubscribed] = useState(false);

  useEffect(() => {
    let alive = true;
    (async () => {
      setLoading(true);
      try {
        const data = await getItem<CongressType>('congressos', id as any);
        if (!alive) return;
        setCongress(data);

        // Convidados: a tabela de junção só tem user_id + role → busca os perfis à parte.
        const { data: rows } = await supabase
          .from('congresso_convidados')
          .select('id, role, user_id')
          .eq('congresso_id', id as any);
        const ids = (rows ?? []).map((r: any) => r.user_id).filter(Boolean);
        let byId: Record<string, any> = {};
        if (ids.length) {
          const { data: profs } = await supabase
            .from('profiles')
            .select('id, first_name, last_name, avatar, title')
            .in('id', ids);
          byId = Object.fromEntries((profs ?? []).map((p: any) => [p.id, p]));
        }
        if (!alive) return;
        setGuests((rows ?? []).map((r: any) => ({ userId: r.user_id, role: r.role, ...(byId[r.user_id] ?? {}) })));
      } catch (e) {
        console.error('[Congresso] erro ao carregar', e);
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => { alive = false; };
  }, [id]);

  useEffect(() => {
    let alive = true;
    (async () => {
      if (!user?.id) { setIsSubscribed(false); return; }
      const { data } = await supabase.from('subscribed_hos').select('id').eq('member', user.id);
      if (alive) setIsSubscribed((data?.length ?? 0) > 0);
    })();
    return () => { alive = false; };
  }, [user?.id]);

  const dates = useMemo(() => {
    if (!congress) return { range: '', full: '' };
    const start = new Date(congress.date_start);
    const end = new Date(congress.date_end);
    const okS = !isNaN(start.getTime());
    const okE = !isNaN(end.getTime());
    if (!okS) return { range: 'A definir', full: 'Data a definir' };
    const sameYear = okE && start.getFullYear() === end.getFullYear();
    const range = okE
      ? `${format(start, "dd MMM", { locale: ptBR })} – ${format(end, "dd MMM yyyy", { locale: ptBR })}`
      : format(start, "dd 'de' MMM yyyy", { locale: ptBR });
    const full = okE
      ? `${format(start, "dd 'de' MMMM", { locale: ptBR })}${sameYear ? '' : format(start, " 'de' yyyy", { locale: ptBR })} a ${format(end, "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}`
      : format(start, "dd 'de' MMMM 'de' yyyy", { locale: ptBR });
    return { range, full };
  }, [congress]);

  const onShare = useCallback(async () => {
    if (!congress) return;
    try {
      await Share.share({
        title: congress.name,
        message: `${congress.name}${congress.theme ? `\n${congress.theme}` : ''}\n${dates.full}\n\nConfira no app UNAADEB!`,
      });
    } catch { /* cancelado */ }
  }, [congress, dates.full]);

  const goHospedagem = useCallback(() => router.push('/(tabs)/(home)/(congresso)/hospedagem'), [router]);
  const goCartao = useCallback(() => router.push('/(tabs)/(home)/(congresso)/cartao-acesso'), [router]);
  const goRepertorios = useCallback(() => router.push('/(tabs)/(home)/repertories'), [router]);
  const goGuest = useCallback((uid: string) => router.push(`/(tabs)/(home)/(congresso)/convidado/${uid}` as any), [router]);

  const renderHeader = useCallback((right?: React.ReactNode) => (
    <View style={[h.bar, { paddingTop: insets.top + 6 }]} pointerEvents="box-none">
      <Pressable onPress={() => router.back()} hitSlop={8} style={h.pill} accessibilityRole="button" accessibilityLabel="Voltar">
        <ArrowLeft size={21} color={SHEET.textPrimary} strokeWidth={2.5} />
      </Pressable>
      {right ?? <View style={h.spacer} />}
    </View>
  ), [router, insets.top]);

  if (loading) {
    return (
      <View style={s.screen}>
        <Stack.Screen options={{ headerShown: false }} />
        {renderHeader()}
        <View style={s.centered}>
          <ActivityIndicator size="large" color={SHEET.brand} />
          <RNText style={s.loadingText}>Carregando congresso...</RNText>
        </View>
      </View>
    );
  }

  if (!congress) {
    return (
      <View style={s.screen}>
        <Stack.Screen options={{ headerShown: false }} />
        {renderHeader()}
        <View style={s.centered}>
          <View style={s.emptyIcon}><Sparkles size={30} color={SHEET.danger} /></View>
          <RNText style={s.emptyTitle}>Congresso não encontrado</RNText>
          <RNText style={s.emptyDesc}>Não foi possível carregar os dados deste congresso.</RNText>
          <Pressable onPress={() => router.back()} style={s.emptyBtn}><RNText style={s.emptyBtnText}>Voltar</RNText></Pressable>
        </View>
      </View>
    );
  }

  const hospedagemOpen = !!congress.status_hospedagem;

  return (
    <View style={s.screen}>
      <Stack.Screen options={{ headerShown: false }} />

      <ScrollView style={s.screen} contentContainerStyle={s.scroll} showsVerticalScrollIndicator={false}>
        {/* HERO — pôster do congresso + scrim + título */}
        <View style={s.hero}>
          {congress.poster ? (
            <DirectusImage
              assetId={congress.poster}
              bucket="images"
              resizeMode="cover"
              priority="high"
              style={s.heroImg}
              className="bg-transparent"
              placeholder={<View style={s.heroPlaceholder} />}
              fallback={<View style={s.heroPlaceholder} />}
            />
          ) : (
            <View style={[s.heroImg, s.heroFallback]}><Sparkles size={54} color={SHEET.textFaint} /></View>
          )}
          <LinearGradient colors={['transparent', 'rgba(13,15,23,0.55)', SHEET.bg]} style={s.heroScrim} />
          <View style={s.heroContent}>
            <View style={s.eyebrowRow}>
              <Sparkles size={13} color={SHEET.gold} />
              <RNText style={s.eyebrow}>CONGRESSO</RNText>
            </View>
            <RNText style={s.heroTitle} numberOfLines={3}>{congress.name}</RNText>
            {!!congress.theme && <RNText style={s.heroTheme} numberOfLines={2}>{congress.theme}</RNText>}
            <View style={s.dateChip}>
              <CalendarDays size={13} color={SHEET.textPrimary} />
              <RNText style={s.dateChipText}>{dates.range}</RNText>
            </View>
          </View>
        </View>

        <View style={s.body}>
          {/* CTA — hospedagem / cartão / encerrado */}
          {!hospedagemOpen ? (
            <Pressable
              onPress={() => alert.error('As inscrições para a hospedagem deste congresso foram encerradas.')}
              style={s.closedBtn}
              accessibilityRole="button"
            >
              <Lock size={18} color={SHEET.textMuted} />
              <RNText style={s.closedText}>Inscrições encerradas</RNText>
            </Pressable>
          ) : isSubscribed ? (
            <View style={{ gap: 12 }}>
              <View style={s.subscribed}>
                <CheckCircle2 size={20} color={SHEET.brand} />
                <RNText style={s.subscribedText}>Hospedagem confirmada</RNText>
              </View>
              <GradientButton
                label="Meu cartão de acesso"
                onPress={goCartao}
                leftIcon={<CheckCircle2 size={19} color="#fff" />}
              />
            </View>
          ) : (
            <GradientButton
              label="Inscrever-se na hospedagem"
              onPress={goHospedagem}
              leftIcon={<BedDouble size={19} color="#fff" />}
            />
          )}

          {/* INFO — datas + hospedagem */}
          <View style={s.card}>
            <InfoRow Icon={CalendarDays} label="QUANDO" value={dates.full} />
            <View style={s.divider} />
            <View style={s.infoRow}>
              <View style={s.infoIcon}><BedDouble size={18} color={SHEET.brand} /></View>
              <View style={{ flex: 1 }}>
                <RNText style={s.infoLabel}>HOSPEDAGEM</RNText>
                <RNText style={[s.infoValue, { color: hospedagemOpen ? SHEET.textPrimary : SHEET.textMuted }]}>
                  {hospedagemOpen ? 'Inscrições abertas' : 'Encerradas'}
                </RNText>
              </View>
            </View>
          </View>

          {/* SOBRE */}
          {!!congress.description && (
            <View style={s.card}>
              <View style={s.sectionHeader}>
                <Info size={17} color={SHEET.brand} />
                <RNText style={s.sectionTitle}>Sobre o congresso</RNText>
              </View>
              <RNText style={s.description}>{congress.description}</RNText>
            </View>
          )}

          {/* REPERTÓRIO — CTA para a tela de repertórios */}
          <Pressable onPress={goRepertorios} style={s.linkCard} accessibilityRole="button" accessibilityLabel="Ouça o repertório">
            <View style={s.linkIcon}><Music size={20} color={SHEET.brand} /></View>
            <View style={{ flex: 1 }}>
              <RNText style={s.linkTitle}>Ouça o repertório</RNText>
              <RNText style={s.linkSub}>Louvores para o congresso</RNText>
            </View>
            <ChevronRight size={20} color={SHEET.textMuted} />
          </Pressable>
        </View>

        {/* CANTORES E PRELETORES */}
        {guests.length > 0 && (
          <View style={s.guestsWrap}>
            <View style={s.guestsHeader}>
              <Users size={17} color={SHEET.brand} />
              <RNText style={s.sectionTitle}>Cantores e preletores</RNText>
            </View>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={s.guestsRow}
            >
              {guests.map((g) => (
                <GuestCard key={g.userId} guest={g} onPress={() => goGuest(g.userId)} />
              ))}
            </ScrollView>
          </View>
        )}
      </ScrollView>

      {renderHeader(
        <Pressable onPress={onShare} hitSlop={8} style={h.pill} accessibilityRole="button" accessibilityLabel="Compartilhar">
          <Share2 size={18} color={SHEET.textPrimary} strokeWidth={2.4} />
        </Pressable>
      )}
    </View>
  );
});

CongressoPage.displayName = 'CongressoPage';

export default CongressoPage;

const PILL_BG = 'rgba(10,12,20,0.58)';
const PILL_BORDER = 'rgba(255,255,255,0.22)';

const h = StyleSheet.create({
  bar: {
    position: 'absolute', top: 0, left: 0, right: 0, zIndex: 20,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 16, paddingBottom: 6,
  },
  spacer: { width: 40, height: 40 },
  pill: {
    width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center',
    backgroundColor: PILL_BG, borderWidth: StyleSheet.hairlineWidth, borderColor: PILL_BORDER,
  },
});

const s = StyleSheet.create({
  screen: { flex: 1, backgroundColor: SHEET.bg },
  scroll: { paddingBottom: 40 },
  centered: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 40 },
  loadingText: { color: SHEET.textMuted, fontSize: 14, marginTop: 12 },

  hero: { height: HERO_HEIGHT, width: '100%', backgroundColor: SHEET.bgDeep },
  heroImg: { height: HERO_HEIGHT, width: '100%', backgroundColor: SHEET.bgDeep },
  heroPlaceholder: { flex: 1, backgroundColor: SHEET.bgDeep },
  heroFallback: { alignItems: 'center', justifyContent: 'center' },
  heroScrim: { position: 'absolute', left: 0, right: 0, bottom: 0, height: HERO_HEIGHT * 0.8 },
  heroContent: { position: 'absolute', left: 16, right: 16, bottom: 16, gap: 8 },
  eyebrowRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  eyebrow: { color: SHEET.gold, fontSize: 12, fontWeight: '800', letterSpacing: 1.5 },
  heroTitle: { color: SHEET.textPrimary, fontSize: 28, fontWeight: '800', lineHeight: 33 },
  heroTheme: { color: SHEET.textSecondary, fontSize: 15, lineHeight: 20 },
  dateChip: {
    flexDirection: 'row', alignItems: 'center', gap: 6, alignSelf: 'flex-start', marginTop: 4,
    paddingHorizontal: 11, paddingVertical: 6, borderRadius: 999,
    backgroundColor: 'rgba(255,255,255,0.10)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.14)',
  },
  dateChipText: { color: SHEET.textPrimary, fontSize: 12.5, fontWeight: '600' },

  body: { paddingHorizontal: 16, paddingTop: 16, gap: 14 },

  closedBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, height: 58,
    borderRadius: 18, backgroundColor: SHEET.glass, borderWidth: 1, borderColor: SHEET.border,
  },
  closedText: { color: SHEET.textMuted, fontSize: 15, fontWeight: '700' },
  subscribed: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, height: 52,
    borderRadius: 16, backgroundColor: SHEET.brandTint, borderWidth: 1, borderColor: SHEET.brand,
  },
  subscribedText: { color: SHEET.brand, fontSize: 15, fontWeight: '800' },

  card: { borderRadius: 18, backgroundColor: SHEET.glass, borderWidth: 1, borderColor: SHEET.border, padding: 14 },
  divider: { height: 1, backgroundColor: SHEET.hairline, marginVertical: 12 },
  infoRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  infoIcon: { width: 40, height: 40, borderRadius: 12, alignItems: 'center', justifyContent: 'center', backgroundColor: SHEET.brandTint },
  infoLabel: { color: SHEET.textFaint, fontSize: 10.5, letterSpacing: 1, fontWeight: '700' },
  infoValue: { color: SHEET.textPrimary, fontSize: 14.5, fontWeight: '600', marginTop: 2 },

  sectionHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 12 },
  sectionTitle: { color: SHEET.textPrimary, fontSize: 15.5, fontWeight: '800' },
  description: { color: SHEET.textSecondary, fontSize: 14.5, lineHeight: 22 },

  linkCard: {
    flexDirection: 'row', alignItems: 'center', gap: 12, borderRadius: 18, padding: 14,
    backgroundColor: SHEET.glass, borderWidth: 1, borderColor: SHEET.border,
  },
  linkIcon: { width: 44, height: 44, borderRadius: 12, alignItems: 'center', justifyContent: 'center', backgroundColor: SHEET.brandTint },
  linkTitle: { color: SHEET.textPrimary, fontSize: 15, fontWeight: '700' },
  linkSub: { color: SHEET.textMuted, fontSize: 13, marginTop: 2 },

  guestsWrap: { marginTop: 18 },
  guestsHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: 16, marginBottom: 12 },
  guestsRow: { paddingHorizontal: 16, gap: 14 },
  guestCard: { width: 92, alignItems: 'center' },
  guestAvatarRing: { padding: 3, borderRadius: 999, borderWidth: 2, borderColor: SHEET.brand, marginBottom: 8 },
  guestName: { color: SHEET.textPrimary, fontSize: 13, fontWeight: '700', textAlign: 'center' },
  guestRole: { color: SHEET.textMuted, fontSize: 11.5, textAlign: 'center', marginTop: 1 },

  emptyIcon: { width: 72, height: 72, borderRadius: 36, alignItems: 'center', justifyContent: 'center', backgroundColor: SHEET.glass, borderWidth: 1, borderColor: SHEET.border, marginBottom: 16 },
  emptyTitle: { color: SHEET.textPrimary, fontSize: 17, fontWeight: '700', textAlign: 'center' },
  emptyDesc: { color: SHEET.textMuted, fontSize: 13.5, textAlign: 'center', marginTop: 6, lineHeight: 19 },
  emptyBtn: { marginTop: 18, paddingHorizontal: 24, paddingVertical: 12, borderRadius: 999, backgroundColor: SHEET.glass, borderWidth: 1, borderColor: SHEET.border },
  emptyBtnText: { color: SHEET.textPrimary, fontSize: 14, fontWeight: '700' },
});
