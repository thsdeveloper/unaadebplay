import type { Feather } from '@expo/vector-icons';

/**
 * Configuração estática (nível de módulo -> referência estável) dos atalhos do
 * "Acesso rápido". É a âncora sempre presente da home: renderiza instantaneamente
 * no cold start, antes de qualquer fetch. Todas as rotas verificadas contra a
 * árvore real de (tabs)/(home).
 */
export interface QuickAccessTile {
  id: string;
  label: string;
  subtitle?: string;
  icon: keyof typeof Feather.glyphMap;
  route: string;
  /** 'feature' = tile grande em destaque; 'compact' = tile do grid 2x2. */
  variant: 'feature' | 'compact';
  /** Cor de fundo/realce (hex). O 'feature' usa gradiente de marca. */
  color: string;
}

export const QUICK_ACCESS_TILES: QuickAccessTile[] = [
  {
    id: 'cartao',
    label: 'Cartão de acesso',
    subtitle: 'Seu ingresso do congresso',
    icon: 'credit-card',
    route: '/(tabs)/(home)/(congresso)/cartao-acesso',
    variant: 'feature',
    color: '#E51C44',
  },
  {
    id: 'hospedagem',
    label: 'Hospedagem',
    icon: 'home',
    route: '/(tabs)/(home)/(congresso)/hospedagem',
    variant: 'compact',
    color: '#243189',
  },
  {
    id: 'contribua',
    label: 'Contribua',
    icon: 'gift',
    route: '/(tabs)/(home)/contribua',
    variant: 'compact',
    color: '#B8860B',
  },
  {
    id: 'repertorios',
    label: 'Repertórios',
    icon: 'music',
    route: '/(tabs)/(home)/repertories',
    variant: 'compact',
    color: '#495BCC',
  },
  {
    id: 'youtube',
    label: 'YouTube',
    icon: 'youtube',
    route: '/(tabs)/(home)/youtube',
    variant: 'compact',
    color: '#FF0000',
  },
];
