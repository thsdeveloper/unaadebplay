import {Select as NativeBaseSelect, ISelectProps, FormControl} from 'native-base'

type SelectProps = ISelectProps & {
    options: string[];
    selectedValue: string;
    onValueChange: (value: string) => void;
    errorMessage?: string | null;
}

export function Select({options = [], selectedValue, onValueChange, errorMessage = null, isInvalid, ...rest}: SelectProps) {
    const invalid = !!errorMessage || isInvalid;
    return (
        <FormControl isInvalid={invalid}>
            <NativeBaseSelect
                placeholder="Select"
                selectedValue={selectedValue}
                onValueChange={onValueChange}
                {...rest}>
                {options.map((option) => (
                    <NativeBaseSelect.Item label={option} value={option} key={option} />
                ))}
            </NativeBaseSelect>
            <FormControl.ErrorMessage>
                {errorMessage}
            </FormControl.ErrorMessage>
        </FormControl>
    )
}

