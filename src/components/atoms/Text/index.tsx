import { Text as UIText } from '@/components/ui/text';
import { memo } from 'react';
import { cn } from '@/utils/cn';

interface TextProps {
  children: React.ReactNode;
  variant?: 'heading' | 'subheading' | 'body' | 'caption' | 'label';
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl';
  weight?: 'normal' | 'medium' | 'semibold' | 'bold';
  color?: 'primary' | 'secondary' | 'muted' | 'white' | 'error' | 'success';
  align?: 'left' | 'center' | 'right';
  className?: string;
}

const variantStyles = {
  heading: 'text-2xl font-bold',
  subheading: 'text-xl font-semibold',
  body: 'text-base font-normal',
  caption: 'text-sm font-normal',
  label: 'text-sm font-medium',
};

const sizeStyles = {
  xs: 'text-xs',
  sm: 'text-sm',
  md: 'text-base',
  lg: 'text-lg',
  xl: 'text-xl',
  '2xl': 'text-2xl',
  '3xl': 'text-3xl',
};

const weightStyles = {
  normal: 'font-normal',
  medium: 'font-medium',
  semibold: 'font-semibold',
  bold: 'font-bold',
};

const colorStyles = {
  primary: 'text-gray-900 dark:text-white',
  secondary: 'text-gray-600 dark:text-gray-300',
  muted: 'text-gray-500 dark:text-gray-400',
  white: 'text-white',
  error: 'text-red-500',
  success: 'text-green-500',
};

const alignStyles = {
  left: 'text-left',
  center: 'text-center',
  right: 'text-right',
};

export const Text = memo<TextProps>(({
  children,
  variant = 'body',
  size,
  weight,
  color = 'primary',
  align = 'left',
  className,
  ...props
}) => {
  const baseClasses = cn(
    variantStyles[variant],
    size && sizeStyles[size],
    weight && weightStyles[weight],
    colorStyles[color],
    alignStyles[align],
    className
  );

  return (
    <UIText className={baseClasses} {...props}>
      {children}
    </UIText>
  );
});

Text.displayName = 'Text';