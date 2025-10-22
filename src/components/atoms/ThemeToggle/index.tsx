import { memo, useCallback } from 'react';
import { View, TouchableOpacity, Animated } from 'react-native';
import { FontAwesome5 } from '@expo/vector-icons';
import { Text } from '@/components/atoms/Text';
import { useTheme } from '@/hooks/useTheme';
import { cn } from '@/utils/cn';
import * as Haptics from 'expo-haptics';

interface ThemeToggleProps {
  variant?: 'icon-only' | 'full';
  className?: string;
}

/**
 * ThemeToggle Atom
 *
 * A toggle component for switching between light and dark themes
 *
 * Features:
 * - Animated icon transitions
 * - Haptic feedback
 * - Two variants: icon-only and full
 * - Memoized for performance
 *
 * Following Atomic Design:
 * - Atom level component (smallest building block)
 * - Single responsibility (toggle theme)
 * - Reusable across the app
 */
export const ThemeToggle = memo<ThemeToggleProps>(({
  variant = 'full',
  className
}) => {
  const { resolvedTheme, toggleTheme } = useTheme();
  const isDark = resolvedTheme === 'dark';

  const handleToggle = useCallback(async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    toggleTheme();
  }, [toggleTheme]);

  if (variant === 'icon-only') {
    return (
      <TouchableOpacity
        onPress={handleToggle}
        activeOpacity={0.7}
        className={cn(
          'w-12 h-12 rounded-full items-center justify-center',
          isDark ? 'bg-yellow-500/20' : 'bg-blue-900/20',
          className
        )}
      >
        <FontAwesome5
          name={isDark ? 'sun' : 'moon'}
          size={20}
          color={isDark ? '#F59E0B' : '#3B82F6'}
        />
      </TouchableOpacity>
    );
  }

  return (
    <TouchableOpacity
      onPress={handleToggle}
      activeOpacity={0.7}
      className={cn(
        'flex-row items-center p-4 rounded-xl border',
        isDark
          ? 'bg-gray-800 border-gray-700'
          : 'bg-gray-100 border-gray-300',
        className
      )}
    >
      <View className={cn(
        'w-12 h-12 rounded-full items-center justify-center mr-4',
        isDark ? 'bg-yellow-500/20' : 'bg-blue-900/20'
      )}>
        <FontAwesome5
          name={isDark ? 'sun' : 'moon'}
          size={22}
          color={isDark ? '#F59E0B' : '#3B82F6'}
        />
      </View>

      <View className="flex-1">
        <Text
          variant="body"
          color="primary"
          weight="semibold"
          className="mb-1"
        >
          Tema {isDark ? 'Escuro' : 'Claro'}
        </Text>
        <Text
          size="xs"
          color="muted"
        >
          Toque para alternar
        </Text>
      </View>

      <View className={cn(
        'w-14 h-8 rounded-full p-1 justify-center',
        isDark ? 'bg-blue-600' : 'bg-gray-300'
      )}>
        <Animated.View
          className={cn(
            'w-6 h-6 rounded-full bg-white shadow-md',
            isDark && 'ml-auto'
          )}
        />
      </View>
    </TouchableOpacity>
  );
});

ThemeToggle.displayName = 'ThemeToggle';
