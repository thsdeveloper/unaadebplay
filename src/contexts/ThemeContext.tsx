import React, {
  createContext,
  useState,
  useEffect,
  useCallback,
  useMemo,
  ReactNode
} from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useColorScheme as useSystemColorScheme } from 'react-native';
import type { ThemeMode, ThemeContextType } from '@/types/theme';
import * as Haptics from 'expo-haptics';

const THEME_STORAGE_KEY = '@unaadebplay:theme';

/**
 * ThemeContext - Manages application theme state
 *
 * Features:
 * - Persists theme preference to AsyncStorage
 * - Supports light, dark, and system (auto) modes
 * - Optimized with React.memo and useCallback
 * - Haptic feedback on theme changes
 *
 * Following SOLID principles:
 * - Single Responsibility: Only manages theme state
 * - Open/Closed: Extensible via context value
 * - Dependency Inversion: Uses abstraction (context)
 */
export const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

interface ThemeProviderProps {
  children: ReactNode;
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
  const [mode, setMode] = useState<ThemeMode>('system');
  const [isLoading, setIsLoading] = useState(true);
  const systemColorScheme = useSystemColorScheme();

  /**
   * Resolve the actual theme based on mode
   * If mode is 'system', use device preference
   */
  const resolvedTheme = useMemo<'light' | 'dark'>(() => {
    if (mode === 'system') {
      return systemColorScheme === 'dark' ? 'dark' : 'light';
    }
    return mode;
  }, [mode, systemColorScheme]);

  /**
   * Load saved theme preference from AsyncStorage
   */
  useEffect(() => {
    const loadTheme = async () => {
      try {
        const savedTheme = await AsyncStorage.getItem(THEME_STORAGE_KEY);
        if (savedTheme && ['light', 'dark', 'system'].includes(savedTheme)) {
          setMode(savedTheme as ThemeMode);
        }
      } catch (error) {
        console.error('Error loading theme:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadTheme();
  }, []);

  /**
   * Set theme and persist to storage
   * Optimized with useCallback to prevent unnecessary re-renders
   */
  const setTheme = useCallback(async (newMode: ThemeMode) => {
    try {
      // Haptic feedback for better UX
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

      setMode(newMode);
      await AsyncStorage.setItem(THEME_STORAGE_KEY, newMode);
    } catch (error) {
      console.error('Error saving theme:', error);
    }
  }, []);

  /**
   * Toggle between light and dark modes
   * System mode is treated as current resolved theme
   */
  const toggleTheme = useCallback(() => {
    const newMode = resolvedTheme === 'light' ? 'dark' : 'light';
    setTheme(newMode);
  }, [resolvedTheme, setTheme]);

  /**
   * Memoize context value to prevent unnecessary re-renders
   * Only updates when dependencies change
   */
  const contextValue = useMemo<ThemeContextType>(
    () => ({
      mode,
      resolvedTheme,
      setTheme,
      toggleTheme,
      isLoading,
    }),
    [mode, resolvedTheme, setTheme, toggleTheme, isLoading]
  );

  return (
    <ThemeContext.Provider value={contextValue}>
      {children}
    </ThemeContext.Provider>
  );
};
