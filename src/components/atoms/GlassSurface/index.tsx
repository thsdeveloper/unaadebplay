import React, { memo } from 'react';
import { Platform, View } from 'react-native';
import type { StyleProp, ViewStyle, ViewProps } from 'react-native';
import { BlurView } from 'expo-blur';
import type { BlurTint } from 'expo-blur';
import { SHEET } from '@/constants/sheetTokens';

export type GlassEffectStyle = 'regular' | 'clear';

export interface GlassSurfaceProps {
  children?: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  /** 'regular' (padrão) reflete/frosta mais o fundo; 'clear' é mais translúcido. */
  glassEffectStyle?: GlassEffectStyle;
  /** Tint opcional (ex.: rgba escuro para garantir contraste de ícones sobre foto). */
  tintColor?: string;
  /** Vidro reativo ao toque — só faz efeito se o próprio vidro receber o toque
   *  (não use junto com pointerEvents="none"). */
  isInteractive?: boolean;
  pointerEvents?: ViewProps['pointerEvents'];
  /** Fallback expo-blur (iOS < 26). */
  blurIntensity?: number;
  blurTint?: BlurTint;
  /** Fallback sólido (Android/web) — use cor OPACA em superfícies que precisam esconder o fundo. */
  fallbackColor?: string;
}

/**
 * Carrega expo-glass-effect de forma PROTEGIDA. Os componentes GlassView/GlassContainer
 * chamam `requireNativeViewManager('ExpoGlassEffect')` em MODULE SCOPE (ver
 * node_modules/expo-glass-effect/build/GlassView.ios.js), então só *importar* o pacote
 * lança quando o módulo nativo está ausente (Expo Go, ou um binário nativo defasado que
 * recebeu um bundle JS novo via OTA). O try/catch em volta do `require` garante que, sem
 * o módulo, caímos no fallback (BlurView/cor sólida) em vez de crashar — diferente de um
 * `import` estático, que não seria protegível.
 */
const glass: { available: boolean; GlassView: React.ComponentType<any> | null } = (() => {
  if (Platform.OS !== 'ios') return { available: false, GlassView: null };
  try {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const mod = require('expo-glass-effect');
    const available = !!(mod.isGlassEffectAPIAvailable() && mod.isLiquidGlassAvailable());
    return { available, GlassView: available ? mod.GlassView : null };
  } catch {
    return { available: false, GlassView: null };
  }
})();

/** iOS 26+ com Liquid Glass real disponível (decidido uma vez no load). */
export const LIQUID_GLASS_AVAILABLE = glass.available;

/**
 * Material "Liquid Glass" (Expo SDK — Glass Effect) com fallback gracioso.
 * - iOS 26+: <GlassView> nativo (UIVisualEffectView), colorScheme "dark" fixo p/ casar com o SHEET.
 * - iOS < 26: <BlurView> (expo-blur).
 * - Android/web (ou módulo ausente): View sólida com fallbackColor.
 *
 * ⚠️ Nunca aplicar opacity:0 no GlassView nem nos pais — quebra o efeito (usar animate/Reanimated).
 * ⚠️ GlassView (UIVisualEffectView) é caro na GPU: usar só em *chrome* de instância única,
 *    nunca por linha de lista. Atom customizado (sem equivalente Gluestack), como Logo/GradientBackground.
 */
export const GlassSurface = memo<GlassSurfaceProps>(function GlassSurface({
  children,
  style,
  glassEffectStyle = 'regular',
  tintColor,
  isInteractive = false,
  pointerEvents,
  blurIntensity = 24,
  blurTint = 'dark',
  fallbackColor = SHEET.glass,
}) {
  if (LIQUID_GLASS_AVAILABLE && glass.GlassView) {
    const NativeGlass = glass.GlassView;
    return (
      <NativeGlass
        style={style}
        glassEffectStyle={glassEffectStyle}
        tintColor={tintColor}
        isInteractive={isInteractive}
        colorScheme="dark"
        pointerEvents={pointerEvents}
      >
        {children}
      </NativeGlass>
    );
  }

  if (Platform.OS === 'ios') {
    return (
      <BlurView intensity={blurIntensity} tint={blurTint} style={style} pointerEvents={pointerEvents}>
        {children}
      </BlurView>
    );
  }

  return (
    <View style={[{ backgroundColor: fallbackColor }, style]} pointerEvents={pointerEvents}>
      {children}
    </View>
  );
});

GlassSurface.displayName = 'GlassSurface';
