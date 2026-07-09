import React from 'react';
import { TouchableOpacity, View, ViewStyle } from 'react-native';
import * as Haptics from 'expo-haptics';
import { Icon } from '../Icon';
import { Text } from '../Text';

interface CheckboxProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label?: string;
  disabled?: boolean;
  size?: number;
  color?: string;
  style?: ViewStyle;
}

export const Checkbox: React.FC<CheckboxProps> = React.memo(({
  checked,
  onChange,
  label,
  disabled = false,
  size = 24,
  color = '#60a5fa',
  style,
}) => {
  const handlePress = () => {
    if (!disabled) {
      Haptics.selectionAsync();
      onChange(!checked);
    }
  };

  return (
    <TouchableOpacity
      onPress={handlePress}
      disabled={disabled}
      style={[{
        flexDirection: 'row',
        alignItems: 'center',
        opacity: disabled ? 0.5 : 1,
      }, style]}
    >
      <View
        style={{
          width: size,
          height: size,
          borderRadius: 6,
          borderWidth: 2,
          borderColor: checked ? color : 'rgba(255,255,255,0.3)',
          backgroundColor: checked ? color : 'transparent',
          justifyContent: 'center',
          alignItems: 'center',
          marginRight: label ? 8 : 0,
        }}
      >
        {checked && (
          <Icon
            family="MaterialIcons"
            name="check"
            size={size * 0.7}
            color="white"
          />
        )}
      </View>
      {label && (
        <Text variant="body" color="rgba(255,255,255,0.8)">
          {label}
        </Text>
      )}
    </TouchableOpacity>
  );
});

Checkbox.displayName = 'Checkbox';