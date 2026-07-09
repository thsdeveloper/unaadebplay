import React, { useEffect, useState } from 'react';
import { View, Text as RNText, StyleSheet, useWindowDimensions } from 'react-native';
import { Image } from 'expo-image';
import * as SplashScreen from 'expo-splash-screen';
import Svg, { Defs, RadialGradient, Stop, Rect } from 'react-native-svg';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withRepeat,
  withDelay,
  withSpring,
  interpolate,
  interpolateColor,
  Easing,
  runOnJS,
  cancelAnimation,
  type SharedValue,
} from 'react-native-reanimated';
import { SHEET } from '@/constants/sheetTokens';

const ICON = require('@/assets/icon.png');
const BRAND = '#E51C44';
const HALO = 300;
const RING = 150;
const MIN_VISIBLE_MS = 1300;

interface Props {
  appReady: boolean;
  onExitComplete: () => void;
}

/**
 * Splash animado (por cima do splash nativo). O fundo começa no vermelho da marca
 * (mesma cor do splash nativo → handoff sem flash) e transiciona para o dark; ícone
 * entra com spring e "respira", anéis de pulso emanam da marca, wordmark sobe. Quando
 * `appReady` (config carregada) + tempo mínimo visível → fade+zoom de saída revela o app.
 */
function AnimatedSplashBase({ appReady, onExitComplete }: Props) {
  const { width } = useWindowDimensions();
  const glowSize = Math.min(width * 1.2, 500);

  const bg = useSharedValue(0);
  const glow = useSharedValue(0);
  const breathe = useSharedValue(0);
  const iconScale = useSharedValue(0.82);
  const iconOpacity = useSharedValue(0);
  const wordOpacity = useSharedValue(0);
  const wordY = useSharedValue(16);
  const ring1 = useSharedValue(0);
  const ring2 = useSharedValue(0);
  const ring3 = useSharedValue(0);
  const dots = useSharedValue(0);
  const overlay = useSharedValue(1);
  const exitScale = useSharedValue(1);

  const [minElapsed, setMinElapsed] = useState(false);

  const onLayout = () => {
    // Revela o splash custom no lugar do nativo (handoff perfeito: mesma cor de fundo).
    SplashScreen.hideAsync().catch(() => {});
  };

  useEffect(() => {
    bg.value = withTiming(1, { duration: 680, easing: Easing.out(Easing.quad) });
    glow.value = withDelay(240, withTiming(1, { duration: 720 }));
    iconOpacity.value = withDelay(140, withTiming(1, { duration: 460 }));
    iconScale.value = withDelay(140, withSpring(1, { damping: 12, stiffness: 120, mass: 0.9 }));
    breathe.value = withRepeat(withTiming(1, { duration: 2200, easing: Easing.inOut(Easing.ease) }), -1, true);
    wordOpacity.value = withDelay(540, withTiming(1, { duration: 520 }));
    wordY.value = withDelay(540, withTiming(0, { duration: 560, easing: Easing.out(Easing.cubic) }));

    const ringCfg = { duration: 2600, easing: Easing.out(Easing.quad) } as const;
    ring1.value = withDelay(320, withRepeat(withTiming(1, ringCfg), -1, false));
    ring2.value = withDelay(320 + 870, withRepeat(withTiming(1, ringCfg), -1, false));
    ring3.value = withDelay(320 + 1740, withRepeat(withTiming(1, ringCfg), -1, false));
    dots.value = withRepeat(withTiming(1, { duration: 1100, easing: Easing.inOut(Easing.ease) }), -1, false);

    const t = setTimeout(() => setMinElapsed(true), MIN_VISIBLE_MS);
    return () => {
      clearTimeout(t);
      cancelAnimation(breathe);
      cancelAnimation(ring1);
      cancelAnimation(ring2);
      cancelAnimation(ring3);
      cancelAnimation(dots);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (appReady && minElapsed) {
      exitScale.value = withTiming(1.12, { duration: 560, easing: Easing.in(Easing.cubic) });
      overlay.value = withTiming(0, { duration: 520, easing: Easing.in(Easing.quad) }, (finished) => {
        if (finished) runOnJS(onExitComplete)();
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [appReady, minElapsed]);

  const rootStyle = useAnimatedStyle(() => ({ opacity: overlay.value }));
  const bgStyle = useAnimatedStyle(() => ({ backgroundColor: interpolateColor(bg.value, [0, 1], [BRAND, SHEET.bgDeep]) }));
  const glowStyle = useAnimatedStyle(() => ({
    opacity: glow.value * (0.55 + 0.45 * breathe.value),
    transform: [{ scale: 0.92 + 0.12 * breathe.value }],
  }));
  const iconStyle = useAnimatedStyle(() => ({
    opacity: iconOpacity.value,
    transform: [{ scale: iconScale.value * exitScale.value * (1 + 0.018 * breathe.value) }],
  }));
  const wordStyle = useAnimatedStyle(() => ({ opacity: wordOpacity.value, transform: [{ translateY: wordY.value }] }));

  const useRingStyle = (rv: SharedValue<number>) =>
    useAnimatedStyle(() => ({
      opacity: interpolate(rv.value, [0, 0.12, 1], [0, 0.4, 0]),
      transform: [{ scale: interpolate(rv.value, [0, 1], [0.5, 1.85]) }],
    }));
  const ring1Style = useRingStyle(ring1);
  const ring2Style = useRingStyle(ring2);
  const ring3Style = useRingStyle(ring3);

  const useDotStyle = (offset: number) =>
    useAnimatedStyle(() => {
      const p = (dots.value + offset) % 1;
      return {
        opacity: interpolate(p, [0, 0.5, 1], [0.28, 1, 0.28]),
        transform: [{ scale: interpolate(p, [0, 0.5, 1], [0.8, 1.35, 0.8]) }],
      };
    });
  const dot1Style = useDotStyle(0);
  const dot2Style = useDotStyle(0.33);
  const dot3Style = useDotStyle(0.66);

  const glowPos = { width: glowSize, height: glowSize, top: (HALO - glowSize) / 2, left: (HALO - glowSize) / 2 };

  return (
    <Animated.View style={[StyleSheet.absoluteFill, s.root, rootStyle]} onLayout={onLayout} pointerEvents="none">
      <Animated.View style={[StyleSheet.absoluteFill, bgStyle]} />

      <View style={s.center}>
        <View style={s.halo}>
          <Animated.View style={[s.abs, glowPos, glowStyle]}>
            <Svg width={glowSize} height={glowSize}>
              <Defs>
                <RadialGradient id="glow" cx="50%" cy="50%" r="50%">
                  <Stop offset="0" stopColor={BRAND} stopOpacity="0.6" />
                  <Stop offset="0.5" stopColor={BRAND} stopOpacity="0.16" />
                  <Stop offset="1" stopColor={BRAND} stopOpacity="0" />
                </RadialGradient>
              </Defs>
              <Rect width={glowSize} height={glowSize} fill="url(#glow)" />
            </Svg>
          </Animated.View>

          <Animated.View style={[s.ring, ring1Style]} />
          <Animated.View style={[s.ring, ring2Style]} />
          <Animated.View style={[s.ring, ring3Style]} />

          <Animated.View style={[s.iconCard, iconStyle]}>
            <Image source={ICON} style={s.iconImg} contentFit="cover" />
          </Animated.View>
        </View>

        <Animated.View style={[s.word, wordStyle]}>
          <RNText style={s.brandName}>UNAADEB</RNText>
          <RNText style={s.brandPlay}>PLAY</RNText>
        </Animated.View>
      </View>

      <View style={s.dotsRow}>
        <Animated.View style={[s.dot, dot1Style]} />
        <Animated.View style={[s.dot, dot2Style]} />
        <Animated.View style={[s.dot, dot3Style]} />
      </View>
    </Animated.View>
  );
}

export const AnimatedSplash = React.memo(AnimatedSplashBase);
AnimatedSplash.displayName = 'AnimatedSplash';
export default AnimatedSplash;

const s = StyleSheet.create({
  root: { zIndex: 999, elevation: 999, alignItems: 'center', justifyContent: 'center' },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  halo: { width: HALO, height: HALO, alignItems: 'center', justifyContent: 'center', marginBottom: 8 },
  abs: { position: 'absolute' },
  ring: {
    position: 'absolute',
    width: RING,
    height: RING,
    top: (HALO - RING) / 2,
    left: (HALO - RING) / 2,
    borderRadius: RING / 2,
    borderWidth: 1.5,
    borderColor: BRAND,
  },
  iconCard: {
    width: 118,
    height: 118,
    borderRadius: 30,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
    shadowColor: BRAND,
    shadowOpacity: 0.6,
    shadowRadius: 24,
    shadowOffset: { width: 0, height: 10 },
    elevation: 16,
  },
  iconImg: { width: '100%', height: '100%' },
  word: { alignItems: 'center', marginTop: 4 },
  brandName: { color: SHEET.textPrimary, fontSize: 26, fontWeight: '900', letterSpacing: 3 },
  brandPlay: { color: BRAND, fontSize: 13, fontWeight: '800', letterSpacing: 7, marginTop: 3 },
  dotsRow: { position: 'absolute', bottom: 64, flexDirection: 'row', gap: 9, alignItems: 'center' },
  dot: { width: 8, height: 8, borderRadius: 4, backgroundColor: BRAND },
});
