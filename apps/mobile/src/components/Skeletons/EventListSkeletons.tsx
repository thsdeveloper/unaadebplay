import React, { useEffect, useRef } from 'react';
import { View, Animated, StyleSheet } from 'react-native';
import { SHEET } from '@/constants/sheetTokens';

interface EventListSkeletonsProps {
  count?: number;
}

const Bar: React.FC<{ w: any; h?: number; style?: any; pulse: Animated.Value }> = ({ w, h = 12, style, pulse }) => (
  <Animated.View style={[{ width: w, height: h, borderRadius: 6, backgroundColor: 'rgba(255,255,255,0.06)', opacity: pulse }, style]} />
);

const CardSkeleton: React.FC<{ pulse: Animated.Value }> = ({ pulse }) => (
  <View style={sk.card}>
    <View style={sk.media} />
    <View style={sk.body}>
      <Bar w="70%" h={18} pulse={pulse} />
      <Bar w="45%" pulse={pulse} style={{ marginTop: 10 }} />
      <Bar w="55%" pulse={pulse} style={{ marginTop: 8 }} />
    </View>
  </View>
);

/** Placeholders escuros da lista de eventos (mesma forma do EventListCard). */
const EventListSkeletons: React.FC<EventListSkeletonsProps> = ({ count = 4 }) => {
  const pulse = useRef(new Animated.Value(0.4)).current;
  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, { toValue: 0.85, duration: 900, useNativeDriver: true }),
        Animated.timing(pulse, { toValue: 0.4, duration: 900, useNativeDriver: true }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [pulse]);

  return (
    <View style={sk.wrap}>
      {Array.from({ length: count }).map((_, i) => (
        <CardSkeleton key={i} pulse={pulse} />
      ))}
    </View>
  );
};

export default EventListSkeletons;

const sk = StyleSheet.create({
  wrap: { paddingTop: 16 },
  card: { marginHorizontal: 16, marginBottom: 14, borderRadius: 18, backgroundColor: SHEET.glass, borderWidth: 1, borderColor: SHEET.border, overflow: 'hidden' },
  media: { height: 170, width: '100%', backgroundColor: SHEET.bgDeep },
  body: { padding: 14 },
});
