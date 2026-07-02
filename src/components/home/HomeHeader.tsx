import React from 'react';
import { View, Text as RNText, Pressable, ScrollView, StyleSheet } from 'react-native';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, { useAnimatedStyle, interpolate, Extrapolation, type SharedValue } from 'react-native-reanimated';
import { Avatar } from '@/components/Avatar';
import { NotificationBell } from '@/components/NotificationBell';
import { useAuth } from '@/contexts/AuthContext';
import { SHEET } from '@/constants/sheetTokens';

const ICON = require('@/assets/icon.png');

export const HOME_TOPBAR_H = 50;
export const HOME_CHIPS_H = 42;
/** Altura do header (sem a safe area) — a Home usa para o paddingTop do conteúdo. */
export const HOME_HEADER_H = HOME_TOPBAR_H + HOME_CHIPS_H;

const CHIPS: { label: string; href: string }[] = [
  { label: 'Eventos', href: '/(tabs)/(events)' },
  { label: 'Notícias', href: '/(tabs)/(posts)' },
  { label: 'Repertórios', href: '/(tabs)/(home)/repertories' },
  { label: 'Contribua', href: '/(tabs)/(home)/contribua' },
];

interface Props {
  /** Offset vertical do scroll (UI thread). */
  scrollY: SharedValue<number>;
}

/**
 * Header estilo Netflix — barra fixa (marca + "Início" | sino + avatar) e uma fileira
 * de chips que COLAPSA ao rolar (altura+opacidade), com hairline surgindo pra separar
 * do conteúdo. Header nativo do Stack fica desligado (ver (home)/_layout).
 */
export const HomeHeader = React.memo(function HomeHeader({ scrollY }: Props) {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { user } = useAuth();

  const chipsStyle = useAnimatedStyle(() => ({
    height: interpolate(scrollY.value, [0, 44], [HOME_CHIPS_H, 0], Extrapolation.CLAMP),
    opacity: interpolate(scrollY.value, [0, 32], [1, 0], Extrapolation.CLAMP),
    transform: [{ translateY: interpolate(scrollY.value, [0, 44], [0, -8], Extrapolation.CLAMP) }],
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
          <RNText style={st.title}>Início</RNText>
        </View>
        <View style={st.right}>
          <NotificationBell color={SHEET.textPrimary} />
          <Pressable
            onPress={() => router.push('/modal')}
            hitSlop={8}
            style={st.avatarRing}
            accessibilityRole="button"
            accessibilityLabel="Minha conta"
          >
            <Avatar userAvatarID={user?.avatar} name={user?.first_name} size="sm" />
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
            <Pressable
              key={c.label}
              onPress={() => router.push(c.href as any)}
              style={st.chip}
              accessibilityRole="button"
              accessibilityLabel={c.label}
            >
              <RNText style={st.chipText}>{c.label}</RNText>
            </Pressable>
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
  title: { color: SHEET.textPrimary, fontSize: 22, fontWeight: '800', letterSpacing: 0.2 },
  right: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  avatarRing: { padding: 2, borderRadius: 999, borderWidth: 1.5, borderColor: SHEET.brand },
  chipsWrap: { overflow: 'hidden', justifyContent: 'center' },
  chips: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingHorizontal: 24 },
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
