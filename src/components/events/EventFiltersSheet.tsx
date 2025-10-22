import React, { useState, useCallback, useContext } from 'react';
import { View, ScrollView } from 'react-native';
import { Box } from '@/components/ui/box';
import { VStack } from '@/components/ui/vstack';
import { HStack } from '@/components/ui/hstack';
import { Text } from '@/components/ui/text';
import { Heading } from '@/components/ui/heading';
import { Button } from '@/components/ui/button';
import { Icon } from '@/components/ui/icon';
import { Badge, BadgeText } from '@/components/ui/badge';
import { Pressable } from '@/components/ui/pressable';
import { Select, SelectTrigger, SelectInput, SelectPortal, SelectBackdrop, SelectContent, SelectDragIndicatorWrapper, SelectDragIndicator, SelectItem } from '@/components/ui/select';
import { Actionsheet, ActionsheetBackdrop, ActionsheetContent, ActionsheetDragIndicatorWrapper, ActionsheetDragIndicator } from '@/components/ui/actionsheet';
import { MaterialIcons, MaterialCommunityIcons } from '@expo/vector-icons';
import { DatePicker } from '@/components/molecules/DatePicker';
import { EventFilters } from '@/services/events';
import { useEventFilters } from '@/hooks/useEvents';
import TranslationContext from '@/contexts/TranslationContext';

interface EventFiltersSheetProps {
  isOpen: boolean;
  onClose: () => void;
  onApplyFilters: (filters: EventFilters) => void;
  activeFilters: EventFilters;
  onClearFilters: () => void;
}

const EVENT_TYPE_OPTIONS = [
  { value: 'congresso-geral', label: 'Congresso Geral', icon: 'groups' },
  { value: 'ensaio', label: 'Ensaio', icon: 'music-note' },
  { value: 'palestras', label: 'Palestras', icon: 'school' },
  { value: 'cpre-congresso', label: 'Pré-Congresso', icon: 'event' },
];

const STATUS_OPTIONS = [
  { value: 'active', label: 'Ativo', color: 'bg-green-500' },
  { value: 'pending', label: 'Pendente', color: 'bg-yellow-500' },
  { value: 'cancelled', label: 'Cancelado', color: 'bg-red-500' },
];

export const EventFiltersSheet: React.FC<EventFiltersSheetProps> = ({
  isOpen,
  onClose,
  onApplyFilters,
  activeFilters,
  onClearFilters,
}) => {
  const [tempFilters, setTempFilters] = useState<EventFilters>(activeFilters);
  
  const { eventTypes, locations, organizers, loading } = useEventFilters();
  const { t } = useContext(TranslationContext);

  // Sincroniza filtros temporários quando o sheet abre
  React.useEffect(() => {
    if (isOpen) {
      setTempFilters(activeFilters);
    }
  }, [isOpen, activeFilters]);

  const handleApplyFilters = useCallback(() => {
    onApplyFilters(tempFilters);
    onClose();
  }, [tempFilters, onApplyFilters, onClose]);

  const handleClearFilters = useCallback(() => {
    setTempFilters({});
    onClearFilters();
    onClose();
  }, [onClearFilters, onClose]);

  const handleDateFromChange = useCallback((selectedDate: Date) => {
    setTempFilters(prev => ({
      ...prev,
      dateFrom: selectedDate,
    }));
  }, []);

  const handleDateToChange = useCallback((selectedDate: Date) => {
    setTempFilters(prev => ({
      ...prev,
      dateTo: selectedDate,
    }));
  }, []);

  const activeFiltersCount = Object.keys(tempFilters).filter(key => tempFilters[key as keyof EventFilters]).length;

  return (
    <>
      <Actionsheet isOpen={isOpen} onClose={onClose}>
        <ActionsheetBackdrop />
        <ActionsheetContent maxHeight="90%">
          <ActionsheetDragIndicatorWrapper>
            <ActionsheetDragIndicator />
          </ActionsheetDragIndicatorWrapper>
          
          <VStack className="p-4 pb-8 w-full">
            <HStack className="items-center justify-between mb-6">
              <Heading size="lg">{t('filter_events') || 'Filtrar Eventos'}</Heading>
              {activeFiltersCount > 0 && (
                <Badge className="bg-purple-600">
                  <BadgeText className="text-white text-xs">{activeFiltersCount} ativos</BadgeText>
                </Badge>
              )}
            </HStack>

            <ScrollView showsVerticalScrollIndicator={false}>
              <VStack className="space-y-6 pb-6">
                <VStack className="space-y-2">
                  <Text className="font-semibold text-gray-700">
                    {t('event_type') || 'Tipo de Evento'}
                  </Text>
                  <HStack className="flex-wrap gap-2">
                    {EVENT_TYPE_OPTIONS.map(option => (
                      <Pressable
                        key={option.value}
                        onPress={() => setTempFilters(prev => ({
                          ...prev,
                          eventType: prev.eventType === option.value ? undefined : option.value,
                        }))}
                      >
                        <Badge
                          className={`${
                            tempFilters.eventType === option.value
                              ? 'bg-purple-600'
                              : 'bg-gray-200'
                          }`}
                        >
                          <HStack className="items-center space-x-1">
                            <Icon
                              as={MaterialIcons}
                              name={option.icon as any}
                              size="xs"
                              className={
                                tempFilters.eventType === option.value
                                  ? 'text-white'
                                  : 'text-gray-600'
                              }
                            />
                            <BadgeText
                              className={
                                tempFilters.eventType === option.value
                                  ? 'text-white'
                                  : 'text-gray-600'
                              }
                            >
                              {option.label}
                            </BadgeText>
                          </HStack>
                        </Badge>
                      </Pressable>
                    ))}
                  </HStack>
                </VStack>

                <VStack className="space-y-2">
                  <Text className="font-semibold text-gray-700">
                    {t('status') || 'Status'}
                  </Text>
                  <HStack className="flex-wrap gap-2">
                    {STATUS_OPTIONS.map(option => (
                      <Pressable
                        key={option.value}
                        onPress={() => setTempFilters(prev => ({
                          ...prev,
                          status: prev.status === option.value ? undefined : option.value,
                        }))}
                      >
                        <Badge
                          className={
                            tempFilters.status === option.value
                              ? option.color
                              : 'bg-gray-200'
                          }
                        >
                          <BadgeText
                            className={
                              tempFilters.status === option.value
                                ? 'text-white'
                                : 'text-gray-600'
                            }
                          >
                            {option.label}
                          </BadgeText>
                        </Badge>
                      </Pressable>
                    ))}
                  </HStack>
                </VStack>

                <VStack className="space-y-4">
                  <Text className="font-semibold text-gray-700">
                    {t('date_range') || 'Período'}
                  </Text>
                  <HStack className="space-x-4">
                    <View className="flex-1">
                      <DatePicker
                        value={tempFilters.dateFrom}
                        onChange={handleDateFromChange}
                        placeholder={t('from_date') || 'Data inicial'}
                        maximumDate={tempFilters.dateTo || undefined}
                      />
                    </View>
                    <View className="flex-1">
                      <DatePicker
                        value={tempFilters.dateTo}
                        onChange={handleDateToChange}
                        placeholder={t('to_date') || 'Data final'}
                        minimumDate={tempFilters.dateFrom || undefined}
                      />
                    </View>
                  </HStack>
                </VStack>

                {locations.length > 0 && (
                  <VStack className="space-y-2">
                    <Text className="font-semibold text-gray-700">
                      {t('location') || 'Local'}
                    </Text>
                    <Select
                      selectedValue={tempFilters.location || ''}
                      onValueChange={(value) => setTempFilters(prev => ({ ...prev, location: value }))}
                    >
                      <SelectTrigger variant="outline" size="md">
                        <SelectInput placeholder={t('select_location') || 'Selecione um local'} />
                      </SelectTrigger>
                      <SelectPortal>
                        <SelectBackdrop />
                        <SelectContent>
                          <SelectDragIndicatorWrapper>
                            <SelectDragIndicator />
                          </SelectDragIndicatorWrapper>
                          <SelectItem label={t('all_locations') || 'Todos os locais'} value="" />
                          {locations.map(location => (
                            <SelectItem key={location} label={location} value={location} />
                          ))}
                        </SelectContent>
                      </SelectPortal>
                    </Select>
                  </VStack>
                )}

                {organizers.length > 0 && (
                  <VStack className="space-y-2">
                    <Text className="font-semibold text-gray-700">
                      {t('organizer') || 'Organizador'}
                    </Text>
                    <Select
                      selectedValue={tempFilters.organizer || ''}
                      onValueChange={(value) => setTempFilters(prev => ({ ...prev, organizer: value }))}
                    >
                      <SelectTrigger variant="outline" size="md">
                        <SelectInput placeholder={t('select_organizer') || 'Selecione um organizador'} />
                      </SelectTrigger>
                      <SelectPortal>
                        <SelectBackdrop />
                        <SelectContent>
                          <SelectDragIndicatorWrapper>
                            <SelectDragIndicator />
                          </SelectDragIndicatorWrapper>
                          <SelectItem label={t('all_organizers') || 'Todos os organizadores'} value="" />
                          {organizers.map(organizer => (
                            <SelectItem key={organizer} label={organizer} value={organizer} />
                          ))}
                        </SelectContent>
                      </SelectPortal>
                    </Select>
                  </VStack>
                )}
              </VStack>
            </ScrollView>

            <HStack className="space-x-3 mt-6">
              <Button
                variant="outline"
                onPress={handleClearFilters}
                className="flex-1"
              >
                <Text className="text-gray-700">{t('clear_filters') || 'Limpar'}</Text>
              </Button>
              <Button
                onPress={handleApplyFilters}
                className="flex-1 bg-purple-600"
              >
                <Text className="text-white">{t('apply_filters') || 'Aplicar'}</Text>
              </Button>
            </HStack>
          </VStack>
        </ActionsheetContent>
      </Actionsheet>

    </>
  );
};

export default EventFiltersSheet;