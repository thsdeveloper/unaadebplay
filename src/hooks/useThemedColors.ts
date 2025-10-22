import { useMemo } from 'react';
import { useTheme } from '@/hooks/useTheme';
import { lightColors, darkColors, type AppColors } from '@/constants/colors';

/**
 * Hook to get theme-aware colors
 *
 * Returns the appropriate color palette based on the current theme.
 * Colors are memoized for performance.
 *
 * Usage:
 * ```tsx
 * const colors = useThemedColors();
 *
 * return (
 *   <View style={{ backgroundColor: colors.background }}>
 *     <Text style={{ color: colors.text }}>Hello</Text>
 *   </View>
 * );
 * ```
 *
 * @returns {AppColors} Theme-aware color palette
 *
 * Features:
 * - Automatic theme switching
 * - Memoized for performance
 * - Type-safe color access
 * - Consistent naming across themes
 */
export const useThemedColors = (): AppColors => {
  const { resolvedTheme } = useTheme();

  const colors = useMemo(() => {
    return resolvedTheme === 'dark' ? darkColors : lightColors;
  }, [resolvedTheme]);

  return colors;
};

export default useThemedColors;
