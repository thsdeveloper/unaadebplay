import React from 'react';
import { ViewStyle, TextInput, TextInputProps } from 'react-native';
import { Input } from '@/components/atoms/Input';
import { MaterialIcons } from '@expo/vector-icons';

interface FormFieldProps extends Omit<TextInputProps, 'editable'> {
  /** Label text displayed above the input */
  label?: string;

  /** Error message displayed below the input */
  error?: string;

  /** Helper text displayed below the input when no error */
  helperText?: string;

  /** Makes the label show required asterisk */
  required?: boolean;

  /** Container style for the FormField */
  containerStyle?: ViewStyle;

  /** Icon from MaterialIcons (left side) */
  icon?: keyof typeof MaterialIcons.glyphMap;

  /** Ref for the input */
  inputRef?: React.Ref<TextInput>;

  /** Makes the input disabled */
  disabled?: boolean;
}

export const FormField: React.FC<FormFieldProps> = React.memo(({
  label,
  error,
  helperText,
  required,
  containerStyle,
  inputRef,
  icon,
  disabled,
  secureTextEntry,
  ...inputProps
}) => {
  // Convert MaterialIcon name to a component
  const IconComponent = icon ? () => <MaterialIcons name={icon} size={20} /> : undefined;

  return (
    <Input
      ref={inputRef}
      label={label}
      error={error}
      helperText={helperText}
      isRequired={required}
      disabled={disabled}
      leftIcon={IconComponent}
      showPasswordToggle={secureTextEntry}
      secureTextEntry={secureTextEntry}
      variant="outline"
      size="lg"
      className="mb-2"
      {...inputProps}
    />
  );
});

FormField.displayName = 'FormField';
