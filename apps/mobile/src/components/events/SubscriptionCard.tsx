import React, { memo, useCallback, useMemo, useState } from 'react';
import { View, Text as RNText, Pressable, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { CalendarDays, Clock, MapPin, CheckCircle2, X } from 'lucide-react-native';
import { format, isValid, isToday, isPast, differenceInCalendarDays, differenceInHours } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { SHEET } from '@/constants/sheetTokens';
import { getTypeMeta, typeTint } from './eventTypeMeta';
import type { EventsTypes } from '@/types/EventsTypes';

interface Props {
  event: EventsTypes;
  subscriptionId: string;
  onCancel: (subscriptionId: string, eventTitle: string) => void;
  animate?: boolean;
  index?: number;
}

/** Rótulo relativo (agenda pessoal): "Realizado" / "Hoje" / "Amanhã" / "Faltam N dias". */
function relativeLabel(start: Date): { text: string; done: boolean } {
  if (!isValid(start)) return { text: 'Data a definir', done: false };
  if (isToday(start)) return { text: 'Hoje', done: false };
  if (isPast(start)) return { text: 'Realizado', done: true };
  const days = differenceInCalendarDays(start, new Date());
  if (days === 1) return { text: 'Amanhã', done: false };
  if (days > 1) return { text: `Faltam ${days} dias`, done: false };
  const hours = Math.max(1, differenceInHours(start, new Date()));
  return { text: `Faltam ${hours} h`, done: false };
}

/**
 * Card da tela "Minhas inscrições": evento + status CONFIRMADO (verde de sucesso) +
 * ação de cancelar. Toque no card abre o detalhe. Reusa a linguagem de cor/ícone
 * por tipo da agenda (medalhão), mas com o selo de sucesso em destaque.
 */
function Base({ event, subscriptionId, onCancel, animate = false, index = 0 }: Props) {
  const router = useRouter();
  const [pressed, setPressed] = useState(false);
  const meta = getTypeMeta(event.event_type);
  const TypeIcon = meta.Icon;

  const { dateLabel, timeLabel, rel } = useMemo(() => {
    const start = new Date(event.start_date_time);
    const ok = isValid(start);
    return {
      dateLabel: ok ? format(start, "EEE, dd 'de' MMM", { locale: ptBR }).replace(/^\w/, (c) => c.toUpperCase()) : 'Data a definir',
      timeLabel: ok ? format(start, 'HH:mm') : '--:--',
      rel: relativeLabel(start),
    };
  }, [event.start_date_time]);

  const open = useCallback(() => router.push(`/(tabs)/(events)/event/${event.id}` as any), [router, event.id]);
  const cancel = useCallback(() => onCancel(subscriptionId, event.title), [onCancel, subscriptionId, event.title]);

  return (
    <Animated.View entering={animate ? FadeInDown.delay(Math.min(index, 8) * 55).duration(320) : undefined} style={[c.card, rel.done && c.cardDone]}>
      <Pressable
        onPress={open}
        onPressIn={() => setPressed(true)}
        onPressOut={() => setPressed(false)}
        style={[c.top, pressed && c.pressed]}
        accessibilityRole="button"
        accessibilityLabel={`Abrir ${event.title}`}
      >
        <View style={[c.medallion, { backgroundColor: typeTint(meta.color, 0.16), borderColor: typeTint(meta.color, 0.35) }]}>
          <TypeIcon size={20} color={meta.color} />
        </View>

        <View style={c.content}>
          <RNText style={[c.typeLabel, { color: rel.done ? SHEET.textMuted : meta.color }]} numberOfLines={1}>{meta.label}</RNText>
          <RNText style={c.title} numberOfLines={2}>{event.title}</RNText>
          <View style={c.metaRow}>
            <CalendarDays size={13.5} color={SHEET.textMuted} />
            <RNText style={c.metaText}>{dateLabel}</RNText>
            <View style={c.metaDot} />
            <Clock size={13.5} color={SHEET.textMuted} />
            <RNText style={c.metaText}>{timeLabel}</RNText>
          </View>
          {!!event.location && (
            <View style={c.metaRow}>
              <MapPin size={13.5} color={SHEET.textMuted} />
              <RNText style={c.metaText} numberOfLines={1}>{event.location}</RNText>
            </View>
          )}
        </View>

        <View style={c.statusCol}>
          <CheckCircle2 size={22} color={rel.done ? SHEET.textFaint : SHEET.success} />
          <RNText style={[c.statusText, { color: rel.done ? SHEET.textFaint : SHEET.success }]}>
            {rel.done ? 'Concluído' : 'Confirmado'}
          </RNText>
        </View>
      </Pressable>

      <View style={c.footer}>
        <View style={[c.relPill, rel.done ? c.relPillDone : c.relPillActive]}>
          <RNText style={[c.relText, { color: rel.done ? SHEET.textMuted : SHEET.success }]}>{rel.text}</RNText>
        </View>
        <Pressable onPress={cancel} hitSlop={8} style={c.cancelBtn} accessibilityRole="button" accessibilityLabel={`Cancelar inscrição em ${event.title}`}>
          <X size={15} color={SHEET.danger} strokeWidth={2.4} />
          <RNText style={c.cancelText}>Cancelar</RNText>
        </Pressable>
      </View>
    </Animated.View>
  );
}

export const SubscriptionCard = memo(Base, (a, b) => a.subscriptionId === b.subscriptionId && a.event.id === b.event.id);
SubscriptionCard.displayName = 'SubscriptionCard';

const c = StyleSheet.create({
  card: { marginHorizontal: 16, marginBottom: 12, borderRadius: 18, backgroundColor: SHEET.glass, borderWidth: 1, borderColor: SHEET.border, overflow: 'hidden' },
  cardDone: { opacity: 0.7 },
  top: { flexDirection: 'row', gap: 12, padding: 14 },
  pressed: { backgroundColor: SHEET.pressed },
  medallion: { width: 44, height: 44, borderRadius: 14, alignItems: 'center', justifyContent: 'center', borderWidth: 1 },
  content: { flex: 1, gap: 3 },
  typeLabel: { fontSize: 11.5, fontWeight: '800', letterSpacing: 0.3, textTransform: 'uppercase' },
  title: { color: SHEET.textPrimary, fontSize: 16, fontWeight: '800', lineHeight: 21 },
  metaRow: { flexDirection: 'row', alignItems: 'center', gap: 5, marginTop: 1 },
  metaText: { color: SHEET.textSecondary, fontSize: 12.5, flexShrink: 1 },
  metaDot: { width: 3, height: 3, borderRadius: 2, backgroundColor: SHEET.textFaint, marginHorizontal: 2 },
  statusCol: { alignItems: 'center', justifyContent: 'flex-start', gap: 3, paddingTop: 2, width: 74 },
  statusText: { fontSize: 10.5, fontWeight: '800', letterSpacing: 0.3 },

  footer: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 14, paddingVertical: 10, borderTopWidth: 1, borderTopColor: SHEET.hairline },
  relPill: { paddingHorizontal: 10, paddingVertical: 5, borderRadius: 999, borderWidth: 1 },
  relPillActive: { backgroundColor: SHEET.successTint, borderColor: typeTint('#22C55E', 0.4) },
  relPillDone: { backgroundColor: SHEET.glass, borderColor: SHEET.border },
  relText: { fontSize: 12, fontWeight: '700' },
  cancelBtn: { flexDirection: 'row', alignItems: 'center', gap: 5, paddingHorizontal: 8, paddingVertical: 6 },
  cancelText: { color: SHEET.danger, fontSize: 13, fontWeight: '700' },
});
