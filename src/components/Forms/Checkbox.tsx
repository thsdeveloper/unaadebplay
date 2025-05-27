import React from 'react';
import {FormControl} from "@/components/ui/form-control";
import {HStack} from "@/components/ui/hstack";
import {Checkbox} from "@/components/ui/checkbox";

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
                <Checkbox.Label>{label}</Checkbox.Label>
            </HStack>
            {error && <FormControl.ErrorMessage>{error}</FormControl.ErrorMessage>}
        </FormControl>
    );
};

export default CheckboxCustom;
