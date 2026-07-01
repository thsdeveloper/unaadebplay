import React, { memo } from 'react';
import { View, StyleSheet } from 'react-native';
// Link asChild (SDK 56): filho não pode receber `style` em array -> achatar sempre.
import { Link } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { Pressable } from '@/components/ui/pressable';
import { Text } from '@/components/ui/text';
import type { HeroCta } from '@/components/organisms/HomeHero/buildHeroSlides';

interface Props {
  primary: HeroCta;
  secondary?: HeroCta;
  /** Cor da marca do slide — tinge o texto/ícone do CTA primário. */
  primaryColor?: string;
}

const haptic = () => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

/** CTAs do hero: primário sólido (branco) + secundário "vidro". */
export const HeroCTAButtons = memo<Props>(({ primary, secondary, primaryColor = '#111827' }) => (
  <View style={styles.row}>
    <Link href={primary.route as any} asChild>
      <Pressable onPressIn={haptic} accessibilityRole="button" accessibilityLabel={primary.label} style={StyleSheet.flatten([styles.btn, styles.primary])}>
        <Feather name="play" size={16} color={primaryColor} />
        <Text style={[styles.primaryLabel, { color: primaryColor }]}>{primary.label}</Text>
      </Pressable>
    </Link>

    {secondary && (
      <Link href={secondary.route as any} asChild>
        <Pressable onPressIn={haptic} accessibilityRole="button" accessibilityLabel={secondary.label} style={StyleSheet.flatten([styles.btn, styles.secondary])}>
          <Feather name="info" size={16} color="#F9FAFB" />
          <Text style={styles.secondaryLabel}>{secondary.label}</Text>
        </Pressable>
      </Link>
    )}
  </View>
));

HeroCTAButtons.displayName = 'HeroCTAButtons';

const styles = StyleSheet.create({
  row: { flexDirection: 'row', gap: 10, marginTop: 16 },
  btn: {
    height: 46,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingHorizontal: 18,
  },
  primary: { backgroundColor: '#F9FAFB' },
  primaryLabel: { fontSize: 15, fontWeight: '800' },
  secondary: {
    backgroundColor: 'rgba(255,255,255,0.18)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.10)',
  },
  secondaryLabel: { color: '#F9FAFB', fontSize: 15, fontWeight: '700' },
});
