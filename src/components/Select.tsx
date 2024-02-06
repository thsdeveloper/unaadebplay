import React from 'react';
import { Select, VStack, FormControl, Box } from 'native-base';

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

    // Função para truncar o texto caso exceda o maxLength
    const truncateLabel = (label: string) => {
        return label.length > maxLength ? `${label.substring(0, maxLength - 3)}...` : label;
    };

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
                            label={truncateLabel(option[labelKey])} // Trunca o label se necessário
                            value={option[valueKey]}
                        />
                    ))}
                </Select>
                <FormControl.ErrorMessage>{errorMessage}</FormControl.ErrorMessage>
            </FormControl>
        </VStack>
    );
};
