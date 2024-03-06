import {ISwitchProps, FormControl, Text, Switch as SwitchNB, VStack, HStack} from 'native-base';

type Props = Omit<ISwitchProps, 'value' | 'onChange'> & {
    textTrue?: string,
    textFalse?: string,
    value: boolean
    message?: string;
    errorMessage?: string | null;
    onChange: (value: boolean) => void; // Tipo do parâmetro alterado para boolean
}

export function Switch({ errorMessage = null, isInvalid, message, onChange, value, textTrue, textFalse, ...rest }: Props) {
    const invalid = !!errorMessage || isInvalid;

    const handleChange = (newValue: boolean) => {
        onChange(newValue);
    };

    return (
        <FormControl isInvalid={invalid}>
            {message && (<Text>{message}</Text>)}
           <HStack alignItems={"center"} space={2}>
               {textFalse && (<Text>{textFalse}</Text>)}
               <SwitchNB isChecked={value} onToggle={handleChange} {...rest} />
               {textTrue && (<Text>{textTrue}</Text>)}
           </HStack>
            {invalid && (
                <FormControl.ErrorMessage>
                    {errorMessage}
                </FormControl.ErrorMessage>
            )}
        </FormControl>
    );
}


