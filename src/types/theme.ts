/**
 * Theme types for the application
 * Supports light, dark, and system (auto) modes
 */

export type ThemeMode = 'light' | 'dark' | 'system';

export interface ThemeContextType {
  /** Current theme mode */
  mode: ThemeMode;

  /** Current resolved theme (light or dark, never system) */
  resolvedTheme: 'light' | 'dark';

  /** Set theme mode with persistence */
  setTheme: (mode: ThemeMode) => void;

  /** Toggle between light and dark */
  toggleTheme: () => void;

  /** Whether theme is currently loading */
  isLoading: boolean;
}

export interface ThemeColors {
  primary: string;
  secondary: string;
  background: string;
  surface: string;
  text: string;
  textSecondary: string;
  border: string;
  error: string;
  success: string;
  warning: string;
  info: string;
}
