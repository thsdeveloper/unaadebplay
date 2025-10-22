import React from 'react';
import {
  Button as GluestackButton,
  ButtonText,
  ButtonSpinner,
  ButtonIcon
} from '@/components/ui/button';
import * as Haptics from 'expo-haptics';
import type { PressableProps } from 'react-native';

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
  ...props
}) => {
  const handlePress = (event: any) => {
    if (onPress && !loading && !disabled) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      onPress(event);
    }
  };

  const gluestackVariant = mapVariantToGluestack(variant);
  const gluestackSize = mapSizeToGluestack(size);
  const isDisabled = disabled || loading;

  const finalClassName = `
    ${fullWidth ? 'w-full' : ''}
    ${className || ''}
  `.trim();

  return (
    <GluestackButton
      {...props}
      variant={gluestackVariant.variant}
      action={gluestackVariant.action}
      size={gluestackSize}
      disabled={isDisabled}
      onPress={handlePress}
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
  );
});

Button.displayName = 'Button';