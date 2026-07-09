import { Icon as UIIcon } from '@/components/ui/icon';
import { memo } from 'react';
import { cn } from '@/utils/cn';

interface IconProps {
  name: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  color?: 'primary' | 'secondary' | 'muted' | 'white' | 'error' | 'success' | 'warning';
  className?: string;
  onPress?: () => void;
}

const sizeStyles = {
  xs: 'w-3 h-3',
  sm: 'w-4 h-4',
  md: 'w-5 h-5',
  lg: 'w-6 h-6',
  xl: 'w-8 h-8',
  '2xl': 'w-10 h-10',
};

const colorStyles = {
  primary: 'text-blue-600 dark:text-blue-400',
  secondary: 'text-gray-600 dark:text-gray-300',
  muted: 'text-gray-400 dark:text-gray-500',
  white: 'text-white',
  error: 'text-red-500',
  success: 'text-green-500',
  warning: 'text-yellow-500',
};

export const Icon = memo<IconProps>(({
  name,
  size = 'md',
  color = 'primary',
  className,
  onPress,
  ...props
}) => {
  const baseClasses = cn(
    sizeStyles[size],
    colorStyles[color],
    onPress && 'cursor-pointer active:scale-95 transition-transform',
    className
  );

  return (
    <UIIcon 
      as={name as any}
      className={baseClasses}
      onPress={onPress}
      {...props}
    />
  );
});

Icon.displayName = 'Icon';