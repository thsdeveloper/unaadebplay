import React from 'react';
import { Text as RNText, TextProps as RNTextProps, TextStyle } from 'react-native';

export type TextVariant = 'heading' | 'subheading' | 'body' | 'label' | 'caption' | 'error' | 'button' | 'h1' | 'h2' | 'h3';
export type TextSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl';
export type TextWeight = 'normal' | 'medium' | 'semibold' | 'bold';

interface TextProps extends RNTextProps {
  variant?: TextVariant;
  size?: TextSize;
  weight?: TextWeight;
  color?: string;
  align?: 'left' | 'center' | 'right';
  children: React.ReactNode;
}

const sizeMap: Record<TextSize, number> = {
  xs: 12,
  sm: 14,
  md: 16,
  lg: 18,
  xl: 20,
  '2xl': 24,
  '3xl': 32,
};

const variantStyles: Record<TextVariant, {
  size: TextSize;
  weight: TextWeight;
  color: string;
}> = {
  heading: {
    size: '2xl',
    weight: 'bold',
    color: 'white',
  },
  subheading: {
    size: 'lg',
    weight: 'semibold',
    color: 'white',
  },
  body: {
    size: 'md',
    weight: 'normal',
    color: 'rgba(255,255,255,0.8)',
  },
  label: {
    size: 'sm',
    weight: 'medium',
    color: 'rgba(255,255,255,0.7)',
  },
  caption: {
    size: 'xs',
    weight: 'normal',
    color: 'rgba(255,255,255,0.5)',
  },
  error: {
    size: 'sm',
    weight: 'normal',
    color: '#ef4444',
  },
  button: {
    size: 'md',
    weight: 'medium',
    color: 'white',
  },
  h1: {
    size: '3xl',
    weight: 'bold',
    color: 'white',
  },
  h2: {
    size: '2xl',
    weight: 'bold',
    color: 'white',
  },
  h3: {
    size: 'xl',
    weight: 'semibold',
    color: 'white',
  },
};

const weightMap: Record<TextWeight, string> = {
  normal: '400',
  medium: '500',
  semibold: '600',
  bold: '700',
};

export const Text: React.FC<TextProps> = React.memo(({
  variant = 'body',
  size,
  weight,
  color,
  align = 'left',
  style,
  children,
  ...props
}) => {
  const variantStyle = variantStyles[variant] || variantStyles.body;
  
  const textStyle: TextStyle = {
    fontSize: sizeMap[size || variantStyle.size],
    fontWeight: weightMap[weight || variantStyle.weight] as any,
    color: color || variantStyle.color,
    textAlign: align,
  };

  return (
    <RNText style={[textStyle, style]} {...props}>
      {children}
    </RNText>
  );
});

Text.displayName = 'Text';