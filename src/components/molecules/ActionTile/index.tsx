import React, { memo } from 'react';
import { View, StyleSheet } from 'react-native';
import { Link } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Feather } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { Pressable } from '@/components/ui/pressable';
import { Text } from '@/components/ui/text';
import { hexToRgba, darken } from '@/utils/color';

export interface ActionTileProps {
  label: string;
  subtitle?: string;
  icon: keyof typeof Feather.glyphMap;
  route: string;
  variant?: 'feature' | 'compact';
  color?: string;
}

const TEXT = '#F9FAFB';

/**
 * Tile do "Acesso rápido". 'feature' = destaque grande com gradiente de marca;
 * 'compact' = tile do grid 2x2 com fundo tingido pela cor. Tique háptico no toque.
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

  const body = (
    <Pressable
      onPressIn={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)}
      accessibilityRole="button"
      accessibilityLabel={label}
      // Link asChild (SDK 56): o filho NÃO pode receber `style` em array -> achatar.
      style={StyleSheet.flatten([styles.tile, isFeature ? styles.feature : styles.compact])}
    >
      {isFeature ? (
        <LinearGradient
          colors={[color, darken(color, 45)]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={StyleSheet.absoluteFill}
        />
      ) : (
        <View
          style={[
            StyleSheet.absoluteFill,
            { backgroundColor: hexToRgba(color, 0.16), borderWidth: 1, borderColor: hexToRgba(color, 0.4) },
          ]}
        />
      )}

      <View style={[styles.iconChip, { backgroundColor: 'rgba(255,255,255,0.14)' }]}>
        <Feather name={icon} size={isFeature ? 24 : 20} color="#fff" />
      </View>

      {isFeature ? (
        <View style={styles.featureBody}>
          <Text style={styles.featureLabel} numberOfLines={1}>{label}</Text>
          {subtitle && <Text style={styles.featureSub} numberOfLines={1}>{subtitle}</Text>}
        </View>
      ) : (
        <Text style={styles.compactLabel} numberOfLines={1}>{label}</Text>
      )}

      {isFeature && <Feather name="chevron-right" size={22} color="rgba(255,255,255,0.9)" />}
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
  tile: {
    borderRadius: 16,
    overflow: 'hidden',
    justifyContent: 'center',
  },
  feature: {
    height: 92,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    gap: 14,
  },
  compact: {
    height: 92,
    paddingHorizontal: 14,
    paddingVertical: 12,
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  iconChip: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  featureBody: { flex: 1 },
  featureLabel: { color: TEXT, fontSize: 17, fontWeight: '800' },
  featureSub: { color: 'rgba(255,255,255,0.85)', fontSize: 13, marginTop: 2 },
  compactLabel: { color: TEXT, fontSize: 15, fontWeight: '700' },
});
