import React from 'react';
import { Controller, Control, FieldError } from 'react-hook-form';
import { CustomInput } from '@/components/Forms/Input';
import { Box } from '@/components/ui/box';

interface AuthInputProps {
    control: Control<any>;
    name: string;
    label: string;
    placeholder: string;
    error?: FieldError;
    type?: 'text' | 'email' | 'password';
    leftIcon?: string;
    helperText?: string;
    autoCapitalize?: 'none' | 'sentences' | 'words' | 'characters';
    mask?: any;
}

export function AuthInput({
    control,
    name,
    label,
    placeholder,
    error,
    type = 'text',
    leftIcon,
    helperText,
    autoCapitalize = 'none',
    mask
}: AuthInputProps) {
    return (
        <Controller
            control={control}
            name={name}
            render={({ field: { onChange, onBlur, value } }) => (
                <Box>
                    <CustomInput
                        label={label}
                        placeholder={placeholder}
                        value={value}
                        onChangeText={onChange}
                        onBlur={onBlur}
                        errorMessage={error?.message}
                        keyboardType={type === 'email' ? 'email-address' : 'default'}
                        autoCapitalize={autoCapitalize}
                        autoCorrect={false}
                        isPassword={type === 'password'}
                        leftIcon={leftIcon}
                        helperText={helperText}
                        mask={mask}
                        className="bg-white/10 border-white/20"
                    />
                </Box>
            )}
        />
    );
}