import React, { memo } from 'react';
import { Dimensions, View, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Feather } from '@expo/vector-icons';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Pressable } from '@/components/ui/pressable';
import { Text } from '@/components/ui/text';
import { DirectusImage } from '@/components/DirectusImage';
import type { EventsTypes } from '@/types/EventsTypes';

export const EVENT_CARD_WIDTH = Math.round(Dimensions.get('window').width * 0.82);
const HEIGHT = Math.round(EVENT_CARD_WIDTH * 0.56); // ~16:9

interface Props {
  event: EventsTypes;
}

/** Card de evento landscape ao estilo Netflix: capa + scrim + pílula de data + título. */
export const EventCard = memo<Props>(({ event }) => {
  const router = useRouter();
  const date =
    event.start_date_time && !isNaN(new Date(event.start_date_time).getTime())
      ? format(new Date(event.start_date_time), 'dd MMM', { locale: ptBR })
      : null;
  const meta = event.location || event.event_type;

  return (
    <Pressable
      onPress={() => router.push(`/(tabs)/(events)/event/${event.id}` as any)}
      accessibilityRole="button"
      accessibilityLabel={event.title}
      style={{ width: EVENT_CARD_WIDTH }}
    >
      <View style={styles.box}>
        <DirectusImage
          assetId={event.image_cover}
          bucket="images"
          width={EVENT_CARD_WIDTH}
          height={HEIGHT}
          resizeMode="cover"
        />
        <LinearGradient
          colors={['transparent', 'rgba(13,15,23,0.9)']}
          style={styles.scrim}
        />
        {date && (
          <View style={styles.datePill}>
            <Text style={styles.dateText}>{date}</Text>
          </View>
        )}
        <View style={styles.content}>
          <Text style={styles.title} numberOfLines={2}>{event.title}</Text>
          {!!meta && (
            <View style={styles.metaRow}>
              <Feather name="map-pin" size={12} color="#D1D5DB" />
              <Text style={styles.meta} numberOfLines={1}>{meta}</Text>
            </View>
          )}
        </View>
      </View>
    </Pressable>
  );
}, (a, b) => a.event.id === b.event.id);

EventCard.displayName = 'EventCard';

const styles = StyleSheet.create({
  box: {
    width: EVENT_CARD_WIDTH,
    height: HEIGHT,
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: 'rgba(255,255,255,0.06)',
  },
  scrim: { position: 'absolute', left: 0, right: 0, bottom: 0, height: HEIGHT * 0.65 },
  datePill: {
    position: 'absolute',
    top: 10,
    left: 10,
    backgroundColor: '#E51C44',
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  dateText: { color: '#fff', fontSize: 12, fontWeight: '800' },
  content: { position: 'absolute', left: 12, right: 12, bottom: 10 },
  title: { color: '#F9FAFB', fontSize: 16, fontWeight: '800' },
  metaRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 3 },
  meta: { color: '#D1D5DB', fontSize: 12, flex: 1 },
});
