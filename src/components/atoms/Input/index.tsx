import React, { memo, useState } from 'react';
import { Input as UIInput, InputField, InputSlot, InputIcon } from '@/components/ui/input';
import { BlurView } from 'expo-blur';
import { View, TouchableOpacity } from 'react-native';
import { MaterialIcons, Feather } from '@expo/vector-icons';
import { Text } from '@/components/atoms/Text';

export interface InputProps {
  variant?: 'default' | 'filled' | 'outline' | 'blur';
  size?: 'sm' | 'md' | 'lg';
  type?: 'text' | 'password' | 'email';
  placeholder?: string;
  value?: string;
  onChangeText?: (text: string) => void;
  onBlur?: () => void;
  onFocus?: () => void;
  error?: string | boolean;
  disabled?: boolean;
  leftIcon?: keyof typeof MaterialIcons.glyphMap | string;
  rightIcon?: keyof typeof MaterialIcons.glyphMap | string;
  className?: string;
  keyboardType?: 'default' | 'email-address' | 'numeric' | 'phone-pad';
  autoCapitalize?: 'none' | 'sentences' | 'words' | 'characters';
  autoCorrect?: boolean;
  secureTextEntry?: boolean;
}

const getInputContainerStyles = (variant: string, size: string, error: boolean, isFocused: boolean) => {
  const baseClasses = "rounded-xl overflow-hidden border";
  
  const sizeClasses = {
    sm: "h-10",
    md: "h-12",
    lg: "h-14"
  };

  const variantClasses = {
    default: "bg-white/5 border-white/20",
    filled: "bg-gray-100 border-gray-200",
    outline: "bg-transparent border-white/30",
    blur: "bg-white/5 border-white/20"
  };

  const stateClasses = error 
    ? "border-red-500" 
    : isFocused 
    ? "border-blue-400" 
    : "";

  return `${baseClasses} ${sizeClasses[size]} ${variantClasses[variant]} ${stateClasses}`;
};

const getInputFieldStyles = (variant: string, size: string) => {
  const baseClasses = "flex-1 text-white bg-transparent";
  
  const sizeClasses = {
    sm: "text-sm px-3",
    md: "text-base px-4",
    lg: "text-lg px-4"
  };

  const variantClasses = {
    default: "placeholder:text-white/40",
    filled: "text-gray-900 placeholder:text-gray-500",
    outline: "placeholder:text-white/50",
    blur: "placeholder:text-white/40"
  };

  return `${baseClasses} ${sizeClasses[size]} ${variantClasses[variant]}`;
};

export const Input = memo<InputProps>(({
  variant = 'default',
  size = 'md',
  type = 'text',
  placeholder,
  value,
  onChangeText,
  onBlur,
  onFocus,
  error = false,
  disabled = false,
  leftIcon,
  rightIcon,
  className,
  keyboardType = 'default',
  autoCapitalize = 'none',
  autoCorrect = false,
  secureTextEntry,
  ...props
}) => {
  const [isFocused, setIsFocused] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  
  const hasError = Boolean(error);
  const errorMessage = typeof error === 'string' ? error : '';

  const handleFocus = () => {
    setIsFocused(true);
    onFocus?.();
  };

  const handleBlur = () => {
    setIsFocused(false);
    onBlur?.();
  };

  const iconColor = hasError 
    ? '#ef4444' 
    : isFocused 
    ? '#60a5fa' 
    : variant === 'filled' 
    ? '#6b7280' 
    : 'rgba(255,255,255,0.5)';

  const inputContent = (
    <UIInput
      className={`${getInputContainerStyles(variant, size, hasError, isFocused)} ${className || ''}`}
      isDisabled={disabled}
      isInvalid={hasError}
    >
      {leftIcon && (
        <InputSlot className="pl-3">
          <InputIcon asChild>
            <MaterialIcons 
              name={leftIcon} 
              size={20} 
              color={iconColor}
            />
          </InputIcon>
        </InputSlot>
      )}
      
      <InputField
        className={getInputFieldStyles(variant, size)}
        placeholder={placeholder}
        placeholderTextColor={variant === 'filled' ? '#9ca3af' : 'rgba(255,255,255,0.4)'}
        value={value}
        onChangeText={onChangeText}
        onFocus={handleFocus}
        onBlur={handleBlur}
        secureTextEntry={secureTextEntry !== undefined ? secureTextEntry : (type === 'password' && !showPassword)}
        keyboardType={type === 'email' ? 'email-address' : keyboardType}
        autoCapitalize={autoCapitalize}
        autoCorrect={autoCorrect}
        editable={!disabled}
        {...props}
      />
      
      {type === 'password' && (
        <InputSlot className="pr-3">
          <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
            <InputIcon asChild>
              <Feather 
                name={showPassword ? "eye" : "eye-off"} 
                size={20} 
                color={iconColor}
              />
            </InputIcon>
          </TouchableOpacity>
        </InputSlot>
      )}
      
      {rightIcon && type !== 'password' && (
        <InputSlot className="pr-3">
          <InputIcon asChild>
            <MaterialIcons 
              name={rightIcon} 
              size={20} 
              color={iconColor}
            />
          </InputIcon>
        </InputSlot>
      )}
    </UIInput>
  );

  const inputWithError = (content: React.ReactNode) => (
    <View>
      {content}
      {errorMessage && (
        <Text variant="caption" color="error" className="mt-1 ml-4">
          {errorMessage}
        </Text>
      )}
    </View>
  );

  // Aplicar blur effect nos variants default e blur
  if (variant === 'default' || variant === 'blur') {
    return inputWithError(
      <View className="rounded-xl overflow-hidden">
        <BlurView intensity={30} tint="dark">
          <View className="bg-white/5">
            {inputContent}
          </View>
        </BlurView>
      </View>
    );
  }

  return inputWithError(inputContent);
});

Input.displayName = 'Input';