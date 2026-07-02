import React, { memo, useCallback, useMemo, useState } from 'react';
import { View, Text as RNText, Pressable, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Calendar, Clock, MapPin, Heart, ChevronRight, Users, Music, GraduationCap, CalendarDays } from 'lucide-react-native';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { DirectusImage } from '@/components/DirectusImage';
import { SHEET } from '@/constants/sheetTokens';
import type { EventsTypes } from '@/types/EventsTypes';

const IMAGE_HEIGHT = 170;

const TYPE_META: Record<string, { label: string; Icon: any }> = {
  'congresso-geral': { label: 'Congresso Geral', Icon: Users },
  ensaio: { label: 'Ensaio', Icon: Music },
  palestras: { label: 'Palestras', Icon: GraduationCap },
  'cpre-congresso': { label: 'Pré-Congresso', Icon: CalendarDays },
  default: { label: 'Evento', Icon: CalendarDays },
};

interface Props {
  event: EventsTypes;
  isFavorite: boolean;
  onToggleFavorite: (id: string) => void;
}

/**
 * Card de evento (lista) — dark, cor sempre via SHEET (nunca o Text atom com color).
 * Estilo do Pressable é array ESTÁTICO + onPressIn/Out (o cssInterop do NativeWind
 * descarta a forma de função). Ver [[nativewind-pressable-function-style]].
 */
function Base({ event, isFavorite, onToggleFavorite }: Props) {
  const router = useRouter();
  const [pressed, setPressed] = useState(false);
  const meta = TYPE_META[event.event_type] ?? TYPE_META.default;

  const { dateLabel, timeLabel } = useMemo(() => {
    const d = new Date(event.start_date_time);
    const ok = !isNaN(d.getTime());
    return {
      dateLabel: ok ? format(d, "EEE, dd 'de' MMM", { locale: ptBR }) : 'Data a definir',
      timeLabel: ok ? format(d, 'HH:mm', { locale: ptBR }) : '--:--',
    };
  }, [event.start_date_time]);

  const open = useCallback(() => router.push(`/(tabs)/(events)/event/${event.id}` as any), [router, event.id]);
  const fav = useCallback(() => onToggleFavorite(event.id), [onToggleFavorite, event.id]);
  const TypeIcon = meta.Icon;

  return (
    <Pressable
      onPress={open}
      onPressIn={() => setPressed(true)}
      onPressOut={() => setPressed(false)}
      style={[c.card, pressed && c.cardPressed]}
      accessibilityRole="button"
      accessibilityLabel={`Abrir ${event.title}`}
    >
      <View style={c.media}>
        <DirectusImage
          assetId={event.image_cover}
          bucket="images"
          resizeMode="cover"
          priority="normal"
          // bg escuro no container (o DirectusImage usa bg-gray-100 por padrão -> flash branco).
          className="bg-transparent"
          style={c.image}
          placeholder={<View style={c.imgPlaceholder} />}
        />
        <LinearGradient colors={['transparent', 'rgba(13,15,23,0.85)']} style={c.scrim} />
        <View style={c.typePill}>
          <TypeIcon size={12} color={SHEET.textPrimary} />
          <RNText style={c.typeText}>{meta.label}</RNText>
        </View>
        <Pressable
          onPress={fav}
          hitSlop={12}
          style={c.favBtn}
          accessibilityRole="button"
          accessibilityLabel={isFavorite ? 'Remover dos favoritos' : 'Adicionar aos favoritos'}
        >
          <Heart size={20} color={isFavorite ? SHEET.brand : SHEET.textPrimary} fill={isFavorite ? SHEET.brand : 'transparent'} />
        </Pressable>
      </View>

      <View style={c.body}>
        <RNText style={c.title} numberOfLines={2}>{event.title}</RNText>
        <View style={c.metaRow}>
          <Calendar size={15} color={SHEET.textMuted} />
          <RNText style={c.metaText}>{dateLabel}</RNText>
          <View style={c.dot} />
          <Clock size={15} color={SHEET.textMuted} />
          <RNText style={c.metaText}>{timeLabel}</RNText>
        </View>
        {!!event.location && (
          <View style={c.metaRow}>
            <MapPin size={15} color={SHEET.textMuted} />
            <RNText style={c.metaText} numberOfLines={1}>{event.location}</RNText>
          </View>
        )}
        <View style={c.footer}>
          <RNText style={c.cta}>Ver detalhes</RNText>
          <ChevronRight size={18} color={SHEET.brand} />
        </View>
      </View>
    </Pressable>
  );
}

export const EventListCard = memo(Base, (a, b) => a.event.id === b.event.id && a.isFavorite === b.isFavorite);
EventListCard.displayName = 'EventListCard';

const c = StyleSheet.create({
  card: { marginHorizontal: 16, marginBottom: 14, borderRadius: 18, backgroundColor: SHEET.glass, borderWidth: 1, borderColor: SHEET.border, overflow: 'hidden' },
  cardPressed: { opacity: 0.92, backgroundColor: SHEET.pressed },
  media: { height: IMAGE_HEIGHT, width: '100%', backgroundColor: SHEET.bgDeep },
  image: { height: IMAGE_HEIGHT, width: '100%', backgroundColor: SHEET.bgDeep },
  imgPlaceholder: { flex: 1, backgroundColor: SHEET.bgDeep },
  scrim: { position: 'absolute', left: 0, right: 0, bottom: 0, height: IMAGE_HEIGHT * 0.6 },
  typePill: { position: 'absolute', top: 12, left: 12, flexDirection: 'row', alignItems: 'center', gap: 5, paddingHorizontal: 10, paddingVertical: 5, borderRadius: 999, backgroundColor: SHEET.brand },
  typeText: { color: SHEET.textPrimary, fontSize: 11.5, fontWeight: '700' },
  favBtn: { position: 'absolute', top: 10, right: 10, width: 38, height: 38, borderRadius: 19, alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(13,15,23,0.55)', borderWidth: 1, borderColor: SHEET.border },
  body: { padding: 14, gap: 8 },
  title: { color: SHEET.textPrimary, fontSize: 17, fontWeight: '800', lineHeight: 22 },
  metaRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  metaText: { color: SHEET.textSecondary, fontSize: 13, flexShrink: 1 },
  dot: { width: 3, height: 3, borderRadius: 2, backgroundColor: SHEET.textFaint, marginHorizontal: 2 },
  footer: { flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-end', gap: 2, marginTop: 2, paddingTop: 10, borderTopWidth: 1, borderTopColor: SHEET.hairline },
  cta: { color: SHEET.brand, fontSize: 13.5, fontWeight: '700' },
});
