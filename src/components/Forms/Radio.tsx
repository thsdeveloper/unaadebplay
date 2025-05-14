import { HStack } from "@/components/ui/hstack";
import { VStack } from "@/components/ui/vstack";
import {
    Radio,
    RadioGroup,
    RadioIndicator,
    RadioLabel,
    RadioIcon,
} from "@/components/ui/radio";
import { CircleIcon } from "@/components/ui/icon";
import {
    FormControl,
    FormControlLabel,
    FormControlLabelText,
    FormControlError,
    FormControlErrorText,
} from "@/components/ui/form-control";
import { Text } from "@/components/ui/text";

type RadioOption = {
    value: string | boolean;
    label: string;
};

type Props = {
    message: string;
    value: string;
    errorMessage?: string | null;
    options: RadioOption[];
    onChange: (value: string) => void;
    stackType?: 'horizontal' | 'vertical';
    size?: 'sm' | 'md' | 'lg';
    isDisabled?: boolean;
};

export function RadioInput({
                               errorMessage = null,
                               options,
                               message,
                               value,
                               onChange,
                               stackType = 'horizontal',
                               size = 'md',
                               isDisabled = false,
                               ...rest
                           }: Props) {
    const invalid = !!errorMessage;
    const StackComponent = stackType === 'horizontal' ? HStack : VStack;

    return (
        <FormControl isInvalid={invalid}>
            <FormControlLabel>
                <FormControlLabelText>{message}</FormControlLabelText>
            </FormControlLabel>

            <RadioGroup value={value} onChange={onChange}>
                <StackComponent space={1}>
                    {options.map((option, index) => (
                        <Radio
                            key={index}
                            my={1}
                            isInvalid={invalid}
                            value={String(option.value)}
                            size={size}
                            isDisabled={isDisabled}
                            {...rest}
                        >
                            <RadioIndicator>
                                <RadioIcon as={CircleIcon} />
                            </RadioIndicator>
                            <RadioLabel>{option.label}</RadioLabel>
                        </Radio>
                    ))}
                </StackComponent>
            </RadioGroup>

            {invalid && (
                <FormControlError>
                    <FormControlErrorText>{errorMessage}</FormControlErrorText>
                </FormControlError>
            )}
        </FormControl>
    );
}
