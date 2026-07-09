import React, { useContext, useCallback, useMemo, useState, useEffect } from 'react';
import { View, Text as RNText, Pressable, ScrollView, Share, StyleSheet, Linking } from 'react-native';
import { useLocalSearchParams, Stack, useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { useSharedValue, useAnimatedScrollHandler, useAnimatedStyle, interpolate, Extrapolation } from 'react-native-reanimated';
import { BlurView } from 'expo-blur';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import {
  ArrowLeft, Share2, CalendarDays, CalendarClock, Clock, Users, Music, Mic, BedDouble, MapPin,
  CheckCircle2, Info, ChevronRight, Sparkles,
} from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import AlertContext from '@/contexts/AlertContext';
import { DirectusImage } from '@/components/DirectusImage';
import { CongressDetailSkeleton } from '@/components/Skeletons/CongressDetailSkeleton';
import { Avatar } from '@/components/Avatar';
import { GradientButton } from '@/components/atoms/GradientButton';
import { useAuth } from '@/contexts/AuthContext';
import { useCongressPresence } from '@/hooks/useCongressPresence';
import { getItem } from '@/services/items';
import { api } from '@/services/apiClient';
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
      <Avatar userId={guest.userId} userAvatarID={guest.avatar ?? undefined} name={guest.first_name ?? undefined} size={64} />
    </View>
    <RNText style={s.guestName} numberOfLines={1}>{fullName(guest)}</RNText>
    {!!(guest.role || guest.title) && (
      <RNText style={s.guestRole} numberOfLines={1}>{capitalize(guest.role) || guest.title}</RNText>
    )}
  </Pressable>
));
GuestCard.displayName = 'GuestCard';

/**
 * Card de AÇÃO do carrossel de acesso rápido (hospedagem · repertório · localização):
 * ícone em caixa + título + descrição + "Abrir". O tom colore ícone/CTA conforme o
 * estado (brand = ação, success = confirmado, muted = indisponível).
 */
const ActionCard = React.memo<{
  Icon: any;
  title: string;
  desc: string;
  onPress: () => void;
  tone?: 'brand' | 'muted' | 'success';
}>(({ Icon, title, desc, onPress, tone = 'brand' }) => {
  const accent = tone === 'success' ? SHEET.success : tone === 'muted' ? SHEET.textMuted : SHEET.brand;
  const iconBg = tone === 'success' ? SHEET.successTint : tone === 'muted' ? SHEET.glass : SHEET.brandTint;
  return (
    <Pressable onPress={onPress} style={s.actionCard} accessibilityRole="button" accessibilityLabel={title}>
      <View style={[s.actionIcon, { backgroundColor: iconBg }]}>
        <Icon size={22} color={accent} />
      </View>
      <RNText style={s.actionTitle} numberOfLines={1}>{title}</RNText>
      <RNText style={s.actionDesc} numberOfLines={2}>{desc}</RNText>
      <View style={s.actionFooter}>
        <RNText style={[s.actionCta, { color: accent }]}>Abrir</RNText>
        <ChevronRight size={14} color={accent} />
      </View>
    </Pressable>
  );
});
ActionCard.displayName = 'ActionCard';

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
  const presence = useCongressPresence(id as string);

  // Scroll (UI thread) → o fundo do header (blur + tint) ACENDE conforme o pôster do hero
  // some atrás dele; no topo fica transparente (deixa a arte aparecer), rolando vira barra.
  const scrollY = useSharedValue(0);
  const onScroll = useAnimatedScrollHandler({ onScroll: (e) => { scrollY.value = e.contentOffset.y; } });
  const headerBgStyle = useAnimatedStyle(() => {
    const end = HERO_HEIGHT - (insets.top + 52); // ponto em que a base do pôster cruza a base do header
    return { opacity: interpolate(scrollY.value, [end - 90, end], [0, 1], Extrapolation.CLAMP) };
  });

  useEffect(() => {
    let alive = true;
    (async () => {
      setLoading(true);
      try {
        const data = await getItem<CongressType>('congressos', id as any);
        if (!alive) return;
        setCongress(data);

        // Convidados: a junção só tem user_id + role → busca os perfis PÚBLICOS à parte
        // via API (RPC get_public_profiles). NÃO usar `profiles` direto: a RLS é owner-only
        // e devolvia null para os perfis de outras pessoas (nomes/avatares sumiam).
        const rows = (
          await api
            .resource<{ id: string; role: string | null; user_id: string }>('congresso_convidados')
            .list({ filter: { congresso_id: { _eq: id as string } }, limit: 100 })
        ).data;
        const ids = rows.map((r) => r.user_id).filter(Boolean);
        const profs = await Promise.all(ids.map((uid) => api.users.get<any>(uid).catch(() => null)));
        const byId: Record<string, any> = Object.fromEntries(
          profs.filter(Boolean).map((p: any) => [p.id, p]),
        );
        if (!alive) return;
        setGuests(rows.map((r) => ({ userId: r.user_id, role: r.role, ...(byId[r.user_id] ?? {}) })));
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
      const res = await api
        .resource<{ id: string }>('subscribed_hos')
        .list({ filter: { member: { _eq: user.id } }, limit: 1 });
      if (alive) setIsSubscribed((res.data?.length ?? 0) > 0);
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

  // Divide os convidados em Pregadores × Cantores pelo papel (role/title). Cantores são
  // detectados por palavras-chave; o resto (padrão) vai para Pregadores.
  const { pregadores, cantores } = useMemo(() => {
    const CANTOR_RE = /cantor|cantora|louvor|m[uú]sic|ministra|adora|salmist|vocal/i;
    const isCantor = (g: Guest) => CANTOR_RE.test(`${g.role ?? ''} ${g.title ?? ''}`);
    return {
      pregadores: guests.filter((g) => !isCantor(g)),
      cantores: guests.filter(isCantor),
    };
  }, [guests]);

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
  const goProgramacao = useCallback(
    () => router.push({ pathname: '/(tabs)/(home)/(congresso)/programacao/[id]', params: { id: String(id), name: congress?.name ?? '' } }),
    [router, id, congress?.name],
  );
  const goGuest = useCallback(
    (uid: string, role?: string) =>
      router.push({ pathname: '/(tabs)/(home)/(congresso)/convidado/[id]', params: { id: uid, role: role ?? '' } }),
    [router],
  );
  // Localização: usa o link de mapa explícito (location_url); senão faz uma busca do
  // endereço (location) no Google Maps — abre o app de mapas nativo via deep link universal.
  const goLocation = useCallback(async () => {
    const explicit = congress?.location_url?.trim();
    const query = congress?.location?.trim();
    const url = explicit || (query ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}` : null);
    if (!url) return;
    try { await Linking.openURL(url); } catch { alert.error('Não foi possível abrir o mapa.'); }
  }, [congress?.location, congress?.location_url, alert]);

  const renderHeader = useCallback((right?: React.ReactNode) => (
    <View style={[h.bar, { paddingTop: insets.top + 6 }]} pointerEvents="box-none">
      {/* Fundo do header (retângulo, recorta o blur sem vazar): blur + tint + hairline que
          ACENDEM ao rolar — some sobre o pôster no topo, vira barra sobre o conteúdo. */}
      <Animated.View style={[StyleSheet.absoluteFill, headerBgStyle]} pointerEvents="none">
        <BlurView intensity={40} tint="dark" style={StyleSheet.absoluteFill} />
        <View style={h.headerTint} />
        <View style={h.headerBorder} />
      </Animated.View>
      <Pressable onPress={() => router.back()} hitSlop={8} style={h.pill} accessibilityRole="button" accessibilityLabel="Voltar">
        <ArrowLeft size={21} color={SHEET.textPrimary} strokeWidth={2.5} />
      </Pressable>
      {right ?? <View style={h.spacer} />}
    </View>
  ), [router, insets.top, headerBgStyle]);

  if (loading) {
    return (
      <View style={s.screen}>
        <Stack.Screen options={{ headerShown: false }} />
        <CongressDetailSkeleton />
        {renderHeader()}
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
  // Estado do card de hospedagem: encerrada (muted) · inscrito → cartão (success) · aberta (brand).
  const hospCard = !hospedagemOpen
    ? { desc: 'Inscrições encerradas', tone: 'muted' as const, onPress: () => alert.error('As inscrições para a hospedagem deste congresso foram encerradas.') }
    : isSubscribed
    ? { desc: 'Ver meu cartão de acesso', tone: 'success' as const, onPress: goCartao }
    : { desc: 'Inscrições abertas', tone: 'brand' as const, onPress: goHospedagem };
  const hasLocation = !!(congress.location?.trim() || congress.location_url?.trim());

  return (
    <View style={s.screen}>
      <Stack.Screen options={{ headerShown: false }} />

      <Animated.ScrollView
        style={s.screen}
        // paddingBottom limpa a tab bar NATIVA flutuante (Liquid Glass ~83px) — senão o
        // final do conteúdo (convidados) fica escondido atrás dela.
        contentContainerStyle={[s.scroll, { paddingBottom: insets.bottom + 96 }]}
        showsVerticalScrollIndicator={false}
        onScroll={onScroll}
        scrollEventThrottle={16}
      >
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
            <View style={s.dateRow}>
              <View style={s.dateChip}>
                <CalendarDays size={13} color={SHEET.textPrimary} />
                <RNText style={s.dateChipText}>{dates.range}</RNText>
              </View>
              {/* Botão de acesso rápido à programação — dourado p/ destacar como ação. */}
              <Pressable onPress={goProgramacao} style={s.schedulePill} accessibilityRole="button" accessibilityLabel="Ver a programação do congresso">
                <CalendarClock size={13} color={SHEET.gold} />
                <RNText style={s.schedulePillText}>Programação</RNText>
              </Pressable>
            </View>
          </View>
        </View>

        {/* PRESENÇA — ação principal (toggle otimista via useCongressPresence) */}
        <View style={s.body}>
          {!presence.confirmed ? (
            <GradientButton
              label={presence.toggling ? 'Confirmando...' : 'Confirmar presença'}
              onPress={() => { presence.toggle().catch(() => alert.error('Não foi possível confirmar sua presença. Tente novamente.')); }}
              disabled={presence.loading || presence.toggling}
              leftIcon={<CheckCircle2 size={19} color="#fff" />}
            />
          ) : (
            <Pressable
              onPress={() => { presence.toggle().catch(() => alert.error('Não foi possível atualizar sua presença.')); }}
              style={s.presenceOn}
              accessibilityRole="button"
              accessibilityLabel="Presença confirmada. Toque para cancelar."
            >
              <View style={s.presenceOnLeft}>
                <CheckCircle2 size={20} color={SHEET.success} />
                <View style={{ flex: 1 }}>
                  <RNText style={s.presenceOnTitle}>Presença confirmada</RNText>
                  <RNText style={s.presenceOnSub} numberOfLines={1}>
                    {presence.total > 1 ? `Você e mais ${presence.total - 1} confirmaram` : 'Você confirmou presença'}
                  </RNText>
                </View>
              </View>
              <RNText style={s.presenceOnAction}>Cancelar</RNText>
            </Pressable>
          )}
        </View>

        {/* ACESSO RÁPIDO — carrossel de cards (hospedagem · repertório · localização) */}
        <View style={s.actionsWrap}>
          <View style={s.actionsHeader}>
            <Sparkles size={16} color={SHEET.brand} />
            <RNText style={s.sectionTitle}>Acesso rápido</RNText>
          </View>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={s.actionsRow}>
            <ActionCard Icon={BedDouble} title="Hospedagem" desc={hospCard.desc} tone={hospCard.tone} onPress={hospCard.onPress} />
            <ActionCard Icon={Music} title="Repertório" desc="Ouça os louvores do congresso" onPress={goRepertorios} />
            {hasLocation && (
              <ActionCard Icon={MapPin} title="Localização" desc={congress.location?.trim() || 'Ver no mapa'} onPress={goLocation} />
            )}
          </ScrollView>
        </View>

        {/* INFO + SOBRE */}
        <View style={[s.body, s.bodyTight]}>
          <View style={s.card}>
            <InfoRow Icon={CalendarDays} label="QUANDO" value={dates.full} />
            {hasLocation && (
              <>
                <View style={s.divider} />
                <Pressable onPress={goLocation} style={s.infoRow} accessibilityRole="button" accessibilityLabel="Abrir a localização no mapa">
                  <View style={s.infoIcon}><MapPin size={18} color={SHEET.brand} /></View>
                  <View style={{ flex: 1 }}>
                    <RNText style={s.infoLabel}>ONDE</RNText>
                    <RNText style={s.infoValue}>{congress.location?.trim() || 'Ver no mapa'}</RNText>
                  </View>
                  <ChevronRight size={18} color={SHEET.textMuted} />
                </Pressable>
              </>
            )}
          </View>

          {!!congress.description && (
            <View style={s.card}>
              <View style={s.sectionHeader}>
                <Info size={17} color={SHEET.brand} />
                <RNText style={s.sectionTitle}>Sobre o congresso</RNText>
              </View>
              <RNText style={s.description}>{congress.description}</RNText>
            </View>
          )}
        </View>

        {/* PREGADORES — carrossel horizontal */}
        {pregadores.length > 0 && (
          <View style={s.guestsWrap}>
            <View style={s.guestsHeader}>
              <Mic size={17} color={SHEET.brand} />
              <RNText style={s.sectionTitle}>Pregadores</RNText>
            </View>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={s.guestsRow}>
              {pregadores.map((g) => (
                <GuestCard key={g.userId} guest={g} onPress={() => goGuest(g.userId, capitalize(g.role) || 'Pregador')} />
              ))}
            </ScrollView>
          </View>
        )}

        {/* CANTORES — carrossel horizontal */}
        {cantores.length > 0 && (
          <View style={[s.guestsWrap, s.guestsWrapGap]}>
            <View style={s.guestsHeader}>
              <Music size={17} color={SHEET.brand} />
              <RNText style={s.sectionTitle}>Cantores</RNText>
            </View>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={s.guestsRow}>
              {cantores.map((g) => (
                <GuestCard key={g.userId} guest={g} onPress={() => goGuest(g.userId, capitalize(g.role) || 'Cantor')} />
              ))}
            </ScrollView>
          </View>
        )}
      </Animated.ScrollView>

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
  // Tint de cor sobre o blur (dá "cor" e reforça o contraste do blur puro).
  headerTint: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(14,21,38,0.55)' },
  headerBorder: { position: 'absolute', left: 0, right: 0, bottom: 0, height: StyleSheet.hairlineWidth, backgroundColor: SHEET.border },
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
  dateRow: { flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap', gap: 8, marginTop: 4 },
  dateChip: {
    flexDirection: 'row', alignItems: 'center', gap: 6, alignSelf: 'flex-start',
    paddingHorizontal: 11, paddingVertical: 6, borderRadius: 999,
    backgroundColor: 'rgba(255,255,255,0.10)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.14)',
  },
  dateChipText: { color: SHEET.textPrimary, fontSize: 12.5, fontWeight: '600' },
  schedulePill: {
    flexDirection: 'row', alignItems: 'center', gap: 6, alignSelf: 'flex-start',
    paddingHorizontal: 11, paddingVertical: 6, borderRadius: 999,
    backgroundColor: 'rgba(255,215,0,0.14)', borderWidth: 1, borderColor: 'rgba(255,215,0,0.5)',
  },
  schedulePillText: { color: SHEET.gold, fontSize: 12.5, fontWeight: '700' },

  body: { paddingHorizontal: 16, paddingTop: 16, gap: 14 },
  bodyTight: { paddingTop: 8 },

  // Carrossel de acesso rápido (hospedagem · repertório · localização).
  actionsWrap: { marginTop: 16 },
  actionsHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: 16, marginBottom: 12 },
  actionsRow: { paddingHorizontal: 16, gap: 12 },
  actionCard: { width: 160, borderRadius: 18, padding: 14, backgroundColor: SHEET.glass, borderWidth: 1, borderColor: SHEET.border },
  actionIcon: { width: 44, height: 44, borderRadius: 12, alignItems: 'center', justifyContent: 'center', marginBottom: 12 },
  actionTitle: { color: SHEET.textPrimary, fontSize: 15, fontWeight: '800' },
  actionDesc: { color: SHEET.textMuted, fontSize: 12.5, lineHeight: 17, marginTop: 3, minHeight: 34 },
  actionFooter: { flexDirection: 'row', alignItems: 'center', gap: 3, marginTop: 10 },
  actionCta: { fontSize: 12.5, fontWeight: '800' },

  // Presença confirmada — caixa verde (success) com ação de cancelar.
  presenceOn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 12,
    paddingHorizontal: 16, minHeight: 60, paddingVertical: 10, borderRadius: 16,
    backgroundColor: SHEET.successTint, borderWidth: 1, borderColor: SHEET.success,
  },
  presenceOnLeft: { flexDirection: 'row', alignItems: 'center', gap: 10, flex: 1 },
  presenceOnTitle: { color: SHEET.textPrimary, fontSize: 15, fontWeight: '800' },
  presenceOnSub: { color: SHEET.textMuted, fontSize: 12.5, marginTop: 1 },
  presenceOnAction: { color: SHEET.textMuted, fontSize: 13, fontWeight: '700' },

  card: { borderRadius: 18, backgroundColor: SHEET.glass, borderWidth: 1, borderColor: SHEET.border, padding: 14 },
  divider: { height: 1, backgroundColor: SHEET.hairline, marginVertical: 12 },
  infoRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  infoIcon: { width: 40, height: 40, borderRadius: 12, alignItems: 'center', justifyContent: 'center', backgroundColor: SHEET.brandTint },
  infoLabel: { color: SHEET.textFaint, fontSize: 10.5, letterSpacing: 1, fontWeight: '700' },
  infoValue: { color: SHEET.textPrimary, fontSize: 14.5, fontWeight: '600', marginTop: 2 },

  sectionHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 12 },
  sectionTitle: { color: SHEET.textPrimary, fontSize: 15.5, fontWeight: '800' },
  description: { color: SHEET.textSecondary, fontSize: 14.5, lineHeight: 22 },

  guestsWrap: { marginTop: 18 },
  guestsWrapGap: { marginTop: 22 },
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
