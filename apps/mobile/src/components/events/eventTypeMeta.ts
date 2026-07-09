import { Users, Music, GraduationCap, CalendarDays, Sparkles, Flame, HeartHandshake } from 'lucide-react-native';

export interface TypeMeta {
  label: string;
  Icon: any;
  /** Hue that identifies the event type across the agenda (medallion, dot, chip). */
  color: string;
}

/**
 * Cada tipo de evento tem um ícone E uma cor própria — é o que dá "vida" à agenda
 * e a diferencia do feed de notícias (que é monocromático por marca). As chaves
 * espelham `event_type` no banco (ver EventFiltersSheet / EventListCard legado).
 */
const MAP: Record<string, TypeMeta> = {
  'congresso-geral': { label: 'Congresso Geral', Icon: Users, color: '#E51C44' },
  'cpre-congresso': { label: 'Pré-Congresso', Icon: CalendarDays, color: '#F59E0B' },
  ensaio: { label: 'Ensaio', Icon: Music, color: '#A855F7' },
  culto: { label: 'Culto', Icon: Flame, color: '#10B981' },
  encontro: { label: 'Encontro', Icon: HeartHandshake, color: '#06B6D4' },
  palestras: { label: 'Palestras', Icon: GraduationCap, color: '#38BDF8' },
  default: { label: 'Evento', Icon: Sparkles, color: '#E51C44' },
};

export const getTypeMeta = (t?: string | null): TypeMeta => MAP[t ?? ''] ?? MAP.default;

/** rgba a partir de um hex `#RRGGBB` — para tints translúcidos (medalhão, glow). */
export function typeTint(hex: string, alpha: number): string {
  const n = parseInt(hex.replace('#', ''), 16);
  const r = (n >> 16) & 255;
  const g = (n >> 8) & 255;
  const b = n & 255;
  return `rgba(${r},${g},${b},${alpha})`;
}

/** Lista de tipos para os chips de filtro (Todos + tipos conhecidos). */
export const EVENT_TYPES: { id: string; label: string; Icon: any; color: string }[] = [
  { id: 'congresso-geral', label: 'Congresso', Icon: Users, color: '#E51C44' },
  { id: 'cpre-congresso', label: 'Pré-Congresso', Icon: CalendarDays, color: '#F59E0B' },
  { id: 'culto', label: 'Culto', Icon: Flame, color: '#10B981' },
  { id: 'ensaio', label: 'Ensaio', Icon: Music, color: '#A855F7' },
  { id: 'encontro', label: 'Encontro', Icon: HeartHandshake, color: '#06B6D4' },
  { id: 'palestras', label: 'Palestras', Icon: GraduationCap, color: '#38BDF8' },
];
