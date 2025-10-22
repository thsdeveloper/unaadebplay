import { useContext } from 'react';
import { ThemeContext } from '@/contexts/ThemeContext';
import type { ThemeContextType } from '@/types/theme';

/**
 * Hook to access theme context
 *
 * Usage:
 * ```tsx
 * const { mode, resolvedTheme, setTheme, toggleTheme } = useTheme();
 * ```
 *
 * @throws {Error} If used outside ThemeProvider
 * @returns {ThemeContextType} Theme context value
 *
 * Features:
 * - Persisted theme preference (light, dark, system)
 * - Automatic system theme detection
 * - Haptic feedback on theme changes
 * - Optimized with memoization
 */
export const useTheme = (): ThemeContextType => {
  const context = useContext(ThemeContext);

  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }

  return context;
};

export default useTheme;
