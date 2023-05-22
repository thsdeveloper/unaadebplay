import { Radio, IRadioProps, FormControl, HStack, Text } from 'native-base';

type RadioOption = {
    value: string;
    label: string;
};

type Props = Omit<IRadioProps, 'value'> & {
    message: string;
    value: string;
    errorMessage?: string | null;
    options: RadioOption[];
    onChange: (value: string) => void;
}

export function RadioInput({ errorMessage = null, isInvalid, options, message, value, onChange, ...rest }: Props) {
    const invalid = !!errorMessage || isInvalid;

    return (
        <FormControl isInvalid={invalid}>
            <Text>{message}</Text>
            <Radio.Group value={value} onChange={onChange} name="example">
                <HStack space={5}>
                    {options.map((option, index) => (
                        <Radio key={index} my={1} isInvalid={invalid} value={option.value} {...rest}>
                            {option.label}
                        </Radio>
                    ))}
                </HStack>
            </Radio.Group>
            <FormControl.ErrorMessage>
                {errorMessage}
            </FormControl.ErrorMessage>
        </FormControl>
    );
}
