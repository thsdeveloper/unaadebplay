import {Input as NativeBaseInput, IInputProps, FormControl} from 'native-base'

type Props = IInputProps & {
    errorMessage?: string | null;
}

export function Input({errorMessage = null, isInvalid, ...rest}: Props) {
    const invalid = !!errorMessage || isInvalid;


    return (
        <FormControl isInvalid={invalid}>
            <NativeBaseInput
                fontSize={'md'}
                isInvalid={invalid}
                _invalid={{
                    borderWidth: 1
                }}
                {...rest}/>
            <FormControl.ErrorMessage>
                {errorMessage}
            </FormControl.ErrorMessage>
        </FormControl>
    )
}

