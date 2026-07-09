import React from 'react';
import { Animated, StyleSheet } from 'react-native';
import {
  Button as GluestackButton,
  ButtonText,
  ButtonSpinner,
  ButtonIcon
} from '@/components/ui/button';
import * as Haptics from 'expo-haptics';
import type { PressableProps } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

export type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'outline';
export type ButtonSize = 'small' | 'medium' | 'large';

interface ButtonProps extends Omit<PressableProps, 'children'> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  children: React.ReactNode;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  fullWidth?: boolean;
  className?: string;
  gradient?: boolean;
}

// Map our custom variants to Gluestack UI variants
const mapVariantToGluestack = (variant: ButtonVariant) => {
  switch (variant) {
    case 'primary':
      return { variant: 'solid' as const, action: 'primary' as const };
    case 'secondary':
      return { variant: 'solid' as const, action: 'secondary' as const };
    case 'ghost':
      return { variant: 'link' as const, action: 'primary' as const };
    case 'outline':
      return { variant: 'outline' as const, action: 'primary' as const };
    default:
      return { variant: 'solid' as const, action: 'primary' as const };
  }
};

// Map our custom sizes to Gluestack UI sizes
const mapSizeToGluestack = (size: ButtonSize) => {
  switch (size) {
    case 'small':
      return 'sm' as const;
    case 'medium':
      return 'md' as const;
    case 'large':
      return 'lg' as const;
    default:
      return 'md' as const;
  }
};

export const Button = React.memo<ButtonProps>(({
  variant = 'primary',
  size = 'medium',
  loading = false,
  children,
  leftIcon,
  rightIcon,
  fullWidth = false,
  disabled,
  onPress,
  className,
  gradient = false,
  ...props
}) => {
  const scaleAnim = React.useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    Animated.spring(scaleAnim, {
      toValue: 0.96,
      useNativeDriver: true,
      tension: 300,
      friction: 10,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      useNativeDriver: true,
      tension: 300,
      friction: 10,
    }).start();
  };

  const handlePress = (event: any) => {
    if (onPress && !loading && !disabled) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      onPress(event);
    }
  };

  const gluestackVariant = mapVariantToGluestack(variant);
  const gluestackSize = mapSizeToGluestack(size);
  const isDisabled = disabled || loading;

  // Enhanced styles for primary variant with gradient
  const enhancedStyles = variant === 'primary' && gradient
    ? 'shadow-lg shadow-blue-500/50 elevation-8'
    : '';

  const finalClassName = `
    ${fullWidth ? 'w-full' : ''}
    ${enhancedStyles}
    ${className || ''}
  `.trim();

  // Button with gradient (for primary variant)
  if (variant === 'primary' && gradient) {
    return (
      <Animated.View
        style={[
          { transform: [{ scale: scaleAnim }] },
          fullWidth && { width: '100%' }
        ]}
      >
        <GluestackButton
          {...props}
          variant={gluestackVariant.variant}
          action={gluestackVariant.action}
          size={gluestackSize}
          disabled={isDisabled}
          onPress={handlePress}
          onPressIn={handlePressIn}
          onPressOut={handlePressOut}
          className={`${finalClassName} overflow-hidden rounded-2xl`}
          style={styles.gradientButton}
        >
          <LinearGradient
            colors={isDisabled
              ? ['#9CA3AF', '#6B7280']
              : ['#3B82F6', '#1D4ED8', '#1E40AF']
            }
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={[
              styles.gradient,
              size === 'large' && styles.gradientLarge,
              size === 'medium' && styles.gradientMedium,
              size === 'small' && styles.gradientSmall,
            ]}
          >
            {leftIcon && (
              <ButtonIcon className="mr-2">{leftIcon}</ButtonIcon>
            )}

            {loading ? (
              <ButtonSpinner color="white" />
            ) : (
              <ButtonText className="text-white font-semibold text-base">
                {children}
              </ButtonText>
            )}

            {rightIcon && (
              <ButtonIcon className="ml-2">{rightIcon}</ButtonIcon>
            )}
          </LinearGradient>
        </GluestackButton>
      </Animated.View>
    );
  }

  // Regular button (no gradient)
  return (
    <Animated.View
      style={[
        { transform: [{ scale: scaleAnim }] },
        fullWidth && { width: '100%' }
      ]}
    >
      <GluestackButton
        {...props}
        variant={gluestackVariant.variant}
        action={gluestackVariant.action}
        size={gluestackSize}
        disabled={isDisabled}
        onPress={handlePress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        className={finalClassName}
      >
        {leftIcon && (
          <ButtonIcon>{leftIcon}</ButtonIcon>
        )}

        {loading ? (
          <ButtonSpinner />
        ) : (
          <ButtonText>{children}</ButtonText>
        )}

        {rightIcon && (
          <ButtonIcon>{rightIcon}</ButtonIcon>
        )}
      </GluestackButton>
    </Animated.View>
  );
});

Button.displayName = 'Button';

const styles = StyleSheet.create({
  gradientButton: {
    padding: 0,
    overflow: 'hidden',
  },
  gradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  gradientSmall: {
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  gradientMedium: {
    paddingVertical: 12,
    paddingHorizontal: 20,
  },
  gradientLarge: {
    paddingVertical: 16,
    paddingHorizontal: 24,
  },
});