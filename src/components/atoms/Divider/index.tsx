import { Divider as UIDivider } from '@/components/ui/divider';
import { memo } from 'react';
import { cn } from '@/utils/cn';

interface DividerProps {
  orientation?: 'horizontal' | 'vertical';
  thickness?: 'thin' | 'medium' | 'thick';
  color?: 'default' | 'muted' | 'light';
  spacing?: 'none' | 'sm' | 'md' | 'lg';
  className?: string;
}

const thicknessStyles = {
  thin: 'h-px',
  medium: 'h-0.5',
  thick: 'h-1',
};

const colorStyles = {
  default: 'bg-gray-300 dark:bg-gray-600',
  muted: 'bg-gray-200 dark:bg-gray-700',
  light: 'bg-gray-100 dark:bg-gray-800',
};

const spacingStyles = {
  none: '',
  sm: 'my-2',
  md: 'my-4',
  lg: 'my-6',
};

export const Divider = memo<DividerProps>(({
  orientation = 'horizontal',
  thickness = 'thin',
  color = 'default',
  spacing = 'md',
  className,
  ...props
}) => {
  const baseClasses = cn(
    orientation === 'horizontal' ? 'w-full' : 'h-full w-px',
    orientation === 'horizontal' ? thicknessStyles[thickness] : 'w-px',
    colorStyles[color],
    spacingStyles[spacing],
    className
  );

  return (
    <UIDivider 
      className={baseClasses}
      orientation={orientation}
      {...props}
    />
  );
});

Divider.displayName = 'Divider';