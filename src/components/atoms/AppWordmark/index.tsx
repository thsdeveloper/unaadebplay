import React, { useEffect } from 'react';
import { StyleSheet, Text as RNText, AccessibilityInfo } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  interpolate,
  Extrapolation,
  withTiming,
  withDelay,
  withRepeat,
  cancelAnimation,
  Easing,
  type SharedValue,
} from 'react-native-reanimated';

/**
 * AppWordmark — marca "unaadebplay" para a top bar da Home.
 *
 * Direção (vencedora do painel de design): entrada por letra (subida + fade
 * escalonados no mount), depois "assenta"; em repouso, um halo vermelho da marca
 * respira sob o segmento "Play". Duas cores nas letras: "UNAADEB" (claro/caixa
 * alta) + "Play" (brand, P maiúsculo).
 *
 * Robustez: 100% React Native + Reanimated (useAnimatedStyle na UI thread) — o
 * MESMO padrão já provado em AnimatedSplash. NENHUM SVG no loop de animação, logo
 * nada de ClipPath-de-texto / gradiente animado / group-opacity (pontos frágeis).
 * Sem fontes custom (system font, peso 800, ~22px), uma linha, sem clipping
 * (lineHeight 28 acomoda descendentes de "p"/"y"). Respeita "reduzir movimento":
 * versão estática, ainda iluminada.
 *
 * Integração: substitui <RNText style={st.title}>Início</RNText> na fileira st.left
 * do HomeHeader. Legível sobre o degradê azul do topo e sobre o #0D0F17 sólido.
 */

// --- design tokens (hardcoded p/ ser 100% self-contained) — espelham SHEET ---
const PRIMARY_COLOR = '#F9FAFB'; // textPrimary — "UNAADEB"
const BRAND = '#E51C44'; // brand — "Play"
const GLOW_RGBA = 'rgba(229,28,68,0.95)'; // halo da marca (brand @0.95)
const LIFT_RGBA = 'rgba(13,15,23,0.55)'; // bgDeep — sombra p/ destacar do azul

// --- palavra / segmentos (UNAADEB em caixa alta + Play com P maiúsculo) ---
const PRIMARY_WORD = 'UNAADEB';
const ACCENT_WORD = 'Play';
type Glyph = { c: string; accent: boolean };
const LETTERS: Glyph[] = [
  ...PRIMARY_WORD.split('').map((c) => ({ c, accent: false })),
  ...ACCENT_WORD.split('').map((c) => ({ c, accent: true })),
];

// --- timing da entrada por letra (clock linear + easing por letra) ---
const RISE = 12; // px que a letra sobe ao entrar
const LETTER_DUR = 420; // ms de reveal de cada elemento
const STAGGER = 46; // ms entre elementos
const TOTAL = STAGGER * (LETTERS.length - 1) + LETTER_DUR; // fim da entrada
const GLOW_PERIOD = 1600; // ms de meio-ciclo do respiro do halo
const GLOW_STATIC = 0.5; // repouso (reduce-motion): halo suave fixo

interface AppWordmarkProps {
  /** Cor do segmento claro "UNAADEB". Default: #F9FAFB. "Play" usa a brand (#E51C44). */
  color?: string;
}

interface LetterProps {
  char: string;
  index: number;
  color: string;
  accent: boolean;
  clock: SharedValue<number>;
}

/** Uma letra "crisp" (visível), com entrada eased derivada de um clock único. */
const Letter = React.memo(function Letter({ char, index, color, accent, clock }: LetterProps) {
  const aStyle = useAnimatedStyle(() => {
    const raw = Math.min(1, Math.max(0, (clock.value - index * STAGGER) / LETTER_DUR));
    const eased = 1 - Math.pow(1 - raw, 3); // cubic-out
    return {
      opacity: eased,
      transform: [{ translateY: (1 - eased) * RISE }],
    };
  });

  return (
    <Animated.Text
      allowFontScaling={false}
      style={[styles.letter, accent ? null : styles.lift, { color }, aStyle]}
    >
      {char}
    </Animated.Text>
  );
});

export const AppWordmark = React.memo(function AppWordmark({ color = PRIMARY_COLOR }: AppWordmarkProps) {
  const clock = useSharedValue(0); // 0 -> TOTAL (entrada por letra)
  const glow = useSharedValue(0); // respiro do halo (0..1)

  useEffect(() => {
    let mounted = true;

    const start = (reduceMotion: boolean) => {
      if (!mounted) return;
      cancelAnimation(clock);
      cancelAnimation(glow);

      if (reduceMotion) {
        // Estático mas bonito: tudo visível, halo suave fixo.
        clock.value = TOTAL;
        glow.value = GLOW_STATIC;
        return;
      }

      clock.value = 0;
      clock.value = withTiming(TOTAL, { duration: TOTAL, easing: Easing.linear });

      glow.value = 0; // halo escondido durante a entrada...
      glow.value = withDelay(
        TOTAL, // ...só respira depois que as letras assentam.
        withRepeat(
          withTiming(1, { duration: GLOW_PERIOD, easing: Easing.inOut(Easing.quad) }),
          -1,
          true,
        ),
      );
    };

    AccessibilityInfo.isReduceMotionEnabled()
      .then(start)
      .catch(() => start(false));

    const sub = AccessibilityInfo.addEventListener('reduceMotionChanged', start);

    return () => {
      mounted = false;
      cancelAnimation(clock);
      cancelAnimation(glow);
      // RN retorna { remove } nas versões atuais.
      sub?.remove?.();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const glowStyle = useAnimatedStyle(() => ({
    opacity: interpolate(glow.value, [0, 1], [0.12, 0.6], Extrapolation.CLAMP),
  }));

  return (
    <Animated.View
      style={styles.wrap}
      accessible
      accessibilityRole="header"
      accessibilityLabel="unaadebplay"
    >
      {/* Camada de halo (atrás): só o "play" emite brilho vermelho; o resto é
          espaçador transparente p/ alinhar a posição de "play" com a camada nítida. */}
      <Animated.View
        style={[StyleSheet.absoluteFill, styles.row, styles.glowLayer, glowStyle]}
        pointerEvents="none"
      >
        {LETTERS.map((l, i) => (
          <RNText
            key={`g-${i}`}
            allowFontScaling={false}
            style={[styles.letter, l.accent ? styles.glowAccent : styles.glowHidden]}
          >
            {l.c}
          </RNText>
        ))}
      </Animated.View>

      {/* Camada nítida (frente): as letras animam na entrada. */}
      <Animated.View style={[styles.row, styles.crispLayer]}>
        {LETTERS.map((l, i) => (
          <Letter
            key={`c-${i}`}
            char={l.c}
            index={i}
            accent={l.accent}
            color={l.accent ? BRAND : color}
            clock={clock}
          />
        ))}
      </Animated.View>
    </Animated.View>
  );
});

AppWordmark.displayName = 'AppWordmark';

const styles = StyleSheet.create({
  wrap: {
    // Largura/altura intrínsecas (definidas pela camada nítida). alignSelf p/
    // encostar no ícone; justifyContent centraliza na barra de 50px.
    alignSelf: 'flex-start',
    justifyContent: 'center',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  crispLayer: { zIndex: 1 },
  glowLayer: { zIndex: 0, justifyContent: 'flex-start' },
  letter: {
    fontSize: 22,
    fontWeight: '800',
    letterSpacing: 0.3,
    lineHeight: 28, // folga p/ descendentes de "p"/"y" (sem clipping)
    includeFontPadding: false, // Android: alinha verticalmente com o ícone 30x30
    textAlignVertical: 'center',
  },
  // Sombra sutil só nas letras claras — destaca do degradê azul do topo sem
  // "sujar" o halo vermelho ao redor de "play" (invisível sobre o #0D0F17).
  lift: {
    textShadowColor: LIFT_RGBA,
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  glowHidden: { color: 'transparent' },
  glowAccent: {
    color: BRAND,
    textShadowColor: GLOW_RGBA,
    textShadowOffset: { width: 0, height: 0 },
    // 10 = halo macio; se em algum Android OEM a borda ficar "dura", baixe p/ ~8.
    textShadowRadius: 10,
  },
});

export default AppWordmark;
