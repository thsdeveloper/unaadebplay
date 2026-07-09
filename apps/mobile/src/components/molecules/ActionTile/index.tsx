import React, { memo, useEffect, useMemo } from 'react';
import { View, StyleSheet } from 'react-native';
import { Link } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Feather } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  withDelay,
  interpolate,
  Easing,
} from 'react-native-reanimated';
import { Pressable } from '@/components/ui/pressable';
import { Text } from '@/components/ui/text';
import { hexToRgba, darken, lighten } from '@/utils/color';

const AnimatedGradient = Animated.createAnimatedComponent(LinearGradient);

export interface ActionTileProps {
  label: string;
  subtitle?: string;
  icon: keyof typeof Feather.glyphMap;
  route: string;
  variant?: 'feature' | 'compact';
  color?: string;
}

const TEXT = '#F9FAFB';

/** Fase determinística (0..1) a partir do rótulo → escalona a animação entre os cards. */
function phaseFromLabel(label: string): number {
  let sum = 0;
  for (let i = 0; i < label.length; i++) sum += label.charCodeAt(i);
  return (sum % 10) / 10;
}

/**
 * Tile do "Acesso rápido" com DEGRADÊ VIVO: uma segunda camada de gradiente (ângulo e
 * tons diferentes) que respira por cima da base — desliza, gira de leve e cross-fade —
 * fazendo o degradê fluir/morfar suavemente, sem orbes nem brilho varrendo.
 * Respeita o Link asChild (Pressable = filho único, style achatado; os visuais animados
 * vivem num Animated.View interno). Toque com mola + háptico.
 */
export const ActionTile = memo<ActionTileProps>(({
  label,
  subtitle,
  icon,
  route,
  variant = 'compact',
  color = '#E51C44',
}) => {
  const isFeature = variant === 'feature';
  const phase = useMemo(() => phaseFromLabel(label), [label]);

  const press = useSharedValue(0);
  const flow = useSharedValue(0);

  useEffect(() => {
    flow.value = withDelay(
      phase * 1600,
      withRepeat(withTiming(1, { duration: 5200, easing: Easing.inOut(Easing.ease) }), -1, true),
    );
  }, [flow, phase]);

  const cardStyle = useAnimatedStyle(() => ({ transform: [{ scale: 1 - press.value * 0.035 }] }));

  // Camada de degradê que flui: opacidade + deslize + leve rotação/escala (oversized p/ nunca
  // revelar os cantos do card).
  const flowStyle = useAnimatedStyle(() => ({
    opacity: interpolate(flow.value, [0, 1], [0.1, 0.9]),
    transform: [
      { scale: interpolate(flow.value, [0, 1], [1.25, 1.1]) },
      { translateX: interpolate(flow.value, [0, 1], [-14, 12]) },
      { translateY: interpolate(flow.value, [0, 1], [10, -8]) },
      { rotate: `${interpolate(flow.value, [0, 1], [-5, 5])}deg` },
    ] as any,
  }));

  // Gradientes base (A) e de fluxo (B) — B tem ângulo/tons diferentes p/ o morph aparecer.
  const baseColors: [string, string, string] = isFeature
    ? [lighten(color, 20), color, darken(color, 48)]
    : [hexToRgba(color, 0.20), hexToRgba(color, 0.10), 'transparent'];
  const flowColors: [string, string, string] = isFeature
    ? [darken(color, 22), hexToRgba(lighten(color, 20), 0.9), 'transparent']
    : [hexToRgba(lighten(color, 40), 0.42), 'transparent', hexToRgba(color, 0.18)];

  const body = (
    <Pressable
      onPressIn={() => {
        press.value = withTiming(1, { duration: 90 });
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      }}
      onPressOut={() => { press.value = withTiming(0, { duration: 170 }); }}
      accessibilityRole="button"
      accessibilityLabel={label}
      // Link asChild (SDK 56): filho NÃO pode receber `style` em array -> achatar.
      style={StyleSheet.flatten([styles.hit, { height: 96 }])}
    >
      <Animated.View style={[styles.card, cardStyle]}>
        {/* Degradê base (identidade da cor) */}
        <LinearGradient
          colors={baseColors}
          locations={[0, 0.5, 1]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={StyleSheet.absoluteFill}
        />

        {/* Degradê que flui por cima (ângulo oposto + tons diferentes) */}
        <AnimatedGradient
          colors={flowColors}
          locations={[0, 0.55, 1]}
          start={{ x: 1, y: 0 }}
          end={{ x: 0, y: 1 }}
          style={[styles.flowLayer, flowStyle]}
          pointerEvents="none"
        />

        {/* Borda tingida só no compact (define o card sobre a home escura) */}
        {!isFeature && <View pointerEvents="none" style={[StyleSheet.absoluteFill, styles.compactBorder, { borderColor: hexToRgba(color, 0.4) }]} />}

        {/* Realce superior (vidro) */}
        <View pointerEvents="none" style={styles.topHighlight} />

        {/* Conteúdo */}
        {isFeature ? (
          <View style={styles.featureRow}>
            <View style={styles.iconChip}>
              <Feather name={icon} size={24} color="#fff" />
            </View>
            <View style={styles.featureBody}>
              <Text style={styles.featureLabel} numberOfLines={1}>{label}</Text>
              {subtitle && <Text style={styles.featureSub} numberOfLines={1}>{subtitle}</Text>}
            </View>
            <View style={styles.chevronChip}>
              <Feather name="chevron-right" size={20} color="rgba(255,255,255,0.95)" />
            </View>
          </View>
        ) : (
          <View style={styles.compactCol}>
            <View style={styles.iconChip}>
              <Feather name={icon} size={20} color="#fff" />
            </View>
            <Text style={styles.compactLabel} numberOfLines={1}>{label}</Text>
          </View>
        )}
      </Animated.View>
    </Pressable>
  );

  return (
    <Link href={route as any} asChild>
      {body}
    </Link>
  );
});

ActionTile.displayName = 'ActionTile';

const styles = StyleSheet.create({
  hit: { borderRadius: 20 },
  card: {
    flex: 1,
    borderRadius: 20,
    overflow: 'hidden',
    justifyContent: 'center',
  },
  // camada de fluxo — oversized p/ nunca revelar cantos ao girar/escalar
  flowLayer: { position: 'absolute', top: -46, left: -46, right: -46, bottom: -46 },
  compactBorder: { borderRadius: 20, borderWidth: 1 },
  topHighlight: {
    position: 'absolute',
    top: 0, left: 0, right: 0, height: 1,
    backgroundColor: 'rgba(255,255,255,0.22)',
  },
  // conteúdo — feature
  featureRow: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, gap: 14 },
  featureBody: { flex: 1 },
  featureLabel: { color: TEXT, fontSize: 17, fontWeight: '800' },
  featureSub: { color: 'rgba(255,255,255,0.9)', fontSize: 13, marginTop: 2 },
  chevronChip: {
    width: 32, height: 32, borderRadius: 16,
    alignItems: 'center', justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.16)',
  },
  // conteúdo — compact
  compactCol: { paddingHorizontal: 14, paddingVertical: 12, justifyContent: 'space-between', flex: 1, alignItems: 'flex-start' },
  compactLabel: { color: TEXT, fontSize: 15, fontWeight: '700' },
  // ícone
  iconChip: {
    width: 44, height: 44, borderRadius: 13,
    alignItems: 'center', justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.16)',
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.18)',
  },
});
