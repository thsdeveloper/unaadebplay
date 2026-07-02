import React, { memo, useState } from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { ChevronRight } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { SHEET } from '@/constants/sheetTokens';

// GUARDRAIL: sheet hardcoded escuro -> cor sempre via SHEET + hex inline (nunca
// o Text atom com color="primary" nem classes `dark:`). E estilo do Pressable é
// array ESTÁTICO (o cssInterop do NativeWind descarta a forma de função); o
// feedback de toque vem de onPressIn/onPressOut. Ver [[nativewind-pressable-function-style]].

type Tone = 'default' | 'primary' | 'danger';

interface SheetRowProps {
  icon: React.ReactNode;
  label: string;
  description?: string;
  value?: string;
  tone?: Tone;
  onPress?: () => void;
  trailing?: React.ReactNode;
  /** Renderiza o próprio card recuado (usado na ação destrutiva isolada). */
  standalone?: boolean;
}

/** Linha genérica do sheet: chip de ícone + label + descrição + valor/trailing. */
export const SheetRow = memo<SheetRowProps>(({
  icon,
  label,
  description,
  value,
  tone = 'default',
  onPress,
  trailing,
  standalone,
}) => {
  const [pressed, setPressed] = useState(false);
  const danger = tone === 'danger';
  const chipStyle = tone === 'primary' ? r.chipPrimary : danger ? r.chipDanger : null;

  const handlePress = () => {
    if (!onPress) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onPress();
  };

  return (
    <Pressable
      disabled={!onPress}
      onPress={handlePress}
      onPressIn={() => onPress && setPressed(true)}
      onPressOut={() => setPressed(false)}
      accessibilityRole={onPress ? 'button' : undefined}
      // Compõe todo o texto visível para o leitor de tela (label sozinho perderia value/descrição).
      accessibilityLabel={[label, description, value].filter(Boolean).join(', ')}
      style={[r.row, standalone && r.standalone, pressed && r.pressed]}
    >
      <View style={[r.chip, chipStyle]}>{icon}</View>
      <View style={r.body}>
        <Text style={[r.label, danger && r.labelDanger]} numberOfLines={1}>{label}</Text>
        {!!description && <Text style={r.desc} numberOfLines={1}>{description}</Text>}
      </View>
      {!!value && <Text style={r.value} numberOfLines={1}>{value}</Text>}
      {trailing ?? (onPress ? <ChevronRight size={18} color={SHEET.textFaint} /> : null)}
    </Pressable>
  );
});

SheetRow.displayName = 'SheetRow';

const r = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: 12, minHeight: 56, paddingHorizontal: 16, paddingVertical: 12 },
  standalone: { backgroundColor: SHEET.glass, borderRadius: 16, borderWidth: 1, borderColor: SHEET.border },
  pressed: { backgroundColor: SHEET.pressed },
  chip: { width: 40, height: 40, borderRadius: 12, alignItems: 'center', justifyContent: 'center', backgroundColor: SHEET.glass },
  chipPrimary: { backgroundColor: SHEET.brandTint },
  chipDanger: { backgroundColor: SHEET.dangerTint },
  body: { flex: 1 },
  label: { color: SHEET.textPrimary, fontSize: 16, fontWeight: '600' },
  labelDanger: { color: SHEET.danger },
  desc: { color: SHEET.textMuted, fontSize: 13, marginTop: 2 },
  value: { color: SHEET.textMuted, fontSize: 15, marginRight: 4, maxWidth: 140 },
});
