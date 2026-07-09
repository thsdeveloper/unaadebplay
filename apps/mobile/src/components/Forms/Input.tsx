import React, {useState, useRef} from "react";
import {TextInputMask} from "react-native-masked-text";
import {MaterialIcons} from "@expo/vector-icons";
import {Animated, TextInput} from "react-native";

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
    FormControlErrorIcon,
    FormControlLabel,
    FormControlLabelText,
    FormControlHelper,
    FormControlHelperText,
} from "@/components/ui/form-control";

import {Icon} from "@/components/ui/icon";
import {Pressable} from "@/components/ui/pressable";
import {AlertCircleIcon} from "@/components/ui/icon";

type Props = {
    // Valores básicos de input
    label?: string;
    value?: string;
    onChangeText?: (text: string) => void;
    onBlur?: () => void;
    placeholder?: string;

    // Configurações de aparência
    leftIcon?: React.ReactNode;
    size?: "xs" | "sm" | "md" | "lg" | "xl";
    variant?: "outline" | "rounded" | "filled" | "underlined";

    // Validação e ajuda
    errorMessage?: string | null;
    helperText?: string;
    isRequired?: boolean;

    // Comportamento
    isPassword?: boolean;
    isDisabled?: boolean;
    isReadOnly?: boolean;
    autoFocus?: boolean;

    // Configurações de teclado
    autoCapitalize?: "none" | "sentences" | "words" | "characters";
    keyboardType?: "default" | "email-address" | "numeric" | "phone-pad" | "number-pad";
    autoCorrect?: boolean;

    // Máscaras (ex: telefone, CPF, etc)
    mask?: {
        type: string;
        options?: object;
    };

    // Estilos
    className?: string;
    inputClassName?: string;
    labelClassName?: string;
    helperClassName?: string;
    errorClassName?: string;
};

export function CustomInput({
                                // Valores básicos
                                label,
                                value,
                                onChangeText,
                                onBlur,
                                placeholder,

                                // Configurações de aparência
                                leftIcon,
                                size = "md",
                                variant = "outline",

                                // Validação e ajuda
                                errorMessage = null,
                                helperText,
                                isRequired = false,

                                // Comportamento
                                isPassword = false,
                                isDisabled = false,
                                isReadOnly = false,
                                autoFocus = false,

                                // Configurações de teclado
                                autoCapitalize = "none",
                                keyboardType = "default",
                                autoCorrect = false,

                                // Máscaras
                                mask,

                                // Estilos
                                className = "",
                                inputClassName = "",
                                labelClassName = "",
                                helperClassName = "",
                                errorClassName = "",

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

        if (onBlur) {
            onBlur();
        }
    };

    // Força o foco no input quando o componente é pressionado
    const forceFocus = () => {
        if (inputRef.current && !isDisabled && !isReadOnly) {
            inputRef.current.focus();
        }
    };

    // Determine a classe baseada no estado do input
    const getInputStateClass = () => {
        if (hasError) return 'border-red-500';
        if (isDisabled) return 'opacity-50 border-blue-700';
        if (isReadOnly) return 'border-blue-700 bg-blue-900';
        if (isFocused) return 'border-blue-500';
        return 'border-blue-800';
    };

    return (
        <FormControl
            isInvalid={hasError}
            isDisabled={isDisabled}
            isReadOnly={isReadOnly}
            isRequired={isRequired}
            className={className}
        >
            {label && (
                <FormControlLabel>
                    <FormControlLabelText className={`text-blue-200 font-medium mb-0 text-lg ${labelClassName}`}>
                        {label}
                    </FormControlLabelText>
                </FormControlLabel>
            )}

            <Pressable onPress={forceFocus} disabled={isDisabled || isReadOnly}>
                <Input
                    isInvalid={hasError}
                    isDisabled={isDisabled}
                    isReadOnly={isReadOnly}
                    variant={variant}
                    size={size}
                    className={`bg-blue-950 ${getInputStateClass()} ${inputClassName} text-white`}
                >
                    {leftIcon && (
                        <InputSlot className={'ml-4'}>
                            {leftIcon}
                        </InputSlot>
                    )}

                    {mask ? (
                        <TextInputMask
                            type={mask.type}
                            options={mask.options}
                            value={value}
                            onChangeText={onChangeText}
                            customTextInput={InputField}
                            onFocus={handleFocus}
                            onBlur={handleBlur}
                            ref={inputRef}
                            editable={!isDisabled && !isReadOnly}
                            autoFocus={autoFocus}
                            customTextInputProps={{
                                placeholder,
                                secureTextEntry: isPassword && !showPassword,
                                style: {
                                    padding: 16,
                                    fontSize: 16,
                                    flex: 1,
                                    color: '#ffffff',
                                    opacity: isDisabled ? 0.5 : 1,
                                },
                                placeholderTextColor: '#94a3b8',
                                keyboardType,
                                autoCapitalize,
                                autoCorrect,
                                editable: !isDisabled && !isReadOnly,
                                showSoftInputOnFocus: !isDisabled && !isReadOnly,
                            }}
                        />
                    ) : (
                        <InputField
                            {...rest}
                            placeholder={placeholder}
                            value={value}
                            onChangeText={onChangeText}
                            secureTextEntry={isPassword && !showPassword}
                            onFocus={handleFocus}
                            onBlur={handleBlur}
                            keyboardType={keyboardType}
                            autoCapitalize={autoCapitalize}
                            autoCorrect={autoCorrect}
                            editable={!isDisabled && !isReadOnly}
                            className="text-white"
                            placeholderTextColor="#94a3b8"
                            ref={inputRef}
                            showSoftInputOnFocus={!isDisabled && !isReadOnly}
                            autoFocus={autoFocus}
                        />
                    )}

                    {isPassword && (
                        <InputSlot pr="3">
                            <Pressable onPress={handleTogglePassword} disabled={isDisabled || isReadOnly}>
                                <InputIcon>
                                    <Icon
                                        as={MaterialIcons}
                                        name={showPassword ? "visibility-off" : "visibility"}
                                        size="sm"
                                        color={isDisabled ? "blue.500" : "blue.300"}
                                    />
                                </InputIcon>
                            </Pressable>
                        </InputSlot>
                    )}
                </Input>
            </Pressable>

            {helperText && !hasError && (
                <FormControlHelper>
                    <FormControlHelperText className={`text-blue-300 text-xs mt-0 ${helperClassName}`}>
                        {helperText}
                    </FormControlHelperText>
                </FormControlHelper>
            )}

            {hasError && (
                <FormControlError>
                    <FormControlErrorIcon as={AlertCircleIcon} className="mr-1"/>
                    <FormControlErrorText className={`text-red-400 text-xs mt-1 ${errorClassName}`}>
                        {errorMessage}
                    </FormControlErrorText>
                </FormControlError>
            )}
        </FormControl>
    );
}
