import {Radio, IRadioProps, FormControl, HStack, Text, VStack} from 'native-base';

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
    stackType?: 'horizontal' | 'vertical';
}

export function RadioInput({ errorMessage = null, isInvalid, options, message, value, onChange, stackType = 'horizontal', ...rest }: Props) {
    const invalid = !!errorMessage || isInvalid;
    const StackComponent = stackType === 'horizontal' ? HStack : VStack;

    return (
        <FormControl isInvalid={invalid}>
            <Text>{message}</Text>
            <Radio.Group value={value} onChange={onChange} name="example">
                <StackComponent space={2}>
                    {options.map((option, index) => (
                        <Radio key={index} my={1} isInvalid={invalid} value={option.value} {...rest}>
                            {option.label}
                        </Radio>
                    ))}
                </StackComponent>
            </Radio.Group>
            <FormControl.ErrorMessage>
                {errorMessage}
            </FormControl.ErrorMessage>
        </FormControl>
    );
}
