import { useEffect, useMemo } from 'react';
import { AccessibilityInfo } from 'react-native';
import { useSharedValue, type SharedValue } from 'react-native-reanimated';
import { DeviceMotion } from 'expo-sensors';

export interface DeviceTilt {
  /** Inclinação esquerda/direita normalizada em -1..1 (UI thread). */
  x: SharedValue<number>;
  /** Inclinação frente/trás normalizada em -1..1 (UI thread). */
  y: SharedValue<number>;
}

const clamp = (v: number) => (v < -1 ? -1 : v > 1 ? 1 : v);
const RANGE = Math.PI / 10; // ~18° de desvio → ±1
const OUT_SMOOTH = 0.16; // low-pass da saída → movimento sedoso
const BASE_ADAPT = 0.02; // baseline segue a orientação devagar → o brilho recentra parado

/**
 * Lê a atitude do giroscópio (expo-sensors `DeviceMotion`) e expõe o "tilt" do
 * aparelho como dois SharedValues (UI thread) prontos para animar.
 *
 * Usa um baseline ADAPTATIVO: em vez da orientação absoluta (que depende de como a
 * pessoa segura o telefone), acompanha um baseline que persegue a orientação atual
 * bem devagar. Assim o valor reage a MOVIMENTOS e volta a zero quando o aparelho
 * fica parado — exatamente o comportamento do brilho gyroscópico da Netflix.
 *
 * Degrada em silêncio: se o sensor não existir ou "Reduzir movimento" estiver
 * ligado, os valores ficam em 0 (brilho estático, sem crash).
 */
export function useDeviceTilt(enabled = true): DeviceTilt {
  const x = useSharedValue(0);
  const y = useSharedValue(0);

  useEffect(() => {
    if (!enabled) return;
    let cancelled = false;
    let sub: { remove: () => void } | undefined;
    let baseG = NaN;
    let baseB = NaN;

    (async () => {
      try {
        if (await AccessibilityInfo.isReduceMotionEnabled()) return;
        if (cancelled || !(await DeviceMotion.isAvailableAsync())) return;
        DeviceMotion.setUpdateInterval(33); // ~30fps: suave e barato
        sub = DeviceMotion.addListener(({ rotation }) => {
          if (!rotation) return;
          const g = rotation.gamma ?? 0; // esquerda/direita (rad)
          const b = rotation.beta ?? 0; // frente/trás (rad)
          if (Number.isNaN(baseG)) {
            baseG = g;
            baseB = b;
          }
          baseG += (g - baseG) * BASE_ADAPT;
          baseB += (b - baseB) * BASE_ADAPT;
          x.value += (clamp((g - baseG) / RANGE) - x.value) * OUT_SMOOTH;
          y.value += (clamp((b - baseB) / RANGE) - y.value) * OUT_SMOOTH;
        });
      } catch {
        // sensor indisponível → tilt permanece em 0 (sem efeito, sem erro)
      }
    })();

    return () => {
      cancelled = true;
      sub?.remove();
    };
  }, [enabled, x, y]);

  return useMemo(() => ({ x, y }), [x, y]);
}
