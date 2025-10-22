import React, { useState, useRef, useEffect, forwardRef } from 'react';
import {
  View,
  TextInput,
  TextInputProps,
  Animated,
  TouchableOpacity,
  ViewStyle,
  TextStyle,
} from 'react-native';
import { MaterialIcons, Feather } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import { Text } from '../Text';

export type InputState = 'default' | 'focused' | 'error' | 'disabled';

interface InputProps extends TextInputProps {
  icon?: keyof typeof MaterialIcons.glyphMap;
  label?: string;
  error?: string;
  state?: InputState;
  showPasswordToggle?: boolean;
  containerStyle?: ViewStyle;
  inputStyle?: TextStyle;
}

export const Input = forwardRef<TextInput, InputProps>(({
  icon,
  label,
  error,
  state = 'default',
  showPasswordToggle = false,
  secureTextEntry,
  containerStyle,
  inputStyle,
  value,
  onFocus,
  onBlur,
  editable = true,
  ...props
}, ref) => {
  const [isFocused, setIsFocused] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const animatedValue = useRef(new Animated.Value(0)).current;

  const currentState = error ? 'error' : (isFocused ? 'focused' : state);
  const isDisabled = !editable || state === 'disabled';

  useEffect(() => {
    Animated.timing(animatedValue, {
      toValue: isFocused || value ? 1 : 0,
      duration: 200,
      useNativeDriver: false,
    }).start();
  }, [isFocused, value]);

  const handleFocus = (e: any) => {
    setIsFocused(true);
    onFocus?.(e);
  };

  const handleBlur = (e: any) => {
    setIsFocused(false);
    onBlur?.(e);
  };

  const getBorderColor = () => {
    switch (currentState) {
      case 'error': return '#ef4444';
      case 'focused': return '#60a5fa';
      case 'disabled': return 'rgba(255,255,255,0.1)';
      default: return 'rgba(255,255,255,0.2)';
    }
  };

  const getIconColor = () => {
    switch (currentState) {
      case 'error': return '#ef4444';
      case 'focused': return '#60a5fa';
      case 'disabled': return 'rgba(255,255,255,0.3)';
      default: return 'rgba(255,255,255,0.5)';
    }
  };

  const labelStyle: any = label ? {
    position: 'absolute' as const,
    left: icon ? 40 : 16,
    top: animatedValue.interpolate({
      inputRange: [0, 1],
      outputRange: [18, -8],
    }),
    fontSize: animatedValue.interpolate({
      inputRange: [0, 1],
      outputRange: [16, 12],
    }),
    color: animatedValue.interpolate({
      inputRange: [0, 1],
      outputRange: ['rgba(255,255,255,0.5)', 'rgba(255,255,255,0.9)'],
    }),
    backgroundColor: 'transparent',
  } : null;

  return (
    <View style={[containerStyle]}>
      <View 
        style={{
          borderRadius: 16,
          overflow: 'hidden',
          borderWidth: 1,
          borderColor: getBorderColor(),
          opacity: isDisabled ? 0.6 : 1,
        }}
      >
        <BlurView intensity={30} tint="dark">
          <View style={{ 
            flexDirection: 'row', 
            alignItems: 'center',
            paddingHorizontal: 16,
            height: 60,
            backgroundColor: 'rgba(255,255,255,0.05)'
          }}>
            {icon && (
              <MaterialIcons 
                name={icon} 
                size={20} 
                color={getIconColor()} 
              />
            )}
            
            {label && <Animated.Text style={labelStyle}>{label}</Animated.Text>}
            
            <TextInput
              ref={ref}
              style={[{
                flex: 1,
                marginLeft: icon ? 12 : 0,
                fontSize: 16,
                color: isDisabled ? 'rgba(255,255,255,0.3)' : 'white',
                backgroundColor: 'transparent',
              }, inputStyle]}
              value={value}
              onFocus={handleFocus}
              onBlur={handleBlur}
              secureTextEntry={secureTextEntry && !showPassword}
              placeholderTextColor="rgba(255,255,255,0.3)"
              editable={!isDisabled}
              {...props}
            />
            
            {showPasswordToggle && secureTextEntry && (
              <TouchableOpacity
                onPress={() => setShowPassword(!showPassword)}
                style={{ padding: 4 }}
                disabled={isDisabled}
              >
                <Feather 
                  name={showPassword ? "eye" : "eye-off"} 
                  size={20} 
                  color={getIconColor()} 
                />
              </TouchableOpacity>
            )}
          </View>
        </BlurView>
      </View>
      {error && (
        <Text variant="error" style={{ marginTop: 4, marginLeft: 4 }}>
          {error}
        </Text>
      )}
    </View>
  );
});

Input.displayName = 'Input';