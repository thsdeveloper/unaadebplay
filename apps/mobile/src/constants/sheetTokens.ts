/**
 * Paleta FIXA (dark) do bottom sheet de conta ("Minhas informações").
 *
 * IMPORTANTE: é hardcoded escuro DE PROPÓSITO — o sheet abre a partir da home
 * (sempre escura) e precisa combinar com o contexto de lançamento, não com o
 * tema global do app. NÃO usar `useThemedColors` nem classes `dark:` dentro do
 * sheet: no tema Claro isso renderiza preto-no-escuro (invisível). Sempre cor
 * via estes tokens + hex inline (como HomeHero/SectorSelect/GradientButton).
 */
export const SHEET = {
  // superfícies
  bg: '#0E1526',
  bgDeep: '#0D0F17',
  surface: '#111827',
  // vidro
  glass: 'rgba(255,255,255,0.06)',
  border: 'rgba(255,255,255,0.10)',
  hairline: 'rgba(255,255,255,0.06)',
  pressed: 'rgba(255,255,255,0.04)',
  grabber: 'rgba(255,255,255,0.18)',
  // marca
  brand: '#E51C44',
  brandDark: '#B0143A',
  brandLight: '#FF4D6D', // acento/links sobre fundo escuro (mais legível que o brand puro)
  brandTint: 'rgba(229,28,68,0.14)',
  brandRing: 'rgba(229,28,68,0.9)',
  gold: '#FFD700',
  // texto
  textPrimary: '#F9FAFB',
  textSecondary: '#D1D5DB',
  textMuted: '#9CA3AF',
  textFaint: '#6B7280',
  // destrutivo (discreto no sheet; o vermelho "forte" fica só no Alert de confirmação)
  danger: '#F87171',
  dangerTint: 'rgba(239,68,68,0.12)',
  // sucesso (confirmações: inscrição feita, ação concluída)
  success: '#22C55E',
  successTint: 'rgba(34,197,94,0.15)',
} as const;
