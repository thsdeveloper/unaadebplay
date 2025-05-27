import React, { memo } from 'react';
import { Button as UIButton, ButtonText, ButtonSpinner } from '@/components/ui/button';
import { LinearGradient } from 'expo-linear-gradient';
import { View } from 'react-native';
import * as Haptics from 'expo-haptics';
import { Icon } from '@/components/atoms/Icon';

export interface ButtonProps {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger' | 'success';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  disabled?: boolean;
  children: React.ReactNode;
  onPress?: () => void;
  className?: string;
  leftIcon?: React.ReactNode | string;
  rightIcon?: React.ReactNode | string;
}

const getButtonStyles = (variant: string, size: string, disabled: boolean, loading: boolean) => {
  const baseClasses = "rounded-xl flex-row items-center justify-center";
  
  const sizeClasses = {
    sm: "px-4 py-2 h-10",
    md: "px-6 py-3 h-12", 
    lg: "px-8 py-4 h-14"
  };

  const variantClasses = {
    primary: "",
    secondary: "bg-gray-200 active:bg-gray-300 border border-gray-300",
    ghost: "bg-transparent border border-white/20 active:bg-white/10",
    danger: "bg-red-500 active:bg-red-600",
    success: "bg-green-500 active:bg-green-600"
  };

  const disabledClasses = disabled || loading ? "opacity-60" : "active:opacity-80";

  return `${baseClasses} ${sizeClasses[size]} ${variantClasses[variant]} ${disabledClasses}`;
};

const getTextStyles = (variant: string, size: string) => {
  const sizeClasses = {
    sm: "text-sm",
    md: "text-base",
    lg: "text-lg"
  };

  const variantClasses = {
    primary: "text-white font-semibold",
    secondary: "text-gray-900 font-semibold", 
    ghost: "text-white font-semibold",
    danger: "text-white font-semibold",
    success: "text-white font-semibold"
  };

  return `${sizeClasses[size]} ${variantClasses[variant]}`;
};

export const Button = memo<ButtonProps>(({
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  children,
  onPress,
  className,
  leftIcon,
  rightIcon,
  ...props
}) => {
  const handlePress = () => {
    if (!disabled && !loading && onPress) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      onPress();
    }
  };

  const renderIcon = (icon: React.ReactNode | string | undefined, side: 'left' | 'right') => {
    if (!icon) return null;
    
    if (typeof icon === 'string') {
      const iconColor = variant === 'secondary' ? 'secondary' : 'white';
      const iconSize = size === 'sm' ? 'sm' : size === 'lg' ? 'lg' : 'md';
      return (
        <Icon 
          name={icon} 
          color={iconColor} 
          size={iconSize}
          className={side === 'left' ? 'mr-2' : 'ml-2'}
        />
      );
    }
    
    return icon;
  };

  const buttonContent = (
    <UIButton
      className={`${getButtonStyles(variant, size, disabled, loading)} ${className || ''}`}
      onPress={handlePress}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? (
        <ButtonSpinner color={variant === 'primary' ? 'white' : variant === 'secondary' ? 'black' : 'white'} />
      ) : (
        <>
          {renderIcon(leftIcon, 'left')}
          <ButtonText className={getTextStyles(variant, size)}>
            {children}
          </ButtonText>
          {renderIcon(rightIcon, 'right')}
        </>
      )}
    </UIButton>
  );

  // Aplicar gradiente apenas no variant primary
  if (variant === 'primary' && !disabled && !loading) {
    return (
      <View className="rounded-xl overflow-hidden">
        <LinearGradient
          colors={['#3b82f6', '#2563eb']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
        >
          {buttonContent}
        </LinearGradient>
      </View>
    );
  }

  return buttonContent;
});

Button.displayName = 'Button';