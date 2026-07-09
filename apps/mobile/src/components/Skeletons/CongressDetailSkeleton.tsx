import React, { useEffect } from 'react';
import { View, StyleSheet, type DimensionValue, type StyleProp, type ViewStyle } from 'react-native';
import Animated, { useSharedValue, useAnimatedStyle, withRepeat, withTiming, Easing } from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { SHEET } from '@/constants/sheetTokens';

const HERO_HEIGHT = 360; // igual ao detalhe real
const BLOCK = 'rgba(255,255,255,0.07)'; // tom dos placeholders sobre o fundo dark

/** Barra/placeholder retangular. */
const Bar = ({ w, h = 14, r = 7, style }: { w: DimensionValue; h?: number; r?: number; style?: StyleProp<ViewStyle> }) => (
  <View style={[{ width: w, height: h, borderRadius: r, backgroundColor: BLOCK }, style]} />
);

/**
 * Skeleton do detalhe do congresso (padrão SHEET dark). Espelha a estrutura real —
 * hero + título, botão de CTA, cards de info/sobre, link de repertório e a fileira de
 * convidados — para dar FORMA à tela antes dos dados (menos "flash" que um spinner).
 * Um único pulso de opacidade (reanimated, UI thread) anima o conjunto: barato e suave.
 */
export const CongressDetailSkeleton: React.FC = () => {
  const pulse = useSharedValue(0.55);
  useEffect(() => {
    pulse.value = withRepeat(withTiming(1, { duration: 850, easing: Easing.inOut(Easing.ease) }), -1, true);
  }, [pulse]);
  const pulseStyle = useAnimatedStyle(() => ({ opacity: pulse.value }));

  return (
    <Animated.View style={[styles.root, pulseStyle]} pointerEvents="none">
      {/* HERO — imagem + scrim + bloco de título */}
      <View style={styles.hero}>
        <LinearGradient colors={['transparent', 'rgba(13,15,23,0.55)', SHEET.bg]} style={styles.heroScrim} />
        <View style={styles.heroContent}>
          <Bar w={92} h={12} r={6} />
          <Bar w="82%" h={26} r={8} style={{ marginTop: 10 }} />
          <Bar w="55%" h={26} r={8} style={{ marginTop: 6 }} />
          <Bar w="70%" h={15} r={7} style={{ marginTop: 10 }} />
          <Bar w={150} h={30} r={999} style={{ marginTop: 10 }} />
        </View>
      </View>

      <View style={styles.body}>
        {/* CTA (hospedagem / cartão) */}
        <View style={styles.ctaBtn} />

        {/* Card INFO — 2 linhas (quando + hospedagem) */}
        <View style={styles.card}>
          <View style={styles.row}>
            <View style={styles.iconBox} />
            <View style={styles.rowText}>
              <Bar w={70} h={10} r={5} />
              <Bar w="58%" h={14} r={7} />
            </View>
          </View>
          <View style={styles.divider} />
          <View style={styles.row}>
            <View style={styles.iconBox} />
            <View style={styles.rowText}>
              <Bar w={90} h={10} r={5} />
              <Bar w="50%" h={14} r={7} />
            </View>
          </View>
        </View>

        {/* Card SOBRE — cabeçalho + linhas de texto */}
        <View style={styles.card}>
          <View style={styles.sectionHeader}>
            <View style={styles.iconSm} />
            <Bar w={160} h={15} r={7} />
          </View>
          <Bar w="100%" h={12} r={6} style={{ marginTop: 4 }} />
          <Bar w="96%" h={12} r={6} style={{ marginTop: 8 }} />
          <Bar w="80%" h={12} r={6} style={{ marginTop: 8 }} />
        </View>

        {/* Link REPERTÓRIO */}
        <View style={styles.linkCard}>
          <View style={styles.iconBox} />
          <View style={styles.rowText}>
            <Bar w="50%" h={14} r={7} />
            <Bar w="40%" h={12} r={6} />
          </View>
        </View>
      </View>

      {/* CONVIDADOS — cabeçalho + fileira de cards */}
      <View style={styles.guestsWrap}>
        <View style={styles.guestsHeader}>
          <View style={styles.iconSm} />
          <Bar w={180} h={15} r={7} />
        </View>
        <View style={styles.guestsRow}>
          {[0, 1, 2, 3].map((i) => (
            <View key={i} style={styles.guestCard}>
              <View style={styles.guestAvatar} />
              <Bar w={64} h={12} r={6} style={{ marginTop: 10 }} />
              <Bar w={44} h={10} r={5} style={{ marginTop: 6 }} />
            </View>
          ))}
        </View>
      </View>
    </Animated.View>
  );
};

CongressDetailSkeleton.displayName = 'CongressDetailSkeleton';

const styles = StyleSheet.create({
  root: { flex: 1 },
  hero: { height: HERO_HEIGHT, width: '100%', backgroundColor: SHEET.bgDeep },
  heroScrim: { position: 'absolute', left: 0, right: 0, bottom: 0, height: HERO_HEIGHT * 0.8 },
  heroContent: { position: 'absolute', left: 16, right: 16, bottom: 16 },
  body: { paddingHorizontal: 16, paddingTop: 16, gap: 14 },
  ctaBtn: { height: 56, borderRadius: 18, backgroundColor: BLOCK },
  card: { borderRadius: 18, backgroundColor: SHEET.glass, borderWidth: 1, borderColor: SHEET.border, padding: 14 },
  divider: { height: 1, backgroundColor: SHEET.hairline, marginVertical: 12 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  rowText: { flex: 1, gap: 8 },
  iconBox: { width: 40, height: 40, borderRadius: 12, backgroundColor: BLOCK },
  iconSm: { width: 22, height: 22, borderRadius: 6, backgroundColor: BLOCK },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 12 },
  linkCard: {
    flexDirection: 'row', alignItems: 'center', gap: 12, borderRadius: 18, padding: 14,
    backgroundColor: SHEET.glass, borderWidth: 1, borderColor: SHEET.border,
  },
  guestsWrap: { marginTop: 18 },
  guestsHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: 16, marginBottom: 12 },
  guestsRow: { flexDirection: 'row', paddingHorizontal: 16, gap: 14 },
  guestCard: { width: 92, alignItems: 'center' },
  guestAvatar: { width: 66, height: 66, borderRadius: 999, backgroundColor: BLOCK },
});
