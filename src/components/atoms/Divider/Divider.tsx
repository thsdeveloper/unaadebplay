import React from 'react';
import { View, ViewStyle } from 'react-native';
import { Text } from '../Text';

interface DividerProps {
  text?: string;
  color?: string;
  thickness?: number;
  style?: ViewStyle;
  textStyle?: ViewStyle;
}

export const Divider: React.FC<DividerProps> = React.memo(({
  text,
  color = 'rgba(255,255,255,0.2)',
  thickness = 1,
  style,
  textStyle,
}) => {
  if (text) {
    return (
      <View style={[{
        flexDirection: 'row',
        alignItems: 'center',
        marginVertical: 24,
      }, style]}>
        <View style={{ flex: 1, height: thickness, backgroundColor: color }} />
        <Text 
          variant="caption" 
          style={[{ 
            marginHorizontal: 16, 
          }, textStyle]}
        >
          {text}
        </Text>
        <View style={{ flex: 1, height: thickness, backgroundColor: color }} />
      </View>
    );
  }

  return (
    <View 
      style={[{
        height: thickness,
        backgroundColor: color,
        marginVertical: 12,
      }, style]} 
    />
  );
});

Divider.displayName = 'Divider';