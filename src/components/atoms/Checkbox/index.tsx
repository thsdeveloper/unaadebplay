import { Checkbox as UICheckbox } from '@/components/ui/checkbox';
import { memo } from 'react';
import { cn } from '@/utils/cn';

interface CheckboxProps {
  value: boolean;
  onValueChange: (value: boolean) => void;
  label?: string;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'default' | 'primary' | 'success' | 'error';
  disabled?: boolean;
  className?: string;
}

const sizeStyles = {
  sm: 'w-4 h-4',
  md: 'w-5 h-5',
  lg: 'w-6 h-6',
};

const variantStyles = {
  default: {
    checked: 'bg-gray-600 border-gray-600',
    unchecked: 'border-gray-300 dark:border-gray-600',
  },
  primary: {
    checked: 'bg-blue-600 border-blue-600',
    unchecked: 'border-gray-300 dark:border-gray-600',
  },
  success: {
    checked: 'bg-green-600 border-green-600',
    unchecked: 'border-gray-300 dark:border-gray-600',
  },
  error: {
    checked: 'bg-red-600 border-red-600',
    unchecked: 'border-gray-300 dark:border-gray-600',
  },
};

export const Checkbox = memo<CheckboxProps>(({
  value,
  onValueChange,
  label,
  size = 'md',
  variant = 'default',
  disabled = false,
  className,
  ...props
}) => {
  const baseClasses = cn(
    sizeStyles[size],
    'rounded border-2 transition-colors duration-200',
    value ? variantStyles[variant].checked : variantStyles[variant].unchecked,
    disabled && 'opacity-50 cursor-not-allowed',
    !disabled && 'cursor-pointer active:scale-95',
    className
  );

  return (
    <UICheckbox
      value={value}
      onValueChange={onValueChange}
      isDisabled={disabled}
      className={baseClasses}
      aria-label={label}
      {...props}
    />
  );
});

Checkbox.displayName = 'Checkbox';