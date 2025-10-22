import { memo } from 'react';
import { View } from 'react-native';
import { SectionHeader } from '@/components/atoms/SectionHeader';
import { ThemeToggle } from '@/components/atoms/ThemeToggle';
import { cn } from '@/utils/cn';

interface PreferencesSectionProps {
  className?: string;
}

/**
 * PreferencesSection Organism
 *
 * Displays user preferences including theme toggle
 *
 * Following Atomic Design:
 * - Organism level (complex component with business logic)
 * - Composes atoms (SectionHeader, ThemeToggle)
 * - Self-contained section for user preferences
 */
export const PreferencesSection = memo<PreferencesSectionProps>(({
  className
}) => {
  return (
    <View className={cn('mb-6', className)}>
      <SectionHeader
        title="Preferências"
        subtitle="Personalize sua experiência"
      />

      <ThemeToggle variant="full" />
    </View>
  );
});

PreferencesSection.displayName = 'PreferencesSection';
