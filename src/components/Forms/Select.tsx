import React from 'react';
import {Select} from "@/components/ui/select";
import {FormControl} from "@/components/ui/form-control";
import {VStack} from "@/components/ui/vstack";

interface CustomSelectProps {
    options: any[];
    labelKey: string;
    valueKey: string;
    placeholder: string;
    errorMessage?: string;
    onValueChange: (value: any) => void;
    selectedValue?: any;
    maxLength: number; // Define um valor padrão para maxLength, caso não seja fornecido
}

export const CustomSelect: React.FC<CustomSelectProps> = ({
    options,
    labelKey,
    valueKey,
    placeholder,
    errorMessage,
    onValueChange,
    selectedValue,
    maxLength = 50
}) => {

    const truncateLabel = (label: string) => {
        return label.length > maxLength ? `${label.substring(0, maxLength - 3)}...` : label;
    };

    return (
        <VStack width="100%">
            <FormControl isInvalid={!!errorMessage}>
                <Select
                    borderRadius={'full'}
                    height={12}
                    size={'lg'}
                    placeholder={placeholder}
                    onValueChange={onValueChange}
                    selectedValue={selectedValue}
                >
                    {options.map((option, index) => (
                        <Select.Item
                            key={index}
                            label={truncateLabel(option[labelKey])}
                            value={option[valueKey]}
                        />
                    ))}
                </Select>
                <FormControl.ErrorMessage>{errorMessage}</FormControl.ErrorMessage>
            </FormControl>
        </VStack>
    );
};
