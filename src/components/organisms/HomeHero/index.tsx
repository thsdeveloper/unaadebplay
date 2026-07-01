import React, { memo, useEffect, useState } from 'react';
import { View, Dimensions, StyleSheet, AccessibilityInfo } from 'react-native';
import Carousel from 'react-native-reanimated-carousel';
import { LinearGradient } from 'expo-linear-gradient';
import { Feather } from '@expo/vector-icons';
import { Text } from '@/components/ui/text';
import { DirectusImage } from '@/components/DirectusImage';
import { HeroCTAButtons } from '@/components/molecules/HeroCTAButtons';
import { hexToRgba, darken } from '@/utils/color';
import type { HeroSlide } from './buildHeroSlides';
import type { SectionStatus } from '@/hooks/useHomeFeed';

const { width: SCREEN_W, height: SCREEN_H } = Dimensions.get('window');
const HERO_H = Math.round(SCREEN_H * 0.62);
const BG = '#0D0F17';
const GOLD = '#FFD700';

/** Um slide do hero: imagem full-bleed + scrims + wash de marca + conteúdo. */
const HeroSlideView = memo<{ slide: HeroSlide }>(({ slide }) => (
  <View style={{ width: SCREEN_W, height: HERO_H, backgroundColor: BG }}>
    {slide.image ? (
      <DirectusImage
        assetId={slide.image}
        bucket={slide.bucket}
        width={SCREEN_W}
        height={HERO_H}
        resizeMode="cover"
        priority="high"
      />
    ) : (
      <LinearGradient
        colors={[slide.primaryColor, darken(slide.primaryColor, 60)]}
        style={StyleSheet.absoluteFill}
      />
    )}

    {/* Scrim superior — legibilidade do header transparente */}
    <LinearGradient
      colors={['rgba(13,15,23,0.55)', 'transparent']}
      style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 150 }}
    />
    {/* Scrim inferior + wash de marca, derretendo no fundo do feed */}
    <LinearGradient
      colors={['transparent', hexToRgba(slide.secondColor, 0.45), 'rgba(13,15,23,0.85)', BG]}
      locations={[0, 0.5, 0.82, 1]}
      style={{ position: 'absolute', left: 0, right: 0, bottom: 0, height: Math.round(HERO_H * 0.78) }}
    />

    <View style={styles.content}>
      {!!slide.eyebrow && <Text style={styles.eyebrow}>{slide.eyebrow}</Text>}
      <Text style={styles.title} numberOfLines={2}>{slide.title}</Text>
      {!!slide.theme && <Text style={styles.theme} numberOfLines={2}>{slide.theme}</Text>}

      {(slide.dateRange || slide.statusHospedagem) && (
        <View style={styles.chipRow}>
          {!!slide.dateRange && (
            <View style={styles.chip}>
              <Feather name="calendar" size={13} color="#F9FAFB" />
              <Text style={styles.chipText}>{slide.dateRange}</Text>
            </View>
          )}
          {slide.statusHospedagem && (
            <View style={[styles.chip, styles.goldChip]}>
              <Feather name="home" size={13} color={GOLD} />
              <Text style={[styles.chipText, { color: GOLD }]}>Hospedagem aberta</Text>
            </View>
          )}
        </View>
      )}

      <HeroCTAButtons
        primary={slide.primaryCta}
        secondary={slide.secondaryCta}
        primaryColor={darken(slide.primaryColor, 10)}
      />
    </View>
  </View>
));
HeroSlideView.displayName = 'HeroSlideView';

interface Props {
  slides: HeroSlide[];
  status: SectionStatus;
}

/** Billboard cinematográfico do topo. Estático com 1 slide; carrossel com >1. */
export const HomeHero = memo<Props>(({ slides, status }) => {
  const [reduceMotion, setReduceMotion] = useState(false);
  const [screenReader, setScreenReader] = useState(false);
  useEffect(() => {
    AccessibilityInfo.isReduceMotionEnabled().then(setReduceMotion).catch(() => {});
    AccessibilityInfo.isScreenReaderEnabled().then(setScreenReader).catch(() => {});
    const s1 = AccessibilityInfo.addEventListener('reduceMotionChanged', setReduceMotion);
    const s2 = AccessibilityInfo.addEventListener('screenReaderChanged', setScreenReader);
    return () => {
      s1.remove();
      s2.remove();
    };
  }, []);

  if (status === 'loading') {
    return <View style={{ width: SCREEN_W, height: HERO_H, backgroundColor: '#111827' }} />;
  }

  if (!slides.length) {
    return (
      <View style={{ width: SCREEN_W, height: Math.round(HERO_H * 0.7) }}>
        <LinearGradient colors={['#E51C44', '#B0143A']} style={StyleSheet.absoluteFill} />
        <View style={styles.splash}>
          <Text style={styles.splashText}>Unaadeb Play</Text>
        </View>
      </View>
    );
  }

  if (slides.length === 1) {
    return <HeroSlideView slide={slides[0]} />;
  }

  return (
    <Carousel
      data={slides}
      renderItem={({ item }: { item: HeroSlide }) => <HeroSlideView slide={item} />}
      width={SCREEN_W}
      height={HERO_H}
      loop
      autoPlay={!reduceMotion && !screenReader}
      autoPlayInterval={6000}
      scrollAnimationDuration={800}
    />
  );
});
HomeHero.displayName = 'HomeHero';

const styles = StyleSheet.create({
  content: { position: 'absolute', left: 20, right: 20, bottom: 24 },
  eyebrow: { color: GOLD, fontSize: 12, fontWeight: '800', letterSpacing: 1.5, marginBottom: 6 },
  title: { color: '#F9FAFB', fontSize: 32, fontWeight: '800', lineHeight: 37 },
  theme: { color: '#D1D5DB', fontSize: 15, marginTop: 6, lineHeight: 20 },
  chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 12 },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(255,255,255,0.10)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.14)',
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  goldChip: { backgroundColor: 'rgba(255,215,0,0.14)', borderColor: 'rgba(255,215,0,0.5)' },
  chipText: { color: '#F9FAFB', fontSize: 12.5, fontWeight: '600' },
  splash: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, alignItems: 'center', justifyContent: 'center' },
  splashText: { color: '#fff', fontSize: 28, fontWeight: '800', letterSpacing: 0.5 },
});
