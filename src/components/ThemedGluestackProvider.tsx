import React, { ReactNode } from 'react';
import { GluestackUIProvider } from '@/components/ui/gluestack-ui-provider';
import { useTheme } from '@/hooks/useTheme';

/**
 * ThemedGluestackProvider
 *
 * Wrapper for GluestackUIProvider that automatically uses the current theme
 * from ThemeContext. This separates the concern of theme management from
 * the UI provider configuration.
 *
 * Following SOLID principles:
 * - Single Responsibility: Only connects theme context to UI provider
 * - Dependency Inversion: Depends on theme abstraction, not concrete implementation
 */
interface ThemedGluestackProviderProps {
  children: ReactNode;
}

export const ThemedGluestackProvider: React.FC<ThemedGluestackProviderProps> = ({
  children
}) => {
  const { resolvedTheme } = useTheme();

  return (
    <GluestackUIProvider mode={resolvedTheme}>
      {children}
    </GluestackUIProvider>
  );
};
