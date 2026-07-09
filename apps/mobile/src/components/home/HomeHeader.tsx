import React from 'react';
import { View, Pressable, ScrollView, StyleSheet } from 'react-native';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
  interpolate,
  interpolateColor,
  Extrapolation,
  type SharedValue,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { Avatar } from '@/components/Avatar';
import { AppWordmark } from '@/components/atoms';
import { NotificationBell } from '@/components/NotificationBell';
import { useAuth } from '@/contexts/AuthContext';
import { SHEET } from '@/constants/sheetTokens';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

const ICON = require('@/assets/icon.png');

export const HOME_TOPBAR_H = 50;
// 38 (chip) + 4 (padding acima) + 4 (padding abaixo) = 46 → respiro das tags nos dois lados.
export const HOME_CHIPS_H = 46;
/** Altura do header (sem a safe area) — a Home usa para o paddingTop do conteúdo. */
export const HOME_HEADER_H = HOME_TOPBAR_H + HOME_CHIPS_H;

const CHIPS: { label: string; href: string }[] = [
  { label: 'Eventos', href: '/(tabs)/(events)' },
  { label: 'Notícias', href: '/(tabs)/(posts)' },
  { label: 'Usuários', href: '/(tabs)/(home)/users' },
  { label: 'Repertórios', href: '/(tabs)/(home)/repertories' },
  { label: 'Contribua', href: '/(tabs)/(home)/contribua' },
];

interface Props {
  /** Offset vertical do scroll (UI thread) — dirige fundo/hairline por POSIÇÃO. */
  scrollY: SharedValue<number>;
  /** Revelação das tags dirigida pelo SENTIDO do gesto (1 = visíveis, 0 = colapsadas). */
  reveal: SharedValue<number>;
}

/**
 * Chip animado com "hover" (press no touch, hover real no web): encolhe de leve,
 * o fundo acende no tom da marca (brandTint), a borda fica vermelha e o texto clareia
 * — tudo dirigido por 1 shared value (`p` 0→1) na UI thread, com háptico no toque.
 */
const HeaderChip = React.memo(function HeaderChip({ label, onPress }: { label: string; onPress: () => void }) {
  const p = useSharedValue(0);

  const activate = () => {
    p.value = withTiming(1, { duration: 130 });
  };
  const deactivate = () => {
    p.value = withTiming(0, { duration: 190 });
  };

  const containerStyle = useAnimatedStyle(() => ({
    transform: [{ scale: 1 - p.value * 0.06 }],
    backgroundColor: interpolateColor(p.value, [0, 1], [SHEET.glass, SHEET.brandTint]),
    borderColor: interpolateColor(p.value, [0, 1], [SHEET.border, SHEET.brand]),
  }));

  const textStyle = useAnimatedStyle(() => ({
    color: interpolateColor(p.value, [0, 1], [SHEET.textSecondary, SHEET.textPrimary]),
  }));

  return (
    <AnimatedPressable
      onPressIn={() => {
        Haptics.selectionAsync();
        activate();
      }}
      onPressOut={deactivate}
      onHoverIn={activate}
      onHoverOut={deactivate}
      onPress={onPress}
      // Array ESTÁTICO + estilo animado (a forma `({pressed})=>[...]` some com o layout sob NativeWind).
      style={[st.chip, containerStyle]}
      accessibilityRole="button"
      accessibilityLabel={label}
    >
      <Animated.Text style={[st.chipText, textStyle]}>{label}</Animated.Text>
    </AnimatedPressable>
  );
});
HeaderChip.displayName = 'HeaderChip';

/**
 * Header estilo Netflix — barra fixa (marca + "Início" | sino + avatar) e uma fileira
 * de chips que COLAPSA ao rolar (altura+opacidade), com hairline surgindo pra separar
 * do conteúdo. Header nativo do Stack fica desligado (ver (home)/_layout).
 */
export const HomeHeader = React.memo(function HomeHeader({ scrollY, reveal }: Props) {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { user } = useAuth();

  // Tags dirigidas pelo SENTIDO do gesto (reveal 0→1), não pela posição — quick-return.
  const chipsStyle = useAnimatedStyle(() => ({
    height: interpolate(reveal.value, [0, 1], [0, HOME_CHIPS_H], Extrapolation.CLAMP),
    opacity: interpolate(reveal.value, [0, 1], [0, 1], Extrapolation.CLAMP),
    transform: [{ translateY: interpolate(reveal.value, [0, 1], [-8, 0], Extrapolation.CLAMP) }],
  }));

  const borderStyle = useAnimatedStyle(() => ({
    opacity: interpolate(scrollY.value, [0, 60], [0, 1], Extrapolation.CLAMP),
  }));

  // Fundo do header: transparente no topo (deixa o degradê da Home aparecer) → sólido ao rolar.
  const bgStyle = useAnimatedStyle(() => ({
    opacity: interpolate(scrollY.value, [0, 60], [0, 1], Extrapolation.CLAMP),
  }));

  return (
    <View style={[st.wrap, { paddingTop: insets.top }]} pointerEvents="box-none">
      <Animated.View style={[StyleSheet.absoluteFill, st.bg, bgStyle]} pointerEvents="none" />
      <View style={st.topbar}>
        <View style={st.left}>
          <Image source={ICON} style={st.brandIcon} contentFit="cover" />
          <AppWordmark />
        </View>
        <View style={st.right}>
          <NotificationBell color={SHEET.textPrimary} />
          <Pressable
            onPress={() => router.push('/(tabs)/(settings)/profile')}
            hitSlop={8}
            style={st.avatarRing}
            accessibilityRole="button"
            accessibilityLabel="Meu perfil"
          >
            <Avatar userId={user?.id} userAvatarID={user?.avatar} name={user?.first_name} size="sm" />
          </Pressable>
        </View>
      </View>

      <Animated.View style={[st.chipsWrap, chipsStyle]}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={st.chips}
          keyboardShouldPersistTaps="handled"
        >
          {CHIPS.map((c) => (
            <HeaderChip key={c.label} label={c.label} onPress={() => router.push(c.href as any)} />
          ))}
        </ScrollView>
      </Animated.View>

      <Animated.View style={[st.border, borderStyle]} pointerEvents="none" />
    </View>
  );
});

HomeHeader.displayName = 'HomeHeader';

const st = StyleSheet.create({
  wrap: { position: 'absolute', top: 0, left: 0, right: 0, zIndex: 50 },
  bg: { backgroundColor: SHEET.bgDeep },
  topbar: { height: HOME_TOPBAR_H, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 24 },
  left: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  brandIcon: { width: 30, height: 30, borderRadius: 8 },
  right: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  avatarRing: { padding: 2, borderRadius: 999, borderWidth: 1.5, borderColor: SHEET.brand },
  chipsWrap: { overflow: 'hidden', justifyContent: 'center' },
  chips: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingHorizontal: 24, paddingVertical: 4 },
  chip: {
    height: 38,
    paddingHorizontal: 16,
    borderRadius: 999,
    backgroundColor: SHEET.glass,
    borderWidth: 1,
    borderColor: SHEET.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  chipText: { color: SHEET.textSecondary, fontSize: 14, fontWeight: '600', lineHeight: 18, includeFontPadding: false, textAlignVertical: 'center' },
  border: { position: 'absolute', left: 0, right: 0, bottom: 0, height: StyleSheet.hairlineWidth, backgroundColor: SHEET.border },
});
