import React from 'react';
import {Select, VStack, FormControl, Box} from 'native-base';

interface CustomSelectProps {
    options: any[];
    labelKey: string;
    valueKey: string;
    placeholder: string;
    errorMessage?: string;
    onValueChange: (value: any) => void;
    selectedValue?: any;
}

export const CustomSelect: React.FC<CustomSelectProps> = ({
                                                              options,
                                                              labelKey,
                                                              valueKey,
                                                              placeholder,
                                                              errorMessage,
                                                              onValueChange,
                                                              selectedValue
                                                          }) => {
    return (
        <VStack width="100%">
            <FormControl isInvalid={!!errorMessage}>
                <Select
                    width="100%"
                    size={'xl'}
                    placeholder={placeholder}
                    onValueChange={onValueChange}
                    selectedValue={selectedValue}
                >
                    {options.map((option, index) => (
                        <Select.Item
                            key={index}
                            label={option[labelKey]}
                            value={option[valueKey]}
                        />
                    ))}
                </Select>
                <FormControl.ErrorMessage>{errorMessage}</FormControl.ErrorMessage>
            </FormControl>
        </VStack>
    );
};
