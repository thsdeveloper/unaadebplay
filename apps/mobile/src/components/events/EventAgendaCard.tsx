import React, { memo, useCallback, useEffect, useMemo, useState } from 'react';
import { View, Text as RNText, Pressable, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import Animated, { FadeInDown, useAnimatedStyle, useSharedValue, withRepeat, withTiming, Easing } from 'react-native-reanimated';
import { Clock, MapPin, Heart, ChevronRight } from 'lucide-react-native';
import { format, isToday, isValid } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { SHEET } from '@/constants/sheetTokens';
import { getTypeMeta, typeTint } from './eventTypeMeta';
import type { EventsTypes } from '@/types/EventsTypes';

const DOT_TOP = 20; // alinha o ponto do trilho com o topo do medalhão

interface Props {
  event: EventsTypes;
  isFavorite: boolean;
  onToggleFavorite: (id: string) => void;
  isPast?: boolean;
  isFirst?: boolean;
  isLast?: boolean;
  /** true só na PRIMEIRA vez que o item aparece → evita replay da animação ao rolar. */
  animate?: boolean;
  index?: number;
}

/** Ponto do trilho; pulsa (halo) quando é hoje. */
const TimelineDot: React.FC<{ color: string; pulse: boolean }> = ({ color, pulse }) => {
  const p = useSharedValue(0);
  useEffect(() => {
    if (pulse) p.value = withRepeat(withTiming(1, { duration: 1200, easing: Easing.out(Easing.ease) }), -1, false);
  }, [pulse, p]);
  const halo = useAnimatedStyle(() => ({ opacity: pulse ? 0.45 * (1 - p.value) : 0, transform: [{ scale: 0.6 + p.value * 1.6 }] }));
  return (
    <View style={d.dotWrap}>
      <Animated.View style={[d.halo, { backgroundColor: color }, halo]} />
      <View style={[d.dot, { backgroundColor: color, borderColor: SHEET.bg }]} />
    </View>
  );
};

/**
 * Linha da AGENDA (timeline). Estrutura: [gutter data] [trilho: linha + ponto] [card].
 * Text-forward com MEDALHÃO de ícone colorido por tipo — deliberadamente diferente do
 * card de notícia (que é foto-forward). Cor sempre via SHEET/tipo (nunca `dark:`).
 */
function Base({ event, isFavorite, onToggleFavorite, isPast = false, isFirst = false, isLast = false, animate = false, index = 0 }: Props) {
  const router = useRouter();
  const [pressed, setPressed] = useState(false);
  const meta = getTypeMeta(event.event_type);
  const TypeIcon = meta.Icon;

  const { weekday, day, timeRange, today } = useMemo(() => {
    const start = new Date(event.start_date_time);
    const ok = isValid(start);
    const end = event.end_date_time ? new Date(event.end_date_time) : null;
    const t = ok ? format(start, 'HH:mm') : '--:--';
    return {
      weekday: ok ? format(start, 'EEE', { locale: ptBR }).replace('.', '').toUpperCase() : '--',
      day: ok ? format(start, 'dd') : '--',
      timeRange: ok ? (end && isValid(end) ? `${t} – ${format(end, 'HH:mm')}` : t) : '--:--',
      today: ok && isToday(start),
    };
  }, [event.start_date_time, event.end_date_time]);

  const dotColor = today ? SHEET.brand : isPast ? SHEET.textFaint : meta.color;

  const open = useCallback(() => router.push(`/(tabs)/(events)/event/${event.id}` as any), [router, event.id]);
  const fav = useCallback(() => onToggleFavorite(event.id), [onToggleFavorite, event.id]);

  return (
    <Animated.View entering={animate ? FadeInDown.delay(Math.min(index, 8) * 55).duration(340) : undefined}>
      <View style={[row.wrap, isPast && row.past]}>
        {/* Gutter: dia da semana + número */}
        <View style={row.gutter}>
          <RNText style={[row.weekday, today && row.todayAccent]}>{weekday}</RNText>
          <RNText style={[row.day, today && row.todayAccent]}>{day}</RNText>
        </View>

        {/* Trilho */}
        <View style={row.rail}>
          {!isFirst && <View style={[row.line, { top: 0, height: DOT_TOP }]} />}
          <View style={row.dotSlot}><TimelineDot color={dotColor} pulse={today} /></View>
          {!isLast && <View style={[row.line, { top: DOT_TOP + 12, bottom: 0 }]} />}
        </View>

        {/* Card */}
        <Pressable
          onPress={open}
          onPressIn={() => setPressed(true)}
          onPressOut={() => setPressed(false)}
          style={[row.card, pressed && row.cardPressed]}
          accessibilityRole="button"
          accessibilityLabel={`Abrir ${event.title}`}
        >
          <View style={[row.medallion, { backgroundColor: typeTint(meta.color, 0.16), borderColor: typeTint(meta.color, 0.35) }]}>
            <TypeIcon size={20} color={meta.color} />
          </View>

          <View style={row.content}>
            <View style={row.topLine}>
              <RNText style={[row.typeLabel, { color: isPast ? SHEET.textMuted : meta.color }]} numberOfLines={1}>
                {meta.label}{today ? ' · HOJE' : ''}
              </RNText>
              <Pressable onPress={fav} hitSlop={10} style={row.favBtn} accessibilityRole="button" accessibilityLabel={isFavorite ? 'Remover dos favoritos' : 'Salvar nos favoritos'}>
                <Heart size={17} color={isFavorite ? SHEET.brand : SHEET.textMuted} fill={isFavorite ? SHEET.brand : 'transparent'} strokeWidth={2.2} />
              </Pressable>
            </View>

            <RNText style={row.title} numberOfLines={2}>{event.title}</RNText>

            <View style={row.metaRow}>
              <Clock size={13.5} color={SHEET.textMuted} />
              <RNText style={row.metaText}>{timeRange}</RNText>
              {!!event.location && (
                <>
                  <View style={row.metaDot} />
                  <MapPin size={13.5} color={SHEET.textMuted} />
                  <RNText style={row.metaText} numberOfLines={1}>{event.location}</RNText>
                </>
              )}
              <View style={{ flex: 1 }} />
              <ChevronRight size={16} color={isPast ? SHEET.textFaint : meta.color} />
            </View>
          </View>
        </Pressable>
      </View>
    </Animated.View>
  );
}

export const EventAgendaCard = memo(
  Base,
  (a, b) =>
    a.event.id === b.event.id &&
    a.isFavorite === b.isFavorite &&
    a.isFirst === b.isFirst &&
    a.isLast === b.isLast &&
    a.isPast === b.isPast,
);
EventAgendaCard.displayName = 'EventAgendaCard';

const d = StyleSheet.create({
  dotWrap: { width: 24, height: 24, alignItems: 'center', justifyContent: 'center' },
  halo: { position: 'absolute', width: 22, height: 22, borderRadius: 11 },
  dot: { width: 12, height: 12, borderRadius: 6, borderWidth: 3 },
});

const row = StyleSheet.create({
  wrap: { flexDirection: 'row', paddingHorizontal: 14, minHeight: 96 },
  past: { opacity: 0.62 },

  gutter: { width: 40, alignItems: 'center', paddingTop: DOT_TOP - 8 },
  weekday: { color: SHEET.textMuted, fontSize: 10.5, fontWeight: '800', letterSpacing: 0.5 },
  day: { color: SHEET.textPrimary, fontSize: 22, fontWeight: '800', marginTop: 1, fontVariant: ['tabular-nums'] },
  todayAccent: { color: SHEET.brand },

  rail: { width: 24, alignItems: 'center' },
  line: { position: 'absolute', width: 2, backgroundColor: SHEET.border, borderRadius: 1 },
  dotSlot: { position: 'absolute', top: DOT_TOP - 6, alignItems: 'center', justifyContent: 'center' },

  card: { flex: 1, flexDirection: 'row', gap: 12, marginLeft: 4, marginBottom: 12, padding: 12, borderRadius: 18, backgroundColor: SHEET.glass, borderWidth: 1, borderColor: SHEET.border },
  cardPressed: { opacity: 0.92, backgroundColor: SHEET.pressed },
  medallion: { width: 44, height: 44, borderRadius: 14, alignItems: 'center', justifyContent: 'center', borderWidth: 1 },
  content: { flex: 1, gap: 4 },
  topLine: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 8 },
  typeLabel: { fontSize: 11.5, fontWeight: '800', letterSpacing: 0.3, flexShrink: 1, textTransform: 'uppercase' },
  favBtn: { width: 26, height: 26, alignItems: 'center', justifyContent: 'center' },
  title: { color: SHEET.textPrimary, fontSize: 16, fontWeight: '800', lineHeight: 21 },
  metaRow: { flexDirection: 'row', alignItems: 'center', gap: 5, marginTop: 2 },
  metaText: { color: SHEET.textSecondary, fontSize: 12.5, flexShrink: 1 },
  metaDot: { width: 3, height: 3, borderRadius: 2, backgroundColor: SHEET.textFaint, marginHorizontal: 2 },
});
