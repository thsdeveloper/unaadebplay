import React, { useState, memo, useMemo } from 'react';
import { View, Platform, Pressable } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Check } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { DatePickerTrigger } from '@/components/atoms/DatePickerTrigger';
import { GradientButton } from '@/components/atoms/GradientButton';
import { Text } from '@/components/atoms/Text';
import {
  Actionsheet,
  ActionsheetBackdrop,
  ActionsheetContent,
  ActionsheetDragIndicatorWrapper,
  ActionsheetDragIndicator,
} from '@/components/ui/actionsheet';
import { DatePickerProps } from './types';

const BRAND = '#E51C44';
const SHEET_BG = '#0E1526';

const yearsAgo = (n: number): Date => {
  const d = new Date();
  d.setFullYear(d.getFullYear() - n);
  return d;
};

const calcAge = (date: Date): number => {
  const today = new Date();
  let age = today.getFullYear() - date.getFullYear();
  const m = today.getMonth() - date.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < date.getDate())) age--;
  return age;
};

/**
 * Seletor de data no padrão de mercado:
 * - iOS: roda (dia/mês/ano em pt-BR) dentro de um bottom sheet escuro, com
 *   prévia ao vivo da data + idade e confirmação explícita.
 * - Android: diálogo nativo do Material aberto direto (com salto rápido de ano).
 * Para data de nascimento, abre já posicionado numa idade plausível (ver `showAge`/`initialPickerDate`).
 */
export const DatePicker = memo<DatePickerProps>(({
  value,
  onChange,
  label,
  error,
  maximumDate = new Date(),
  minimumDate,
  placeholder,
  disabled = false,
  initialPickerDate,
  showAge = false,
}) => {
  const [isOpen, setIsOpen] = useState(false);

  // Onde a roda abre quando ainda não há valor: data informada > explícita > 18 anos atrás (DOB) > hoje.
  const fallback = useMemo(
    () => value || initialPickerDate || (showAge ? yearsAgo(18) : new Date()),
    [value, initialPickerDate, showAge],
  );
  const [tempDate, setTempDate] = useState<Date>(fallback);

  const handleOpen = () => {
    if (disabled) return;
    Haptics.selectionAsync();
    setTempDate(value || fallback);
    setIsOpen(true);
  };

  const onWheelChange = (_event: any, selected?: Date) => {
    if (Platform.OS === 'android') {
      setIsOpen(false);
      if (selected) onChange(selected); // 'set' preenche; 'dismissed' vem indefinido
    } else if (selected) {
      setTempDate(selected); // iOS: atualiza só a prévia até confirmar
    }
  };

  const confirm = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onChange(tempDate);
    setIsOpen(false);
  };

  const cancel = () => {
    setTempDate(value || fallback);
    setIsOpen(false);
  };

  const previewDate = tempDate.toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' });
  const weekday = tempDate.toLocaleDateString('pt-BR', { weekday: 'long' });
  const previewWeekday = weekday.charAt(0).toUpperCase() + weekday.slice(1);
  const age = showAge ? calcAge(tempDate) : null;

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

      {/* Android: diálogo nativo, sem bottom sheet */}
      {Platform.OS === 'android' && isOpen && (
        <DateTimePicker
          value={tempDate}
          mode="date"
          display="spinner"
          onChange={onWheelChange}
          maximumDate={maximumDate}
          minimumDate={minimumDate}
        />
      )}

      {/* iOS: bottom sheet escuro com roda + prévia ao vivo */}
      {Platform.OS === 'ios' && (
        <Actionsheet isOpen={isOpen} onClose={cancel}>
          <ActionsheetBackdrop />
          <ActionsheetContent
            style={{ backgroundColor: SHEET_BG, borderTopLeftRadius: 28, borderTopRightRadius: 28, paddingBottom: 28 }}
          >
            <ActionsheetDragIndicatorWrapper>
              <ActionsheetDragIndicator style={{ backgroundColor: 'rgba(255,255,255,0.18)' }} />
            </ActionsheetDragIndicatorWrapper>

            {/* Prévia */}
            <View className="w-full items-center pt-4 pb-1">
              {label && (
                <Text className="text-typography-400 text-xs" style={{ letterSpacing: 1, fontWeight: '700', textTransform: 'uppercase' }}>
                  {label}
                </Text>
              )}
              <Text className="text-typography-0 mt-2" style={{ fontSize: 24, fontWeight: '800' }}>
                {previewDate}
              </Text>
              <Text className="text-typography-400 mt-1" style={{ fontSize: 14 }}>
                {previewWeekday}{age !== null ? ` · ${age} anos` : ''}
              </Text>
            </View>

            <DateTimePicker
              value={tempDate}
              mode="date"
              display="spinner"
              onChange={onWheelChange}
              maximumDate={maximumDate}
              minimumDate={minimumDate}
              themeVariant="dark"
              textColor="#F8FAFC"
              accentColor={BRAND}
              locale="pt-BR"
              style={{ width: '100%' }}
            />

            <View className="w-full px-4 flex-row" style={{ gap: 12, marginTop: 4 }}>
              <Pressable
                onPress={cancel}
                className="flex-1 items-center justify-center"
                style={{ height: 58, borderRadius: 18, backgroundColor: 'rgba(255,255,255,0.06)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.12)' }}
              >
                <Text className="text-typography-200" style={{ fontSize: 16, fontWeight: '600' }}>Cancelar</Text>
              </Pressable>
              <View className="flex-1">
                <GradientButton label="Confirmar" onPress={confirm} leftIcon={<Check size={18} color="#fff" />} />
              </View>
            </View>
          </ActionsheetContent>
        </Actionsheet>
      )}
    </View>
  );
});

DatePicker.displayName = 'DatePicker';
