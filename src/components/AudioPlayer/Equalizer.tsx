import React, { useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  withDelay,
  cancelAnimation,
} from 'react-native-reanimated';

interface Props {
  color?: string;
  /** true = barras dançando; false = barras estáticas baixas (pausado). */
  active?: boolean;
  size?: number; // altura total
  barWidth?: number;
}

const DELAYS = [0, 180, 360, 120];
const DURS = [520, 680, 600, 740];

/** Equalizer de 4 barras (reanimated). Anima só quando `active`. */
export const Equalizer: React.FC<Props> = ({ color = '#fff', active = true, size = 18, barWidth = 3 }) => {
  return (
    <View style={[styles.wrap, { height: size }]}>
      {DELAYS.map((delay, i) => (
        <Bar key={i} color={color} active={active} size={size} barWidth={barWidth} delay={delay} dur={DURS[i]} seed={i} />
      ))}
    </View>
  );
};

const Bar: React.FC<{ color: string; active: boolean; size: number; barWidth: number; delay: number; dur: number; seed: number }> = ({
  color, active, size, barWidth, delay, dur, seed,
}) => {
  const h = useSharedValue(0.35 + (seed % 2) * 0.15);

  useEffect(() => {
    cancelAnimation(h);
    if (active) {
      h.value = withDelay(delay, withRepeat(withTiming(1, { duration: dur }), -1, true));
    } else {
      h.value = withTiming(0.28, { duration: 220 });
    }
    return () => cancelAnimation(h);
  }, [active, delay, dur, h]);

  const style = useAnimatedStyle(() => ({
    height: `${Math.max(0.18, h.value) * 100}%`,
  }));

  return (
    <Animated.View style={[styles.bar, { width: barWidth, borderRadius: barWidth / 2, backgroundColor: color }, style]} />
  );
};

const styles = StyleSheet.create({
  wrap: { flexDirection: 'row', alignItems: 'flex-end', gap: 2.5 },
  bar: { width: 3 },
});
