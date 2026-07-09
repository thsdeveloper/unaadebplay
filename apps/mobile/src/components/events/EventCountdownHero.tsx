import React, { memo, useCallback, useEffect, useState } from 'react';
import { View, Text as RNText, Pressable, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { FadeIn, useAnimatedStyle, useSharedValue, withRepeat, withTiming, Easing } from 'react-native-reanimated';
import { Timer, Heart, MapPin, CalendarDays, Radio } from 'lucide-react-native';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { DirectusImage } from '@/components/DirectusImage';
import { SHEET } from '@/constants/sheetTokens';
import { getTypeMeta, typeTint } from './eventTypeMeta';
import type { EventsTypes } from '@/types/EventsTypes';

const HERO_HEIGHT = 320;

interface Props {
  event: EventsTypes;
  isFavorite: boolean;
  onToggleFavorite: (id: string) => void;
}

interface Segments { days: number; hours: number; mins: number; secs: number; ongoing: boolean }

function computeSegments(startMs: number, now: number): Segments {
  const diff = startMs - now;
  if (diff <= 0) return { days: 0, hours: 0, mins: 0, secs: 0, ongoing: true };
  const total = Math.floor(diff / 1000);
  return {
    days: Math.floor(total / 86400),
    hours: Math.floor((total % 86400) / 3600),
    mins: Math.floor((total % 3600) / 60),
    secs: total % 60,
    ongoing: false,
  };
}

const pad = (n: number) => String(n).padStart(2, '0');

/** Caixa de um segmento do contador (dias/horas/min/seg). */
const Seg: React.FC<{ value: string; label: string }> = ({ value, label }) => (
  <View style={s.seg}>
    <RNText style={s.segValue}>{value}</RNText>
    <RNText style={s.segLabel}>{label}</RNText>
  </View>
);

/**
 * HERO do próximo evento — imagem + contagem regressiva AO VIVO (tique a cada 1s).
 * É a assinatura visual da agenda: nada disso existe no feed de notícias.
 */
function Base({ event, isFavorite, onToggleFavorite }: Props) {
  const router = useRouter();
  const meta = getTypeMeta(event.event_type);
  const TypeIcon = meta.Icon;

  const startMs = new Date(event.start_date_time).getTime();
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, []);
  const seg = computeSegments(startMs, now);

  const dateLabel = !isNaN(startMs)
    ? format(new Date(startMs), "EEE, dd 'de' MMM · HH:mm", { locale: ptBR }).replace(/^\w/, (c) => c.toUpperCase())
    : 'Data a definir';

  // "Ao vivo": halo pulsante quando o evento já começou.
  const pulse = useSharedValue(0);
  useEffect(() => {
    if (seg.ongoing) pulse.value = withRepeat(withTiming(1, { duration: 1100, easing: Easing.inOut(Easing.ease) }), -1, true);
  }, [seg.ongoing, pulse]);
  const liveDot = useAnimatedStyle(() => ({ opacity: 0.5 + pulse.value * 0.5, transform: [{ scale: 0.9 + pulse.value * 0.4 }] }));

  const open = useCallback(() => router.push(`/(tabs)/(events)/event/${event.id}` as any), [router, event.id]);
  const fav = useCallback(() => onToggleFavorite(event.id), [onToggleFavorite, event.id]);

  return (
    <Animated.View entering={FadeIn.duration(420)} style={s.wrap}>
      <Pressable onPress={open} accessibilityRole="button" accessibilityLabel={`Próximo evento: ${event.title}`}>
        <View style={s.media}>
          <DirectusImage
            assetId={event.image_cover}
            bucket="images"
            resizeMode="cover"
            priority="high"
            className="bg-transparent"
            style={s.image}
            placeholder={<View style={s.placeholder} />}
            fallback={<View style={s.placeholder} />}
          />
          <LinearGradient colors={['rgba(13,15,23,0.15)', 'rgba(13,15,23,0.55)', 'rgba(13,15,23,0.96)']} locations={[0, 0.5, 1]} style={s.scrim} />

          {/* eyebrow */}
          <View style={s.eyebrowRow}>
            <View style={[s.eyebrowPill, { backgroundColor: typeTint(meta.color, 0.9) }]}>
              <Timer size={12} color={SHEET.textPrimary} strokeWidth={2.5} />
              <RNText style={s.eyebrowText}>PRÓXIMO EVENTO</RNText>
            </View>
            <Pressable onPress={fav} hitSlop={10} style={s.favBtn} accessibilityRole="button" accessibilityLabel={isFavorite ? 'Remover dos favoritos' : 'Salvar nos favoritos'}>
              <Heart size={19} color={isFavorite ? SHEET.brand : SHEET.textPrimary} fill={isFavorite ? SHEET.brand : 'transparent'} strokeWidth={2.2} />
            </Pressable>
          </View>

          {/* conteúdo inferior */}
          <View style={s.content}>
            <View style={[s.typeChip, { backgroundColor: typeTint(meta.color, 0.22), borderColor: typeTint(meta.color, 0.5) }]}>
              <TypeIcon size={13} color={meta.color === '#E51C44' ? SHEET.textPrimary : meta.color} />
              <RNText style={s.typeText}>{meta.label}</RNText>
            </View>

            <RNText style={s.title} numberOfLines={2}>{event.title}</RNText>

            {seg.ongoing ? (
              <View style={s.liveRow}>
                <Animated.View style={[s.liveHalo, liveDot]} />
                <Radio size={15} color={SHEET.brand} strokeWidth={2.5} />
                <RNText style={s.liveText}>Acontecendo agora</RNText>
              </View>
            ) : (
              <View style={s.countdown}>
                {seg.days > 0 && <Seg value={pad(seg.days)} label={seg.days === 1 ? 'DIA' : 'DIAS'} />}
                <Seg value={pad(seg.hours)} label="HORAS" />
                <Seg value={pad(seg.mins)} label="MIN" />
                <Seg value={pad(seg.secs)} label="SEG" />
              </View>
            )}

            <View style={s.metaRow}>
              <CalendarDays size={14} color={SHEET.textMuted} />
              <RNText style={s.metaText} numberOfLines={1}>{dateLabel}</RNText>
              {!!event.location && (
                <>
                  <View style={s.metaDot} />
                  <MapPin size={14} color={SHEET.textMuted} />
                  <RNText style={s.metaText} numberOfLines={1}>{event.location}</RNText>
                </>
              )}
            </View>
          </View>
        </View>
      </Pressable>
    </Animated.View>
  );
}

export const EventCountdownHero = memo(Base, (a, b) => a.event.id === b.event.id && a.isFavorite === b.isFavorite);
EventCountdownHero.displayName = 'EventCountdownHero';

const s = StyleSheet.create({
  wrap: { marginHorizontal: 16, marginBottom: 18, borderRadius: 24, overflow: 'hidden', borderWidth: 1, borderColor: SHEET.border, backgroundColor: SHEET.bgDeep },
  media: { height: HERO_HEIGHT, width: '100%', backgroundColor: SHEET.bgDeep },
  image: { height: HERO_HEIGHT, width: '100%' },
  placeholder: { flex: 1, backgroundColor: SHEET.bgDeep },
  scrim: { position: 'absolute', left: 0, right: 0, top: 0, bottom: 0 },

  eyebrowRow: { position: 'absolute', top: 14, left: 14, right: 14, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  eyebrowPill: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 11, paddingVertical: 6, borderRadius: 999 },
  eyebrowText: { color: SHEET.textPrimary, fontSize: 11, fontWeight: '800', letterSpacing: 1 },
  favBtn: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(10,12,20,0.5)', borderWidth: StyleSheet.hairlineWidth, borderColor: 'rgba(255,255,255,0.22)' },

  content: { position: 'absolute', left: 16, right: 16, bottom: 16, gap: 10 },
  typeChip: { flexDirection: 'row', alignItems: 'center', gap: 6, alignSelf: 'flex-start', paddingHorizontal: 10, paddingVertical: 5, borderRadius: 999, borderWidth: 1 },
  typeText: { color: SHEET.textPrimary, fontSize: 12, fontWeight: '700' },
  title: { color: SHEET.textPrimary, fontSize: 24, fontWeight: '800', lineHeight: 29 },

  countdown: { flexDirection: 'row', gap: 8, marginTop: 2 },
  seg: { minWidth: 58, paddingVertical: 8, paddingHorizontal: 6, borderRadius: 14, alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.08)', borderWidth: 1, borderColor: SHEET.border },
  segValue: { color: SHEET.textPrimary, fontSize: 22, fontWeight: '800', fontVariant: ['tabular-nums'] },
  segLabel: { color: SHEET.textMuted, fontSize: 9.5, fontWeight: '700', letterSpacing: 1, marginTop: 2 },

  liveRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 2 },
  liveHalo: { position: 'absolute', left: -3, width: 22, height: 22, borderRadius: 11, backgroundColor: SHEET.brandTint },
  liveText: { color: SHEET.brand, fontSize: 15, fontWeight: '800' },

  metaRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 2 },
  metaText: { color: SHEET.textSecondary, fontSize: 12.5, flexShrink: 1 },
  metaDot: { width: 3, height: 3, borderRadius: 2, backgroundColor: SHEET.textFaint, marginHorizontal: 3 },
});
