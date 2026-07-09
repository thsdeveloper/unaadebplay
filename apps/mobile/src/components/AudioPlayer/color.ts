/** Converte #RGB/#RRGGBB para rgba(...) com alpha. Fallback = vermelho da marca. */
export function hexToRGBA(hex: string, alpha = 1): string {
  let h = (hex || '').replace('#', '').trim();
  if (h.length === 3) h = h.split('').map((c) => c + c).join('');
  const m = /^([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(h);
  if (!m) return `rgba(229,28,68,${alpha})`;
  return `rgba(${parseInt(m[1], 16)},${parseInt(m[2], 16)},${parseInt(m[3], 16)},${alpha})`;
}
