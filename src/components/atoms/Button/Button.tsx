import React from 'react';
import {
  TouchableOpacity,
  Text,
  ActivityIndicator,
  ViewStyle,
  TextStyle,
  TouchableOpacityProps,
  View,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';

export type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'outline';
export type ButtonSize = 'small' | 'medium' | 'large';

interface ButtonProps extends TouchableOpacityProps {
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  children: React.ReactNode;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  fullWidth?: boolean;
}

const sizeStyles: Record<ButtonSize, { container: ViewStyle; text: TextStyle }> = {
  small: {
    container: { paddingVertical: 8, paddingHorizontal: 16 },
    text: { fontSize: 14 },
  },
  medium: {
    container: { paddingVertical: 12, paddingHorizontal: 20 },
    text: { fontSize: 16 },
  },
  large: {
    container: { paddingVertical: 16, paddingHorizontal: 24 },
    text: { fontSize: 18 },
  },
};

const variantStyles: Record<ButtonVariant, { 
  container?: ViewStyle; 
  text: TextStyle;
  gradient?: readonly [string, string, ...string[]];
}> = {
  primary: {
    text: { color: 'white', fontWeight: '600' },
    gradient: ['#3b82f6', '#2563eb'],
  },
  secondary: {
    container: { backgroundColor: 'rgba(255,255,255,0.1)' },
    text: { color: 'white', fontWeight: '500' },
  },
  ghost: {
    container: { backgroundColor: 'transparent' },
    text: { color: 'rgba(255,255,255,0.8)', fontWeight: '500' },
  },
  outline: {
    container: { 
      backgroundColor: 'transparent',
      borderWidth: 2,
      borderColor: 'rgba(255,255,255,0.2)',
    },
    text: { color: 'rgba(255,255,255,0.8)', fontWeight: '500' },
  },
};

export const Button: React.FC<ButtonProps> = React.memo(({
  variant = 'primary',
  size = 'medium',
  loading = false,
  children,
  leftIcon,
  rightIcon,
  fullWidth = false,
  disabled,
  onPress,
  style,
  ...props
}) => {
  const handlePress = (event: any) => {
    if (onPress && !loading && !disabled) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      onPress(event);
    }
  };

  const sizeStyle = sizeStyles[size];
  const variantStyle = variantStyles[variant];
  const isDisabled = disabled || loading;

  const containerStyle: ViewStyle = {
    borderRadius: 16,
    overflow: 'hidden',
    opacity: isDisabled ? 0.6 : 1,
    width: fullWidth ? '100%' : undefined,
    ...variantStyle.container,
  };

  const contentStyle: ViewStyle = {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    ...sizeStyle.container,
  };

  const textStyle: TextStyle = {
    ...sizeStyle.text,
    ...variantStyle.text,
    marginHorizontal: leftIcon || rightIcon ? 8 : 0,
  };

  const content = (
    <>
      {loading ? (
        <ActivityIndicator color={variantStyle.text.color} />
      ) : (
        <>
          {leftIcon}
          <Text style={textStyle}>{children}</Text>
          {rightIcon}
        </>
      )}
    </>
  );

  return (
    <TouchableOpacity
      {...props}
      disabled={isDisabled}
      onPress={handlePress}
      style={[containerStyle, style]}
    >
      {variantStyle.gradient ? (
        <LinearGradient
          colors={variantStyle.gradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={contentStyle}
        >
          {content}
        </LinearGradient>
      ) : (
        <View style={contentStyle}>{content}</View>
      )}
    </TouchableOpacity>
  );
});

Button.displayName = 'Button';