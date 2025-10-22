import React, { useState, forwardRef } from 'react';
import { TextInputProps } from 'react-native';
import { Input as GluestackInput, InputField, InputIcon, InputSlot } from '@/components/ui/input';
import {
  FormControl,
  FormControlLabel,
  FormControlLabelText,
  FormControlError,
  FormControlErrorText,
  FormControlHelper,
  FormControlHelperText
} from '@/components/ui/form-control';
import { Pressable } from '@/components/ui/pressable';
import { Icon as UIIcon } from '@/components/ui/icon';
import { EyeIcon, EyeOffIcon, AlertCircleIcon } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';

export type InputVariant = 'outline' | 'underlined' | 'rounded';
export type InputSize = 'sm' | 'md' | 'lg' | 'xl';
export type InputState = 'default' | 'focused' | 'error' | 'disabled';

interface InputProps extends Omit<TextInputProps, 'editable'> {
  /** Label text displayed above the input */
  label?: string;

  /** Error message displayed below the input */
  error?: string;

  /** Helper text displayed below the input when no error */
  helperText?: string;

  /** Visual variant of the input */
  variant?: InputVariant;

  /** Size of the input */
  size?: InputSize;

  /** Current state of the input */
  state?: InputState;

  /** Show password toggle button (only works with secureTextEntry) */
  showPasswordToggle?: boolean;

  /** Icon name from lucide-react-native */
  leftIcon?: React.ComponentType<any>;

  /** Right side custom icon */
  rightIcon?: React.ComponentType<any>;

  /** Makes the input disabled */
  disabled?: boolean;

  /** Makes the label show required asterisk */
  isRequired?: boolean;

  /** Custom class name */
  className?: string;
}

export const Input = forwardRef<any, InputProps>(({
  label,
  error,
  helperText,
  variant = 'outline',
  size = 'md',
  state = 'default',
  showPasswordToggle = false,
  secureTextEntry,
  leftIcon: LeftIcon,
  rightIcon: RightIcon,
  disabled = false,
  isRequired = false,
  className,
  value,
  ...props
}, ref) => {
  const [showPassword, setShowPassword] = useState(false);
  const [isFocused, setIsFocused] = useState(false);

  // Determine if input is in invalid state
  const isInvalid = !!error || state === 'error';
  const isDisabled = disabled || state === 'disabled';

  // Handle password toggle with haptic feedback
  const handlePasswordToggle = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setShowPassword(!showPassword);
  };

  // Handle focus events
  const handleFocus = (e: any) => {
    setIsFocused(true);
    props.onFocus?.(e);
  };

  const handleBlur = (e: any) => {
    setIsFocused(false);
    props.onBlur?.(e);
  };

  return (
    <FormControl
      size={size}
      isDisabled={isDisabled}
      isInvalid={isInvalid}
      isRequired={isRequired}
      className={className}
    >
      {label && (
        <FormControlLabel>
          <FormControlLabelText>{label}</FormControlLabelText>
        </FormControlLabel>
      )}

      <GluestackInput
        variant={variant}
        size={size}
        isDisabled={isDisabled}
        isInvalid={isInvalid}
        isFocused={isFocused}
      >
        {LeftIcon && (
          <InputSlot className="pl-3">
            <InputIcon as={LeftIcon} />
          </InputSlot>
        )}

        <InputField
          ref={ref}
          value={value}
          secureTextEntry={secureTextEntry && !showPassword}
          editable={!isDisabled}
          onFocus={handleFocus}
          onBlur={handleBlur}
          {...props}
        />

        {showPasswordToggle && secureTextEntry && (
          <InputSlot className="pr-3">
            <Pressable onPress={handlePasswordToggle} disabled={isDisabled}>
              <InputIcon
                as={showPassword ? EyeIcon : EyeOffIcon}
              />
            </Pressable>
          </InputSlot>
        )}

        {RightIcon && !showPasswordToggle && (
          <InputSlot className="pr-3">
            <InputIcon as={RightIcon} />
          </InputSlot>
        )}
      </GluestackInput>

      {error && (
        <FormControlError>
          <FormControlErrorText>{error}</FormControlErrorText>
        </FormControlError>
      )}

      {helperText && !error && (
        <FormControlHelper>
          <FormControlHelperText>{helperText}</FormControlHelperText>
        </FormControlHelper>
      )}
    </FormControl>
  );
});

Input.displayName = 'Input';
