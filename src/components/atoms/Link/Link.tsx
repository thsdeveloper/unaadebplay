import React from 'react';
import { TouchableOpacity, TouchableOpacityProps } from 'react-native';
import { Link as ExpoLink } from 'expo-router';
import { Text } from '../Text';

interface LinkProps extends TouchableOpacityProps {
  href: string;
  children: React.ReactNode;
  color?: string;
  underline?: boolean;
  size?: 'sm' | 'md' | 'lg';
  weight?: 'normal' | 'medium' | 'semibold' | 'bold';
}

export const Link: React.FC<LinkProps> = React.memo(({
  href,
  children,
  color = '#60a5fa',
  underline = false,
  size = 'md',
  weight = 'medium',
  style,
  ...props
}) => {
  return (
    <ExpoLink href={href as any} asChild>
      <TouchableOpacity style={style} {...props}>
        <Text
          size={size}
          weight={weight}
          color={color}
          style={{
            textDecorationLine: underline ? 'underline' : 'none',
          }}
        >
          {children}
        </Text>
      </TouchableOpacity>
    </ExpoLink>
  );
});

Link.displayName = 'Link';