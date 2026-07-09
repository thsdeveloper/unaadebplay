import React, { memo, useEffect } from 'react';
import { View, StyleSheet, type ViewStyle, type StyleProp } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withRepeat, withTiming, Easing } from 'react-native-reanimated';
import { SHEET } from '@/constants/sheetTokens';

/** Pulso de shimmer reutilizável (opacidade 0.4↔0.75 em loop) para skeletons SHEET. */
export const SkeletonPulse = memo<{ children: React.ReactNode; style?: StyleProp<ViewStyle> }>(({ children, style }) => {
  const p = useSharedValue(0);
  useEffect(() => {
    p.value = withRepeat(withTiming(1, { duration: 900, easing: Easing.inOut(Easing.ease) }), -1, true);
  }, [p]);
  const shimmer = useAnimatedStyle(() => ({ opacity: 0.4 + p.value * 0.35 }));
  return <Animated.View style={[shimmer, style]}>{children}</Animated.View>;
});
SkeletonPulse.displayName = 'SkeletonPulse';

/** Bloco "vidro" (barra/quadrado/avatar) no padrão SHEET — compõe os skeletons. */
export const SkeletonBox = memo<{ style?: StyleProp<ViewStyle> }>(({ style }) => (
  <View style={[sk.box, style]} />
));
SkeletonBox.displayName = 'SkeletonBox';

const sk = StyleSheet.create({
  box: { backgroundColor: SHEET.glass, borderWidth: 1, borderColor: SHEET.border, borderRadius: 12 },
});
