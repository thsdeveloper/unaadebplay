import React, { useContext, useCallback, useMemo, useState, useEffect } from 'react';
import { View, Text as RNText, Pressable, ScrollView, ActivityIndicator, Share, Platform, Linking, StyleSheet } from 'react-native';
import { useLocalSearchParams, Stack, useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import {
  ArrowLeft, Share2, Heart, Calendar, Clock, MapPin, Navigation, CalendarPlus,
  Info, User, CheckCircle2, Users, Music, GraduationCap, CalendarDays,
} from 'lucide-react-native';
import * as ExpoCalendar from 'expo-calendar';
import AlertContext from '@/contexts/AlertContext';
import { DirectusImage } from '@/components/DirectusImage';
import { GlassSurface } from '@/components/atoms/GlassSurface';
import { GradientButton } from '@/components/atoms/GradientButton';
import { EventListCard } from '@/components/events/EventListCard';
import { useEventDetails } from '@/hooks/useEvents';
import { eventsService } from '@/services/events';
import { SHEET } from '@/constants/sheetTokens';
import type { EventsTypes } from '@/types/EventsTypes';

const HERO_HEIGHT = 320;

const TYPE_META: Record<string, { label: string; Icon: any }> = {
  'congresso-geral': { label: 'Congresso Geral', Icon: Users },
  ensaio: { label: 'Ensaio', Icon: Music },
  palestras: { label: 'Palestras', Icon: GraduationCap },
  'cpre-congresso': { label: 'Pré-Congresso', Icon: CalendarDays },
  default: { label: 'Evento', Icon: CalendarDays },
};

const getInitials = (name: string) =>
  name.split(' ').map((p) => p.charAt(0)).join('').toUpperCase().substring(0, 2);

/** Linha de informação (data/horário) — dark, ícone em caixa com tint de marca. */
const InfoRow: React.FC<{ Icon: any; label: string; value: string }> = ({ Icon, label, value }) => (
  <View style={s.infoRow}>
    <View style={s.infoIcon}><Icon size={18} color={SHEET.brand} /></View>
    <View style={{ flex: 1 }}>
      <RNText style={s.infoLabel}>{label}</RNText>
      <RNText style={s.infoValue}>{value}</RNText>
    </View>
  </View>
);

const EventDetailsPage = React.memo(() => {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const alert = useContext(AlertContext);
  const [related, setRelated] = useState<EventsTypes[]>([]);

  const { event, loading, error, isSubscribed, isFavorite, subscribe, toggleFavorite, subscribing } = useEventDetails({ eventId: id as string });

  useEffect(() => {
    if (!event) return;
    let alive = true;
    eventsService
      .getEvents({ eventType: event.event_type })
      .then((evs) => { if (alive) setRelated(evs.filter((e) => e.id !== event.id).slice(0, 3)); })
      .catch(() => {});
    return () => { alive = false; };
  }, [event]);

  const meta = TYPE_META[event?.event_type ?? ''] ?? TYPE_META.default;
  const TypeIcon = meta.Icon;

  const dt = useMemo(() => {
    if (!event) return { date: '', time: '' };
    const start = new Date(event.start_date_time);
    const end = event.end_date_time ? new Date(event.end_date_time) : null;
    const okStart = !isNaN(start.getTime());
    const okEnd = !!end && !isNaN(end.getTime());
    const dur = okStart && okEnd ? Math.round((end!.getTime() - start.getTime()) / 3600000) : null;
    return {
      date: okStart
        ? format(start, "EEEE, dd 'de' MMMM 'de' yyyy", { locale: ptBR }).replace(/^\w/, (c) => c.toUpperCase())
        : 'Data a definir',
      time: okStart
        ? `${format(start, 'HH:mm')}${okEnd ? ` – ${format(end!, 'HH:mm')}` : ''}${dur ? ` · ${dur}h` : ''}`
        : '--:--',
    };
  }, [event]);

  const onShare = useCallback(async () => {
    if (!event) return;
    try {
      await Share.share({ title: event.title, message: `${event.title}\n${dt.date} às ${dt.time}\n${event.location}\n\nConfira no app UNAADEB!` });
    } catch {
      /* usuário cancelou */
    }
  }, [event, dt]);

  const onAddCalendar = useCallback(async () => {
    if (!event) return;
    try {
      const { status } = await ExpoCalendar.requestCalendarPermissionsAsync();
      if (status !== 'granted') { alert.error('Permissão de calendário negada'); return; }
      const cals = await ExpoCalendar.getCalendarsAsync(ExpoCalendar.EntityTypes.EVENT);
      const cal = cals.find((c) => c.isPrimary) || cals[0];
      if (!cal) { alert.error('Nenhum calendário encontrado'); return; }
      await ExpoCalendar.createEventAsync(cal.id, {
        title: event.title,
        startDate: new Date(event.start_date_time),
        endDate: event.end_date_time ? new Date(event.end_date_time) : new Date(event.start_date_time),
        location: event.location,
        notes: event.description,
      });
      alert.success('Evento adicionado ao calendário!');
    } catch {
      alert.error('Erro ao adicionar ao calendário');
    }
  }, [event, alert]);

  const openMaps = useCallback(() => {
    if (!event?.location) return;
    const q = encodeURIComponent(event.location);
    const url = Platform.select({ ios: `maps:0,0?q=${q}`, android: `geo:0,0?q=${q}` });
    if (url) Linking.openURL(url).catch(() => Linking.openURL(`https://www.google.com/maps/search/?api=1&query=${q}`));
  }, [event]);

  const noop = useCallback(() => {}, []);

  const backPill = useCallback(() => (
    <Pressable onPress={() => router.back()} style={[h.pill, h.pillLeft]} accessibilityRole="button" accessibilityLabel="Voltar">
      <GlassSurface style={h.fill} glassEffectStyle="regular" pointerEvents="none" fallbackColor="rgba(0,0,0,0.4)" />
      <ArrowLeft size={20} color={SHEET.textPrimary} />
    </Pressable>
  ), [router]);

  if (loading) {
    return (
      <View style={s.screen}>
        <Stack.Screen options={{ title: '', headerTransparent: true, headerTintColor: SHEET.textPrimary, headerLeft: backPill }} />
        <View style={s.centered}>
          <ActivityIndicator size="large" color={SHEET.brand} />
          <RNText style={s.loadingText}>Carregando evento...</RNText>
        </View>
      </View>
    );
  }

  if (!event) {
    return (
      <View style={s.screen}>
        <Stack.Screen options={{ title: '', headerTransparent: true, headerTintColor: SHEET.textPrimary, headerLeft: backPill }} />
        <View style={s.centered}>
          <View style={s.emptyIcon}><CalendarDays size={30} color={SHEET.danger} /></View>
          <RNText style={s.emptyTitle}>Evento não encontrado</RNText>
          <RNText style={s.emptyDesc}>{error || 'Não foi possível carregar este evento.'}</RNText>
          <Pressable onPress={() => router.back()} style={s.emptyBtn}><RNText style={s.emptyBtnText}>Voltar</RNText></Pressable>
        </View>
      </View>
    );
  }

  return (
    <View style={s.screen}>
      <Stack.Screen
        options={{
          title: '',
          headerTransparent: true,
          headerTintColor: SHEET.textPrimary,
          headerLeft: backPill,
          headerRight: () => (
            <View style={h.right}>
              <Pressable onPress={onShare} style={h.pill} accessibilityRole="button" accessibilityLabel="Compartilhar">
                <GlassSurface style={h.fill} glassEffectStyle="regular" pointerEvents="none" fallbackColor="rgba(0,0,0,0.4)" />
                <Share2 size={19} color={SHEET.textPrimary} />
              </Pressable>
              <Pressable onPress={toggleFavorite} style={h.pill} accessibilityRole="button" accessibilityLabel={isFavorite ? 'Remover dos favoritos' : 'Adicionar aos favoritos'}>
                <GlassSurface style={h.fill} glassEffectStyle="regular" pointerEvents="none" fallbackColor="rgba(0,0,0,0.4)" />
                <Heart size={19} color={isFavorite ? SHEET.brand : SHEET.textPrimary} fill={isFavorite ? SHEET.brand : 'transparent'} />
              </Pressable>
            </View>
          ),
        }}
      />

      <ScrollView style={s.screen} contentContainerStyle={s.scroll} showsVerticalScrollIndicator={false}>
        <View style={s.hero}>
          {event.image_cover ? (
            <DirectusImage
              assetId={event.image_cover}
              bucket="images"
              resizeMode="cover"
              priority="high"
              style={s.heroImg}
              placeholder={<View style={s.heroPlaceholder} />}
              fallback={<View style={s.heroPlaceholder} />}
            />
          ) : (
            <View style={[s.heroImg, s.heroFallback]}><TypeIcon size={56} color={SHEET.textFaint} /></View>
          )}
          <LinearGradient colors={['transparent', 'rgba(13,15,23,0.55)', SHEET.bg]} style={s.heroScrim} />
          <View style={s.heroContent}>
            <View style={s.typePill}>
              <TypeIcon size={13} color={SHEET.textPrimary} />
              <RNText style={s.typeText}>{meta.label}</RNText>
            </View>
            <RNText style={s.heroTitle} numberOfLines={3}>{event.title}</RNText>
          </View>
        </View>

        <View style={s.body}>
          <View style={s.actions}>
            {isSubscribed ? (
              <View style={s.subscribed}>
                <CheckCircle2 size={20} color={SHEET.brand} />
                <RNText style={s.subscribedText}>Inscrito</RNText>
              </View>
            ) : (
              <View style={{ flex: 1 }}>
                <GradientButton label={subscribing ? 'Inscrevendo...' : 'Inscrever-se'} onPress={subscribe} />
              </View>
            )}
            <Pressable onPress={onAddCalendar} style={s.calBtn} accessibilityRole="button" accessibilityLabel="Adicionar ao calendário">
              <CalendarPlus size={22} color={SHEET.textPrimary} />
            </Pressable>
          </View>

          <View style={s.card}>
            <InfoRow Icon={Calendar} label="DATA" value={dt.date} />
            <View style={s.divider} />
            <InfoRow Icon={Clock} label="HORÁRIO" value={dt.time} />
            {!!event.location && (
              <>
                <View style={s.divider} />
                <Pressable onPress={openMaps} style={s.infoRow} accessibilityRole="button" accessibilityLabel="Abrir no mapa">
                  <View style={s.infoIcon}><MapPin size={18} color={SHEET.brand} /></View>
                  <View style={{ flex: 1 }}>
                    <RNText style={s.infoLabel}>LOCAL</RNText>
                    <RNText style={s.infoValue} numberOfLines={2}>{event.location}</RNText>
                  </View>
                  <Navigation size={18} color={SHEET.brand} />
                </Pressable>
              </>
            )}
          </View>

          {!!event.description && (
            <View style={s.card}>
              <View style={s.sectionHeader}>
                <Info size={17} color={SHEET.brand} />
                <RNText style={s.sectionTitle}>Sobre o evento</RNText>
              </View>
              <RNText style={s.description}>{event.description}</RNText>
            </View>
          )}

          {(!!event.organizer || !!event.organizer_contact_info) && (
            <View style={s.card}>
              <View style={s.sectionHeader}>
                <User size={17} color={SHEET.brand} />
                <RNText style={s.sectionTitle}>Organização</RNText>
              </View>
              <View style={s.organizerRow}>
                <View style={s.orgAvatar}><RNText style={s.orgInitials}>{getInitials(event.organizer || 'ORG')}</RNText></View>
                <View style={{ flex: 1 }}>
                  {!!event.organizer && <RNText style={s.orgName}>{event.organizer}</RNText>}
                  {!!event.organizer_contact_info && <RNText style={s.orgContact}>{event.organizer_contact_info}</RNText>}
                </View>
              </View>
            </View>
          )}
        </View>

        {related.length > 0 && (
          <View style={s.relatedWrap}>
            <View style={s.relatedHeader}>
              <RNText style={s.sectionTitle}>Eventos relacionados</RNText>
              <Pressable onPress={() => router.push('/(tabs)/(events)')} accessibilityRole="button" accessibilityLabel="Ver todos">
                <RNText style={s.seeAll}>Ver todos</RNText>
              </Pressable>
            </View>
            {related.map((ev) => (
              <EventListCard key={ev.id} event={ev} isFavorite={false} onToggleFavorite={noop} />
            ))}
          </View>
        )}
      </ScrollView>
    </View>
  );
});

EventDetailsPage.displayName = 'EventDetailsPage';

export default EventDetailsPage;

const h = StyleSheet.create({
  pill: { width: 38, height: 38, borderRadius: 19, alignItems: 'center', justifyContent: 'center', overflow: 'hidden', marginLeft: 8 },
  pillLeft: { marginLeft: 12 },
  fill: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 },
  right: { flexDirection: 'row', alignItems: 'center', marginRight: 8 },
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
  heroScrim: { position: 'absolute', left: 0, right: 0, bottom: 0, height: HERO_HEIGHT * 0.75 },
  heroContent: { position: 'absolute', left: 16, right: 16, bottom: 14, gap: 10 },
  typePill: { flexDirection: 'row', alignItems: 'center', gap: 6, alignSelf: 'flex-start', paddingHorizontal: 11, paddingVertical: 6, borderRadius: 999, backgroundColor: SHEET.brand },
  typeText: { color: SHEET.textPrimary, fontSize: 12, fontWeight: '700' },
  heroTitle: { color: SHEET.textPrimary, fontSize: 26, fontWeight: '800', lineHeight: 32 },

  body: { paddingHorizontal: 16, paddingTop: 16, gap: 14 },
  actions: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  subscribed: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, height: 58, borderRadius: 18, backgroundColor: SHEET.brandTint, borderWidth: 1, borderColor: SHEET.brand },
  subscribedText: { color: SHEET.brand, fontSize: 15, fontWeight: '800' },
  calBtn: { width: 58, height: 58, borderRadius: 18, alignItems: 'center', justifyContent: 'center', backgroundColor: SHEET.glass, borderWidth: 1, borderColor: SHEET.border },

  card: { borderRadius: 18, backgroundColor: SHEET.glass, borderWidth: 1, borderColor: SHEET.border, padding: 14 },
  divider: { height: 1, backgroundColor: SHEET.hairline, marginVertical: 12 },
  infoRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  infoIcon: { width: 40, height: 40, borderRadius: 12, alignItems: 'center', justifyContent: 'center', backgroundColor: SHEET.brandTint },
  infoLabel: { color: SHEET.textFaint, fontSize: 10.5, letterSpacing: 1, fontWeight: '700' },
  infoValue: { color: SHEET.textPrimary, fontSize: 14.5, fontWeight: '600', marginTop: 2 },

  sectionHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 12 },
  sectionTitle: { color: SHEET.textPrimary, fontSize: 15.5, fontWeight: '800' },
  description: { color: SHEET.textSecondary, fontSize: 14.5, lineHeight: 22 },

  organizerRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  orgAvatar: { width: 46, height: 46, borderRadius: 23, alignItems: 'center', justifyContent: 'center', backgroundColor: SHEET.brandTint },
  orgInitials: { color: SHEET.brand, fontSize: 15, fontWeight: '800' },
  orgName: { color: SHEET.textPrimary, fontSize: 15, fontWeight: '700' },
  orgContact: { color: SHEET.textMuted, fontSize: 13, marginTop: 2 },

  relatedWrap: { marginTop: 18 },
  relatedHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, marginBottom: 12 },
  seeAll: { color: SHEET.brand, fontSize: 13.5, fontWeight: '700' },

  emptyIcon: { width: 72, height: 72, borderRadius: 36, alignItems: 'center', justifyContent: 'center', backgroundColor: SHEET.glass, borderWidth: 1, borderColor: SHEET.border, marginBottom: 16 },
  emptyTitle: { color: SHEET.textPrimary, fontSize: 17, fontWeight: '700', textAlign: 'center' },
  emptyDesc: { color: SHEET.textMuted, fontSize: 13.5, textAlign: 'center', marginTop: 6, lineHeight: 19 },
  emptyBtn: { marginTop: 18, paddingHorizontal: 24, paddingVertical: 12, borderRadius: 999, backgroundColor: SHEET.glass, borderWidth: 1, borderColor: SHEET.border },
  emptyBtnText: { color: SHEET.textPrimary, fontSize: 14, fontWeight: '700' },
});
