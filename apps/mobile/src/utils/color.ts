/**
 * Helpers de cor tolerantes a valores vindos do banco (primary_color/second_color
 * são texto livre — podem ser null, "#abc", "abcdef" sem "#", ou lixo).
 */

const FALLBACK = '#E51C44';

/** Normaliza para "#rrggbb" (expande atalhos "#abc") ou retorna null se inválido. */
function normalizeHex(hex?: string | null): string | null {
  if (!hex || typeof hex !== 'string') return null;
  let h = hex.trim().replace(/^#/, '');
  if (h.length === 3) h = h.split('').map((c) => c + c).join('');
  if (!/^[0-9a-fA-F]{6}$/.test(h)) return null;
  return `#${h.toLowerCase()}`;
}

/** "#rrggbb" -> {r,g,b}, com fallback de marca para entradas inválidas. */
function toRgb(hex?: string | null): { r: number; g: number; b: number } {
  const h = normalizeHex(hex) ?? FALLBACK;
  return {
    r: parseInt(h.slice(1, 3), 16),
    g: parseInt(h.slice(3, 5), 16),
    b: parseInt(h.slice(5, 7), 16),
  };
}

/** Cor hex -> rgba(...) com alpha [0..1]. Aceita valores sujos do banco. */
export function hexToRgba(hex: string | null | undefined, alpha = 1): string {
  const { r, g, b } = toRgb(hex);
  const a = Math.max(0, Math.min(1, alpha));
  return `rgba(${r}, ${g}, ${b}, ${a})`;
}

/** Escurece uma cor hex por `amount` (0..255 por canal). */
export function darken(hex: string | null | undefined, amount = 40): string {
  const { r, g, b } = toRgb(hex);
  const clamp = (n: number) => Math.max(0, Math.min(255, n - amount));
  const toHex = (n: number) => clamp(n).toString(16).padStart(2, '0');
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}

/** Clareia uma cor hex por `amount` (0..255 por canal). */
export function lighten(hex: string | null | undefined, amount = 40): string {
  const { r, g, b } = toRgb(hex);
  const clamp = (n: number) => Math.max(0, Math.min(255, n + amount));
  const toHex = (n: number) => clamp(n).toString(16).padStart(2, '0');
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}

/** Retorna a cor se for um hex válido, senão o fallback informado. */
export function safeHex(hex: string | null | undefined, fallback = FALLBACK): string {
  return normalizeHex(hex) ?? fallback;
}
