import React, { useState, useRef } from "react";
import { TextInputMask } from "react-native-masked-text";
import { MaterialIcons } from "@expo/vector-icons";
import { Animated, TextInput } from "react-native";

import {
    Input,
    InputField,
    InputSlot,
    InputIcon
} from "@/components/ui/input";

import {
    FormControl,
    FormControlError,
    FormControlErrorText,
} from "@/components/ui/form-control";

import { Icon } from "@/components/ui/icon";
import { Pressable } from "@/components/ui/pressable";

type Props = {
    errorMessage?: string | null;
    isPassword?: boolean;
    mask?: {
        type: string;
        options?: object;
    };
    placeholder?: string;
    value?: string;
    onChangeText?: (text: string) => void;
    onBlur?: () => void;
    autoCapitalize?: "none" | "sentences" | "words" | "characters";
    keyboardType?: "default" | "email-address" | "numeric";
    autoCorrect?: boolean;
    leftIcon?: React.ReactNode;
};

export function CustomInput({
                                errorMessage = null,
                                isPassword = false,
                                mask,
                                leftIcon,
                                ...rest
                            }: Props) {
    const [showPassword, setShowPassword] = useState(false);
    const [isFocused, setIsFocused] = useState(false);
    const hasError = !!errorMessage;
    const inputRef = useRef<TextInput>(null);

    // Animação para o efeito de foco
    const scaleAnim = useState(new Animated.Value(1))[0];

    const handleTogglePassword = () => {
        setShowPassword(!showPassword);
    };

    const handleFocus = () => {
        setIsFocused(true);
        Animated.timing(scaleAnim, {
            toValue: 1.02,
            duration: 200,
            useNativeDriver: true,
        }).start();
    };

    const handleBlur = () => {
        setIsFocused(false);
        Animated.timing(scaleAnim, {
            toValue: 1,
            duration: 200,
            useNativeDriver: true,
        }).start();

        if (rest.onBlur) {
            rest.onBlur();
        }
    };

    // Força o foco no input quando o componente é pressionado
    const forceFocus = () => {
        if (inputRef.current) {
            inputRef.current.focus();
        }
    };

    return (
        <Animated.View style={{
            transform: [{ scale: scaleAnim }],
            marginVertical: 4
        }}>
            <FormControl isInvalid={hasError}>
                <Pressable onPress={forceFocus}>
                    <Input
                        isInvalid={hasError}
                        variant="outline"
                        size="md"
                        className={`bg-blue-950 bg-opacity-40 border-blue-800 rounded-lg ${isFocused ? 'border-blue-500' : ''}`}
                    >
                        {leftIcon && (
                            <InputSlot pl="3">
                                {leftIcon}
                            </InputSlot>
                        )}

                        {mask ? (
                            <TextInputMask
                                type={mask.type}
                                options={mask.options}
                                value={rest.value}
                                onChangeText={rest.onChangeText}
                                customTextInput={InputField}
                                onFocus={handleFocus}
                                onBlur={handleBlur}
                                ref={inputRef}
                                customTextInputProps={{
                                    placeholder: rest.placeholder,
                                    secureTextEntry: isPassword && !showPassword,
                                    style: {
                                        padding: 16,
                                        fontSize: 16,
                                        flex: 1,
                                        color: '#ffffff',
                                    },
                                    placeholderTextColor: '#94a3b8',
                                    keyboardType: rest.keyboardType || 'default',
                                    autoCapitalize: rest.autoCapitalize || 'none',
                                    autoCorrect: rest.autoCorrect !== undefined ? rest.autoCorrect : false,
                                    editable: true,
                                    showSoftInputOnFocus: true,
                                }}
                            />
                        ) : (
                            <InputField
                                {...rest}
                                secureTextEntry={isPassword && !showPassword}
                                onFocus={handleFocus}
                                onBlur={handleBlur}
                                className="text-white"
                                placeholderTextColor="#94a3b8"
                                editable={true}
                                ref={inputRef}
                                showSoftInputOnFocus={true}
                            />
                        )}

                        {isPassword && (
                            <InputSlot pr="3">
                                <Pressable onPress={handleTogglePassword}>
                                    <InputIcon>
                                        <Icon
                                            as={MaterialIcons}
                                            name={showPassword ? "visibility-off" : "visibility"}
                                            size="sm"
                                            color="blue.300"
                                        />
                                    </InputIcon>
                                </Pressable>
                            </InputSlot>
                        )}
                    </Input>
                </Pressable>

                {hasError && (
                    <FormControlError>
                        <FormControlErrorText className="text-red-400">{errorMessage}</FormControlErrorText>
                    </FormControlError>
                )}
            </FormControl>
        </Animated.View>
    );
}
