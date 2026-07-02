import React, { useState, useCallback, useEffect } from 'react';
import { View, Text as RNText, ScrollView, Pressable, StyleSheet } from 'react-native';
import {
  Actionsheet,
  ActionsheetBackdrop,
  ActionsheetContent,
  ActionsheetDragIndicatorWrapper,
  ActionsheetDragIndicator,
} from '@/components/ui/actionsheet';
import { Users, Music, GraduationCap, CalendarDays, MapPin } from 'lucide-react-native';
import { DatePicker } from '@/components/molecules/DatePicker';
import { GradientButton } from '@/components/atoms/GradientButton';
import { SHEET } from '@/constants/sheetTokens';
import { GlassSurface } from '@/components/atoms/GlassSurface';
import { EventFilters } from '@/services/events';
import { useEventFilters } from '@/hooks/useEvents';

interface EventFiltersSheetProps {
  isOpen: boolean;
  onClose: () => void;
  onApplyFilters: (filters: EventFilters) => void;
  activeFilters: EventFilters;
  onClearFilters: () => void;
}

const EVENT_TYPES: { value: string; label: string; Icon: any }[] = [
  { value: 'congresso-geral', label: 'Congresso Geral', Icon: Users },
  { value: 'ensaio', label: 'Ensaio', Icon: Music },
  { value: 'palestras', label: 'Palestras', Icon: GraduationCap },
  { value: 'cpre-congresso', label: 'Pré-Congresso', Icon: CalendarDays },
];
const STATUS: { value: string; label: string }[] = [
  { value: 'active', label: 'Ativo' },
  { value: 'pending', label: 'Pendente' },
  { value: 'cancelled', label: 'Cancelado' },
];

const Chip: React.FC<{ label: string; Icon?: any; active: boolean; onPress: () => void }> = ({ label, Icon, active, onPress }) => (
  <Pressable onPress={onPress} style={[ch.chip, active && ch.chipActive]} accessibilityRole="button" accessibilityLabel={label}>
    {Icon && <Icon size={14} color={active ? SHEET.textPrimary : SHEET.textMuted} />}
    <RNText style={[ch.chipText, active && ch.chipTextActive]}>{label}</RNText>
  </Pressable>
);

/** Bottom sheet de filtros — dark, chips (tipo/status/local) + período (DatePicker). */
export const EventFiltersSheet: React.FC<EventFiltersSheetProps> = ({ isOpen, onClose, onApplyFilters, activeFilters, onClearFilters }) => {
  const [temp, setTemp] = useState<EventFilters>(activeFilters);
  const { locations } = useEventFilters();

  useEffect(() => {
    if (isOpen) setTemp(activeFilters);
  }, [isOpen, activeFilters]);

  const toggle = useCallback((key: keyof EventFilters, value: string) => {
    setTemp((prev) => ({ ...prev, [key]: prev[key] === value ? undefined : value }));
  }, []);

  const apply = useCallback(() => { onApplyFilters(temp); onClose(); }, [temp, onApplyFilters, onClose]);
  const clear = useCallback(() => { setTemp({}); onClearFilters(); onClose(); }, [onClearFilters, onClose]);

  const count = Object.entries(temp).filter(([k, v]) => k !== 'search' && v).length;

  return (
    <Actionsheet isOpen={isOpen} onClose={onClose}>
      <ActionsheetBackdrop />
      <ActionsheetContent
        style={{ backgroundColor: 'transparent', borderTopLeftRadius: 28, borderTopRightRadius: 28, paddingHorizontal: 0, paddingBottom: 0, overflow: 'hidden' }}
      >
        <GlassSurface style={StyleSheet.absoluteFill} glassEffectStyle="regular" blurIntensity={40} fallbackColor={SHEET.bg} pointerEvents="none" />
        <ActionsheetDragIndicatorWrapper>
          <ActionsheetDragIndicator style={{ backgroundColor: SHEET.grabber }} />
        </ActionsheetDragIndicatorWrapper>

        <View style={f.body}>
          <View style={f.header}>
            <RNText style={f.heading}>Filtrar eventos</RNText>
            {count > 0 && (
              <View style={f.countBadge}>
                <RNText style={f.countText}>{count} {count === 1 ? 'ativo' : 'ativos'}</RNText>
              </View>
            )}
          </View>

          <ScrollView showsVerticalScrollIndicator={false} style={{ maxHeight: 430 }} keyboardShouldPersistTaps="handled">
            <RNText style={f.label}>Tipo de evento</RNText>
            <View style={f.chips}>
              {EVENT_TYPES.map((o) => (
                <Chip key={o.value} label={o.label} Icon={o.Icon} active={temp.eventType === o.value} onPress={() => toggle('eventType', o.value)} />
              ))}
            </View>

            <RNText style={f.label}>Status</RNText>
            <View style={f.chips}>
              {STATUS.map((o) => (
                <Chip key={o.value} label={o.label} active={temp.status === o.value} onPress={() => toggle('status', o.value)} />
              ))}
            </View>

            <RNText style={f.label}>Período</RNText>
            <View style={{ flexDirection: 'row', gap: 12 }}>
              <View style={{ flex: 1 }}>
                <DatePicker value={temp.dateFrom} onChange={(d) => setTemp((p) => ({ ...p, dateFrom: d }))} placeholder="Data inicial" maximumDate={temp.dateTo || undefined} />
              </View>
              <View style={{ flex: 1 }}>
                <DatePicker value={temp.dateTo} onChange={(d) => setTemp((p) => ({ ...p, dateTo: d }))} placeholder="Data final" minimumDate={temp.dateFrom || undefined} />
              </View>
            </View>

            {locations.length > 0 && (
              <>
                <RNText style={f.label}>Local</RNText>
                <View style={f.chips}>
                  {locations.map((loc) => (
                    <Chip key={loc} label={loc} Icon={MapPin} active={temp.location === loc} onPress={() => toggle('location', loc)} />
                  ))}
                </View>
              </>
            )}
            <View style={{ height: 8 }} />
          </ScrollView>

          <View style={f.footer}>
            <Pressable onPress={clear} style={f.clearBtn} accessibilityRole="button" accessibilityLabel="Limpar filtros">
              <RNText style={f.clearText}>Limpar</RNText>
            </Pressable>
            <View style={{ flex: 1 }}>
              <GradientButton label="Aplicar" onPress={apply} />
            </View>
          </View>
        </View>
      </ActionsheetContent>
    </Actionsheet>
  );
};

export default EventFiltersSheet;

const ch = StyleSheet.create({
  chip: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 14, paddingVertical: 9, borderRadius: 999, backgroundColor: SHEET.glass, borderWidth: 1, borderColor: SHEET.border },
  chipActive: { backgroundColor: SHEET.brand, borderColor: SHEET.brand },
  chipText: { color: SHEET.textMuted, fontSize: 13.5, fontWeight: '600' },
  chipTextActive: { color: SHEET.textPrimary },
});

const f = StyleSheet.create({
  body: { width: '100%', paddingHorizontal: 16, paddingBottom: 16 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingTop: 4, paddingBottom: 16 },
  heading: { color: SHEET.textPrimary, fontSize: 20, fontWeight: '800' },
  countBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 999, backgroundColor: SHEET.brandTint },
  countText: { color: SHEET.brand, fontSize: 12, fontWeight: '700' },
  label: { color: SHEET.textSecondary, fontSize: 14, fontWeight: '700', marginTop: 18, marginBottom: 10 },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  footer: { flexDirection: 'row', alignItems: 'center', gap: 12, marginTop: 16 },
  clearBtn: { height: 58, paddingHorizontal: 24, borderRadius: 18, alignItems: 'center', justifyContent: 'center', backgroundColor: SHEET.glass, borderWidth: 1, borderColor: SHEET.border },
  clearText: { color: SHEET.textSecondary, fontSize: 15, fontWeight: '700' },
});
