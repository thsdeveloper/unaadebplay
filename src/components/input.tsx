import React, { useState } from 'react';
import { Input as NativeBaseInput, IInputProps, FormControl, Icon, IconButton } from 'native-base';
import { MaterialIcons } from '@expo/vector-icons';
import { TextInputMask } from 'react-native-masked-text';

type Props = IInputProps & {
    errorMessage?: string | null;
    isPassword?: boolean;
    mask?: {
        type: string;
        options?: object;
    }
}

export function Input({ errorMessage = null, isInvalid, isPassword, mask, ...rest }: Props) {
    const invalid = !!errorMessage || isInvalid;
    const [showPassword, setShowPassword] = useState(false);

    const handleShowPassword = () => {
        setShowPassword(!showPassword);
    };

    const InputComponent = mask ? TextInputMask : NativeBaseInput;

    return (
        <FormControl isInvalid={invalid}>
            <InputComponent
                size={'xl'}
                isInvalid={invalid}
                _invalid={{
                    borderWidth: 1
                }}
                secureTextEntry={isPassword && !showPassword}
                InputRightElement={isPassword && (
                    <IconButton
                        onPress={handleShowPassword}
                        icon={<Icon as={MaterialIcons} name={showPassword ? "visibility-off" : "visibility"} />}
                    />
                )}
                {...(mask ? {
                    type: mask.type,
                    options: mask.options,
                    customTextInput: NativeBaseInput,
                    customTextInputProps: {
                        underlineColorAndroid: 'transparent',
                        style: {
                            flex: 1,
                        },
                    },
                    ...rest
                } : rest)}
            />
            <FormControl.ErrorMessage>
                {errorMessage}
            </FormControl.ErrorMessage>
        </FormControl>
    );
}