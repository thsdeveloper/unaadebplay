import React, { useState, memo } from 'react';
import { View, Platform } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { DatePickerTrigger } from '@/components/atoms/DatePickerTrigger';
import { Button } from '@/components/atoms/Button';
import { Text } from '@/components/atoms/Text';
import { 
  Actionsheet,
  ActionsheetBackdrop,
  ActionsheetContent,
  ActionsheetDragIndicatorWrapper,
  ActionsheetDragIndicator,
} from '@/components/ui/actionsheet';
import { DatePickerProps } from './types';

export const DatePicker = memo<DatePickerProps>(({
  value,
  onChange,
  label,
  error,
  maximumDate = new Date(),
  minimumDate,
  placeholder,
  disabled = false,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [tempDate, setTempDate] = useState<Date>(value || new Date());

  const handleDateChange = (event: any, selectedDate?: Date) => {
    if (Platform.OS === 'android') {
      setIsOpen(false);
      if (selectedDate) {
        onChange(selectedDate);
      }
    } else {
      // iOS - apenas atualiza temporariamente
      if (selectedDate) {
        setTempDate(selectedDate);
      }
    }
  };

  const handleOpen = () => {
    if (!disabled) {
      setTempDate(value || new Date());
      setIsOpen(true);
    }
  };

  const handleConfirm = () => {
    onChange(tempDate);
    setIsOpen(false);
  };

  const handleCancel = () => {
    setTempDate(value || new Date());
    setIsOpen(false);
  };

  return (
    <View>
      <DatePickerTrigger
        value={value}
        label={label}
        error={error}
        placeholder={placeholder}
        disabled={disabled}
        onPress={handleOpen}
      />

      <Actionsheet isOpen={isOpen} onClose={handleCancel}>
        <ActionsheetBackdrop />
        <ActionsheetContent className="bg-background-0">
          <ActionsheetDragIndicatorWrapper>
            <ActionsheetDragIndicator />
          </ActionsheetDragIndicatorWrapper>
          
          {/* Header com título */}
          <View className="w-full px-4 py-2 border-b border-gray-200">
            <Text variant="h4" className="text-center text-gray-800">
              Selecionar Data
            </Text>
          </View>
          
          {/* DatePicker */}
          <View className="w-full py-6 px-4">
            <DateTimePicker
              value={tempDate}
              mode="date"
              display={Platform.OS === 'ios' ? 'spinner' : 'default'}
              onChange={handleDateChange}
              maximumDate={maximumDate}
              minimumDate={minimumDate}
              style={{ width: '100%' }}
            />
          </View>
          
          {/* Botões de ação - apenas para iOS */}
          {Platform.OS === 'ios' && (
            <View className="w-full px-4 pb-6 flex-row" style={{ gap: 12 }}>
              <Button
                variant="outline"
                size="large"
                onPress={handleCancel}
                className="flex-1"
              >
                Cancelar
              </Button>
              
              <Button
                variant="primary"
                size="large"
                onPress={handleConfirm}
                className="flex-1"
              >
                OK
              </Button>
            </View>
          )}
        </ActionsheetContent>
      </Actionsheet>
    </View>
  );
});

DatePicker.displayName = 'DatePicker';