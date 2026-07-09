/**
 * Color System with Theme Support
 *
 * This file defines all application colors with support for both light and dark themes.
 * Each color is defined with a light and dark variant where appropriate.
 *
 * Usage with hook:
 * ```tsx
 * import { useThemedColors } from '@/hooks/useThemedColors';
 *
 * const colors = useThemedColors();
 * <View style={{ backgroundColor: colors.background }}>
 * ```
 */

export interface AppColors {
  // Brand Colors (same for both themes)
  primary: string;
  secundary: string;
  secundary2: string;
  secundary3: string;

  // UI Colors (theme-aware)
  background: string;
  backgroundSecondary: string;
  backgroundTertiary: string;
  surface: string;
  surfaceSecondary: string;

  // Text Colors (theme-aware)
  text: string;
  textSecondary: string;
  textMuted: string;
  textInverse: string;

  // Border & Divider
  border: string;
  divider: string;

  // Status Colors
  success: string;
  successLight: string;
  error: string;
  errorLight: string;
  warning: string;
  info: string;

  // Utility Colors
  black: string;
  white: string;
  accent: string;
  purple: string;
  pink: string;
  gold: string;
  skyBlue: string;

  // Overlay Colors (theme-aware)
  overlay: string;
  overlayLight: string;
  overlayHeavy: string;

  // Alpha Colors (theme-aware)
  primaryAlpha: string;
  errorAlpha: string;
  successAlpha: string;
  purpleAlpha: string;

  // Bag Background Colors (decorative)
  bag1Bg: string;
  bag2Bg: string;
  bag3Bg: string;
  bag4Bg: string;
  bag5Bg: string;
  bag6Bg: string;
  bag7Bg: string;
  bag8Bg: string;
  bag9Bg: string;
  bag10Bg: string;
  bag11Bg: string;
}

/**
 * Light Theme Colors
 */
export const lightColors: AppColors = {
  // Brand Colors
  primary: '#E51C44',
  secundary: '#0E1647',
  secundary2: '#243189',
  secundary3: '#495BCC',

  // UI Colors - Light Theme
  background: '#FFFFFF',
  backgroundSecondary: '#F3F4F6',
  backgroundTertiary: '#E5E7EB',
  surface: '#FFFFFF',
  surfaceSecondary: '#F9FAFB',

  // Text Colors - Light Theme
  text: '#111827',
  textSecondary: '#4B5563',
  textMuted: '#9CA3AF',
  textInverse: '#FFFFFF',

  // Border & Divider
  border: '#E5E7EB',
  divider: '#E5E7EB',

  // Status Colors
  success: '#10B981',
  successLight: '#D1FAE5',
  error: '#EF4444',
  errorLight: '#FEE2E2',
  warning: '#F59E0B',
  info: '#3B82F6',

  // Utility Colors
  black: '#000000',
  white: '#FFFFFF',
  accent: '#112233',
  purple: '#8F06E4',
  pink: '#FF4C98',
  gold: '#FFD700',
  skyBlue: '#87CEEB',

  // Overlay Colors - Light Theme
  overlay: 'rgba(0, 0, 0, 0.4)',
  overlayLight: 'rgba(0, 0, 0, 0.2)',
  overlayHeavy: 'rgba(0, 0, 0, 0.6)',

  // Alpha Colors - Light Theme
  primaryAlpha: 'rgba(229, 28, 68, 0.15)',
  errorAlpha: 'rgba(239, 68, 68, 0.15)',
  successAlpha: 'rgba(16, 185, 129, 0.15)',
  purpleAlpha: 'rgba(143, 6, 228, 0.15)',

  // Bag Background Colors
  bag1Bg: '#EA7A72',
  bag2Bg: '#C2C5D1',
  bag3Bg: '#82A7C9',
  bag4Bg: '#D49D8F',
  bag5Bg: '#CCD9C6',
  bag6Bg: '#767676',
  bag7Bg: '#D1C8C3',
  bag8Bg: '#DCA47F',
  bag9Bg: '#EB849C',
  bag10Bg: '#979DC1',
  bag11Bg: '#C7D3C0',
};

/**
 * Dark Theme Colors
 */
export const darkColors: AppColors = {
  // Brand Colors (same as light)
  primary: '#E51C44',
  secundary: '#0E1647',
  secundary2: '#243189',
  secundary3: '#495BCC',

  // UI Colors - Dark Theme
  background: '#111827',
  backgroundSecondary: '#1F2937',
  backgroundTertiary: '#374151',
  surface: '#1F2937',
  surfaceSecondary: '#374151',

  // Text Colors - Dark Theme
  text: '#F9FAFB',
  textSecondary: '#D1D5DB',
  textMuted: '#9CA3AF',
  textInverse: '#111827',

  // Border & Divider
  border: '#374151',
  divider: '#374151',

  // Status Colors (same as light but slightly adjusted for dark bg)
  success: '#10B981',
  successLight: '#064E3B',
  error: '#EF4444',
  errorLight: '#7F1D1D',
  warning: '#F59E0B',
  info: '#3B82F6',

  // Utility Colors
  black: '#000000',
  white: '#FFFFFF',
  accent: '#112233',
  purple: '#A855F7',
  pink: '#FF4C98',
  gold: '#FFD700',
  skyBlue: '#87CEEB',

  // Overlay Colors - Dark Theme
  overlay: 'rgba(0, 0, 0, 0.6)',
  overlayLight: 'rgba(0, 0, 0, 0.4)',
  overlayHeavy: 'rgba(0, 0, 0, 0.8)',

  // Alpha Colors - Dark Theme
  primaryAlpha: 'rgba(229, 28, 68, 0.25)',
  errorAlpha: 'rgba(239, 68, 68, 0.25)',
  successAlpha: 'rgba(16, 185, 129, 0.25)',
  purpleAlpha: 'rgba(168, 85, 247, 0.25)',

  // Bag Background Colors (slightly adjusted for dark theme)
  bag1Bg: '#C25A52',
  bag2Bg: '#9295A1',
  bag3Bg: '#6287A9',
  bag4Bg: '#B47D6F',
  bag5Bg: '#ACB9A6',
  bag6Bg: '#565656',
  bag7Bg: '#B1A8A3',
  bag8Bg: '#BC845F',
  bag9Bg: '#CB647C',
  bag10Bg: '#777DA1',
  bag11Bg: '#A7B3A0',
};

// Legacy default export for backward compatibility
// TODO: Gradually migrate to useThemedColors hook
export default lightColors;
