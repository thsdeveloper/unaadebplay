import React from 'react';
import { Checkbox, HStack, Text, FormControl } from 'native-base';

interface CheckboxCustomProps {
    field: { onChange: (value: boolean) => void; value: string; isChecked: boolean | undefined };
    label: string;
    error?: string | undefined;
    colorScheme?: string;
    fontSize?: string;
}


const CheckboxCustom: React.FC<CheckboxCustomProps> = ({
                                                           field: { onChange, value, isChecked },
                                                           label,
                                                           error,
                                                           colorScheme = 'blue',
                                                           fontSize = 'sm',
                                                       }) => {
    return (
        <FormControl isInvalid={!!error}>
            <HStack alignItems="center">
                <Checkbox
                    value={value}
                    isChecked={isChecked}
                    onChange={(isChecked) => onChange(isChecked)}
                    colorScheme={colorScheme}
                    aria-label={label}
                />
                <Text fontSize={fontSize} ml={2}>{label}</Text>
            </HStack>
            {error && <FormControl.ErrorMessage>{error}</FormControl.ErrorMessage>}
        </FormControl>
    );
};

export default CheckboxCustom;
