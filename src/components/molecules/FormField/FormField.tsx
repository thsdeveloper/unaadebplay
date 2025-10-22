import React from 'react';
import { ViewStyle, TextInput } from 'react-native';
import {
  FormControl,
  FormControlLabel,
  FormControlLabelText,
  FormControlError,
  FormControlErrorText,
  FormControlErrorIcon,
} from '@/components/ui/form-control';
import { Input, InputField, InputSlot, InputIcon } from '@/components/ui/input';
import { Icon, EyeIcon, EyeOffIcon, AlertCircleIcon } from '@/components/ui/icon';
import { MaterialIcons } from '@expo/vector-icons';

interface FormFieldProps {
  label?: string;
  error?: string;
  required?: boolean;
  containerStyle?: ViewStyle;
  // Input props
  icon?: keyof typeof MaterialIcons.glyphMap;
  placeholder?: string;
  value: string;
  onChangeText: (text: string) => void;
  onBlur?: () => void;
  onFocus?: () => void;
  secureTextEntry?: boolean;
  keyboardType?: 'default' | 'email-address' | 'numeric' | 'phone-pad';
  autoCapitalize?: 'none' | 'sentences' | 'words' | 'characters';
  returnKeyType?: 'done' | 'go' | 'next' | 'search' | 'send';
  onSubmitEditing?: () => void;
  editable?: boolean;
  inputRef?: React.Ref<TextInput>;
}

export const FormField: React.FC<FormFieldProps> = React.memo(({
  label,
  error,
  required,
  containerStyle,
  inputRef,
  icon,
  secureTextEntry,
  ...inputProps
}) => {
  const [showPassword, setShowPassword] = React.useState(false);

  const handleTogglePassword = React.useCallback(() => {
    setShowPassword(prev => !prev);
  }, []);

  return (
    <FormControl
      isInvalid={!!error}
      isRequired={required}
      className="mb-4"
    >
      {label && (
        <FormControlLabel className="mb-2">
          <FormControlLabelText size="sm">
            {label}
          </FormControlLabelText>
        </FormControlLabel>
      )}

      <Input
        variant="outline"
        size="lg"
        isInvalid={!!error}
      >
        {icon && (
          <InputSlot className="pl-3">
            <MaterialIcons name={icon} size={20} color="#6B7280" />
          </InputSlot>
        )}

        <InputField
          ref={inputRef as any}
          type={secureTextEntry && !showPassword ? 'password' : 'text'}
          {...inputProps}
        />

        {secureTextEntry && (
          <InputSlot className="pr-3" onPress={handleTogglePassword}>
            <InputIcon as={showPassword ? EyeIcon : EyeOffIcon} />
          </InputSlot>
        )}
      </Input>

      {error && (
        <FormControlError className="mt-1">
          <FormControlErrorIcon as={AlertCircleIcon} size="sm" />
          <FormControlErrorText size="xs">
            {error}
          </FormControlErrorText>
        </FormControlError>
      )}
    </FormControl>
  );
});

FormField.displayName = 'FormField';