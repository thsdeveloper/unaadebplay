import React, { memo, useCallback, useEffect, useRef, useState } from 'react';
import { View, Pressable, Dimensions, StyleSheet, AccessibilityInfo } from 'react-native';
import { useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';
import Carousel, { type ICarouselInstance } from 'react-native-reanimated-carousel';
import Animated, { useAnimatedStyle, useSharedValue, withTiming, withRepeat, interpolate, Easing, cancelAnimation } from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { Feather } from '@expo/vector-icons';
import { Text } from '@/components/ui/text';
import { DirectusImage } from '@/components/DirectusImage';
import { useDeviceTilt, type DeviceTilt } from '@/hooks/useDeviceTilt';
import { darken } from '@/utils/color';
import { SHEET } from '@/constants/sheetTokens';
import type { HeroSlide } from './buildHeroSlides';
import type { SectionStatus } from '@/hooks/useHomeFeed';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

const { width: SCREEN_W } = Dimensions.get('window');
const CARD_MARGIN = 20;
const CARD_W = SCREEN_W - CARD_MARGIN * 2;
const CARD_H = Math.round(CARD_W * 1.42); // cartaz retrato (estilo Netflix)
const RADIUS = 22;
const BG = '#0D0F17';
const GOLD = '#FFD700';
const ACCENT = SHEET.brand; // cor accent da identidade visual (#E51C44)

/* ─────────────────────────────────────────────────────────────────────────────
 * Estratégia "PEEK" (App Store "Today" / Netflix billboard)
 * ---------------------------------------------------------------------------
 * O card ativo fica menor que a tela e revela uma FATIA do próximo/anterior nas
 * laterais. O conteúdo "cortado" é uma AFFORDANCE: sinaliza "tem mais, arraste".
 * O respiro lateral (W·(1−escala)/2) se reparte em GUTTER (calha de fundo entre os
 * cards) + PEEK (fatia visível). Escala 0.85 abre esse orçamento; o offset (~0.15·W)
 * posiciona o vizinho p/ sobrar peek ~20px + calha ~10px, proporcional à tela.
 * ──────────────────────────────────────────────────────────────────────────── */
const PEEK_SCALE = 0.85;
const PEEK_OFFSET = Math.round(SCREEN_W * 0.15);
const PEEK_ADJACENT_SCALE = 0.8;

// Brilho gyroscópico (Netflix): banda de luz que desliza + inclina com o movimento do
// aparelho. Sem moldura no cartaz; movimento amplo e mais luminoso (a pedido).
const GLARE_TRAVEL = 84; // deslocamento máx. da banda de luz (px)

// Vazio vertical que o parallax cria acima/abaixo do card (ele fica centralizado após a
// escala). Usado para puxar os dots pra perto do cartaz (gap real ≈ 8px, não ~37px).
const PARALLAX_V_EMPTY = Math.round((CARD_H * (1 - PEEK_SCALE)) / 2);
const DOTS_MARGIN_TOP = 8 - PARALLAX_V_EMPTY;

/**
 * Um slide do hero como CARTAZ CLICÁVEL: o card inteiro navega para a página do
 * congresso (não só um botão). Moldura-degradê + imagem + brilho + scrims + conteúdo,
 * com feedback de press ("over"): leve scale + brilho branco que acende ao tocar.
 */
const HeroSlideView = memo<{ slide: HeroSlide; width: number; height: number; tilt: DeviceTilt }>(
  ({ slide, width, height, tilt }) => {
    const router = useRouter();
    // Sem moldura: imagem/scrim usam a largura/altura cheias do card.
    const cw = width;
    const ch = height;
    const press = useSharedValue(0);

    // Banda de luz gyroscópica: translada AMPLO + INCLINA com o tilt e fica mais luminosa
    // com o movimento — sensação de "luz varrendo" o cartaz.
    const glareStyle = useAnimatedStyle(() => {
      const tx = interpolate(tilt.x.value, [-1, 1], [GLARE_TRAVEL, -GLARE_TRAVEL]);
      const ty = interpolate(tilt.y.value, [-1, 1], [GLARE_TRAVEL * 0.6, -GLARE_TRAVEL * 0.6]);
      const rot = interpolate(tilt.x.value, [-1, 1], [-12, 12]);
      const mag = Math.min(1, Math.sqrt(tilt.x.value * tilt.x.value + tilt.y.value * tilt.y.value));
      // `as any`: RN tipa transform como união estrita; o array misto não casa.
      return { opacity: 0.16 + mag * 0.34, transform: [{ translateX: tx }, { translateY: ty }, { rotate: `${rot}deg` }] as any };
    });

    // Feedback de press ("over"): card encolhe de leve e o overlay branco acende.
    const pressStyle = useAnimatedStyle(() => ({ transform: [{ scale: 1 - press.value * 0.025 }] }));
    const overlayStyle = useAnimatedStyle(() => ({ opacity: press.value * 0.09 }));
    const onPressIn = useCallback(() => { press.value = withTiming(1, { duration: 90 }); }, [press]);
    const onPressOut = useCallback(() => { press.value = withTiming(0, { duration: 220 }); }, [press]);
    const onPress = useCallback(() => {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      router.push(slide.primaryCta.route as any);
    }, [router, slide.primaryCta.route]);

    return (
      <AnimatedPressable
        onPress={onPress}
        onPressIn={onPressIn}
        onPressOut={onPressOut}
        style={pressStyle}
        accessibilityRole="button"
        accessibilityLabel={`Abrir ${slide.title}`}
      >
        <View style={[styles.card, { width, height }]}>
          {slide.image ? (
            <DirectusImage assetId={slide.image} bucket={slide.bucket} width={cw} height={ch} resizeMode="cover" priority="high" />
          ) : (
            <LinearGradient colors={[slide.primaryColor, darken(slide.primaryColor, 60)]} style={StyleSheet.absoluteFill} />
          )}

          {/* Brilho gyroscópico — banda diagonal de luz suave, superdimensionada para que
              o deslocamento nunca revele borda dura (o card recorta com overflow:hidden). */}
          <Animated.View pointerEvents="none" style={[styles.glareWrap, glareStyle]}>
            <LinearGradient
              colors={['transparent', 'rgba(255,255,255,0.66)', 'transparent']}
              locations={[0.36, 0.5, 0.64]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0.9 }}
              style={StyleSheet.absoluteFill}
            />
          </Animated.View>

          {/* Scrim ESCURO — contraste do texto/CTAs sobre o cartaz (que é muito "cheio"). */}
          <LinearGradient
            colors={['transparent', 'rgba(13,15,23,0.45)', 'rgba(13,15,23,0.86)', 'rgba(13,15,23,0.98)']}
            locations={[0, 0.35, 0.68, 1]}
            style={{ position: 'absolute', left: 0, right: 0, bottom: 0, height: Math.round(ch * 0.9) }}
          />

          {/* Overlay de press ("over"): brilho branco que acende ao tocar o cartaz. */}
          <Animated.View pointerEvents="none" style={[styles.pressOverlay, overlayStyle]} />

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

          </View>
        </View>
      </AnimatedPressable>
    );
  },
);
HeroSlideView.displayName = 'HeroSlideView';

/** Indicador de páginas (dots) — 2ª affordance: mostra QUANTOS cartazes existem. */
const HeroDots = memo<{ count: number; index: number; onDot: (i: number) => void }>(({ count, index, onDot }) => (
  <View style={styles.dots} pointerEvents="box-none">
    {Array.from({ length: count }).map((_, i) => (
      <Pressable
        key={i}
        hitSlop={8}
        onPress={() => onDot(i)}
        accessibilityRole="button"
        accessibilityLabel={`Ir para o cartaz ${i + 1} de ${count}`}
      >
        <View style={[styles.dot, i === index ? styles.dotActive : styles.dotIdle]} />
      </Pressable>
    ))}
  </View>
));
HeroDots.displayName = 'HeroDots';

/**
 * Placeholder animado do cartaz enquanto os banners carregam. Uma BANDA DE LUZ diagonal
 * varre o card em loop (o "flash passando") sobre blocos que imitam o pôster + texto +
 * chip, então o vazio lê como "carregando" e não como área morta. Respeita reduzir-movimento
 * (sem sweep, só os blocos estáticos) e é limpo no unmount (cancelAnimation).
 */
const HeroSkeleton = memo<{ animate: boolean }>(({ animate }) => {
  const sweep = useSharedValue(0);

  useEffect(() => {
    if (!animate) return;
    sweep.value = withRepeat(withTiming(1, { duration: 1300, easing: Easing.inOut(Easing.ease) }), -1, false);
    return () => cancelAnimation(sweep);
  }, [animate, sweep]);

  const sweepStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: interpolate(sweep.value, [0, 1], [-CARD_W * 1.15, CARD_W * 1.15]) }],
  }));

  return (
    <View style={styles.stage}>
      <View style={[styles.card, styles.skeleton, { width: CARD_W, height: CARD_H }]}>
        {/* Base com leve profundidade (topo mais claro → base mais escura). */}
        <LinearGradient colors={['#182034', '#0E1424']} style={StyleSheet.absoluteFill} />

        {/* Blocos-fantasma: eyebrow, 2 linhas de título, chip — na mesma posição do conteúdo real. */}
        <View style={styles.content}>
          <View style={[styles.skelBlock, { width: 90, height: 12, marginBottom: 14 }]} />
          <View style={[styles.skelBlock, { width: '80%', height: 26, marginBottom: 9 }]} />
          <View style={[styles.skelBlock, { width: '52%', height: 26, marginBottom: 16 }]} />
          <View style={[styles.skelBlock, { width: 138, height: 30, borderRadius: 999 }]} />
        </View>

        {/* Banda de luz que varre o card (clipada pelo overflow:hidden do card). */}
        {animate && (
          <Animated.View pointerEvents="none" style={[StyleSheet.absoluteFill, sweepStyle]}>
            <LinearGradient
              colors={['transparent', 'rgba(255,255,255,0.10)', 'transparent']}
              locations={[0.35, 0.5, 0.65]}
              start={{ x: 0, y: 0.15 }}
              end={{ x: 1, y: 0.85 }}
              style={StyleSheet.absoluteFill}
            />
          </Animated.View>
        )}
      </View>

      {/* Dots-fantasma — mesma affordance da barra real (1 ativo + 2 idle). */}
      <View style={[styles.dots, { marginTop: 12 }]}>
        {[0, 1, 2].map((i) => (
          <View key={i} style={[styles.dot, i === 0 ? styles.skelDotActive : styles.skelDotIdle]} />
        ))}
      </View>
    </View>
  );
});
HeroSkeleton.displayName = 'HeroSkeleton';

interface Props {
  slides: HeroSlide[];
  status: SectionStatus;
}

/** Cartaz principal (billboard) da Home. Carrossel com "peek" quando há >1 slide. */
export const HomeHero = memo<Props>(({ slides, status }) => {
  const [reduceMotion, setReduceMotion] = useState(false);
  const [screenReader, setScreenReader] = useState(false);
  const [index, setIndex] = useState(0);
  const ref = useRef<ICarouselInstance>(null);
  // Giroscópio para o brilho — desligado com "reduzir movimento"/leitor de tela.
  const tilt = useDeviceTilt(!reduceMotion && !screenReader);

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
    return <HeroSkeleton animate={!reduceMotion && !screenReader} />;
  }

  if (!slides.length) {
    return (
      <View style={styles.stage}>
        <View style={[styles.card, { width: CARD_W, height: CARD_H }]}>
          <LinearGradient colors={['#E51C44', '#B0143A']} style={StyleSheet.absoluteFill} />
          <View style={styles.splash}>
            <Text style={styles.splashText}>Unaadeb Play</Text>
          </View>
        </View>
      </View>
    );
  }

  // Slide único: sem peek (não há para onde rolar) → cartaz cheio, centralizado.
  if (slides.length === 1) {
    return (
      <View style={styles.stage}>
        <HeroSlideView slide={slides[0]} width={CARD_W} height={CARD_H} tilt={tilt} />
      </View>
    );
  }

  return (
    <View style={styles.carouselWrap}>
      <Carousel
        ref={ref}
        data={slides}
        // Peek simétrico centralizado: escala uniforme (poster intacto) + offset.
        mode="parallax"
        modeConfig={{
          parallaxScrollingScale: PEEK_SCALE,
          parallaxScrollingOffset: PEEK_OFFSET,
          parallaxAdjacentItemScale: PEEK_ADJACENT_SCALE,
        }}
        renderItem={({ item }: { item: HeroSlide }) => (
          // O slot tem a largura da tela; a fresta lateral (peek) nasce da escala.
          <HeroSlideView slide={item} width={SCREEN_W} height={CARD_H} tilt={tilt} />
        )}
        width={SCREEN_W}
        height={CARD_H}
        loop
        autoPlay={!reduceMotion && !screenReader}
        autoPlayInterval={6000}
        scrollAnimationDuration={700}
        onSnapToItem={setIndex}
        onConfigurePanGesture={(g: any) => {
          // Só ativa o swipe HORIZONTAL do carrossel; o arrasto vertical passa para a
          // FlatList — senão o gesto do carrossel bloqueia o scroll sobre o cartaz.
          g.activeOffsetX([-12, 12]);
          g.failOffsetY([-12, 12]);
        }}
      />
      <HeroDots count={slides.length} index={index} onDot={(i) => ref.current?.scrollTo({ index: i, animated: true })} />
    </View>
  );
});
HomeHero.displayName = 'HomeHero';

const styles = StyleSheet.create({
  stage: { alignItems: 'center', marginBottom: 10 },
  // marginTop negativo "come" parte do espaço vazio que o parallax cria acima do card
  // (card escalado fica centralizado na vertical) → aproxima o banner do header.
  carouselWrap: { marginTop: -20, marginBottom: 10 },
  // Card do cartaz — SEM borda (a pedido). Recorta imagem/brilho com overflow:hidden.
  card: { borderRadius: RADIUS, overflow: 'hidden', backgroundColor: BG },
  skeleton: { backgroundColor: '#111827' },
  // Blocos-fantasma do skeleton (eyebrow/título/chip) e dots-fantasma.
  skelBlock: { backgroundColor: 'rgba(255,255,255,0.08)', borderRadius: 8 },
  skelDotActive: { width: 20, backgroundColor: 'rgba(255,255,255,0.30)' },
  skelDotIdle: { width: 6, backgroundColor: 'rgba(255,255,255,0.12)' },
  // Superdimensionado (bem além do GLARE_TRAVEL) para o deslocamento + rotação da luz
  // nunca revelarem borda dura dentro do card.
  glareWrap: { position: 'absolute', top: -140, left: -140, right: -140, bottom: -140 },
  pressOverlay: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: '#FFFFFF' },
  content: { position: 'absolute', left: 18, right: 18, bottom: 20 },
  eyebrow: { color: GOLD, fontSize: 12, fontWeight: '800', letterSpacing: 1.5, marginBottom: 6 },
  title: { color: '#F9FAFB', fontSize: 30, fontWeight: '800', lineHeight: 35 },
  theme: { color: '#EAECEF', fontSize: 15, marginTop: 6, lineHeight: 20 },
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
  dots: { flexDirection: 'row', alignSelf: 'center', alignItems: 'center', gap: 6, marginTop: DOTS_MARGIN_TOP },
  dot: { height: 6, borderRadius: 999 },
  dotActive: { width: 20, backgroundColor: ACCENT },
  dotIdle: { width: 6, backgroundColor: 'rgba(255,255,255,0.28)' },
});
