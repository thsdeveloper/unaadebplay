import React from 'react';
import { View, ViewStyle } from 'react-native';
import { Input } from '@/components/atoms/Input';
import { Text } from '@/components/atoms/Text';
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
  inputRef?: React.RefObject<any>;
}

export const FormField: React.FC<FormFieldProps> = React.memo(({
  label,
  error,
  required,
  containerStyle,
  inputRef,
  ...inputProps
}) => {
  return (
    <View style={[{ marginBottom: 16 }, containerStyle]}>
      {label && (
        <View style={{ flexDirection: 'row', marginBottom: 8 }}>
          <Text variant="label">
            {label}
          </Text>
          {required && (
            <Text variant="label" color="#ef4444" style={{ marginLeft: 4 }}>
              *
            </Text>
          )}
        </View>
      )}
      <Input
        ref={inputRef}
        {...inputProps}
        error={error}
        showPasswordToggle={inputProps.secureTextEntry}
      />
      {error && (
        <Text variant="error" style={{ marginTop: 4, marginLeft: 16 }}>
          {error}
        </Text>
      )}
    </View>
  );
});

FormField.displayName = 'FormField';