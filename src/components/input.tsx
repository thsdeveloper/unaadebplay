import {Input as NativeBaseInput, IInputProps, FormControl, Icon, IconButton} from 'native-base'
import { MaterialIcons } from '@expo/vector-icons';
import React, {useState} from 'react';

type Props = IInputProps & {
    errorMessage?: string | null;
    isPassword?: boolean; // adicione isso
}

export function Input({errorMessage = null, isInvalid, isPassword, ...rest}: Props) {
    const invalid = !!errorMessage || isInvalid;

    const [showPassword, setShowPassword] = useState(false);

    const handleShowPassword = () => {
        setShowPassword(!showPassword);
    };

    return (
        <FormControl isInvalid={invalid}>
            <NativeBaseInput
                size={'xl'}
                isInvalid={invalid}
                _invalid={{
                    borderWidth: 1
                }}
                secureTextEntry={isPassword && !showPassword} // adicione isso
                InputRightElement={isPassword && ( // adicione isso
                    <IconButton
                        onPress={handleShowPassword}
                        icon={<Icon as={MaterialIcons} name={showPassword ? "visibility-off" : "visibility"} />}
                    />
                )}
                {...rest}/>
            <FormControl.ErrorMessage>
                {errorMessage}
            </FormControl.ErrorMessage>
        </FormControl>
    )
}
