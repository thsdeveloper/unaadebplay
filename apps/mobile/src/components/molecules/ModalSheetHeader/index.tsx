import React, { memo, useState } from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { X } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { SHEET } from '@/constants/sheetTokens';

interface ModalSheetHeaderProps {
  onClose: () => void;
  eyebrow?: string;
}

/**
 * Header próprio do sheet (substitui a barra de navegação): grabber central +
 * X discreto no canto. No iOS o grabber é cosmético (o card nativo faz o
 * swipe-to-dismiss); no Android o X é o fechamento real.
 */
export const ModalSheetHeader = memo<ModalSheetHeaderProps>(({ onClose, eyebrow }) => {
  const [pressed, setPressed] = useState(false);
  const close = () => {
    Haptics.selectionAsync();
    onClose();
  };

  return (
    <View style={h.wrap}>
      <View style={h.grabber} />
      <View style={h.row}>
        {eyebrow ? <Text style={h.eyebrow}>{eyebrow}</Text> : <View />}
        <Pressable
          onPress={close}
          onPressIn={() => setPressed(true)}
          onPressOut={() => setPressed(false)}
          hitSlop={12}
          accessibilityRole="button"
          accessibilityLabel="Fechar"
          style={[h.close, pressed && { opacity: 0.6 }]}
        >
          <X size={18} color={SHEET.textSecondary} />
        </Pressable>
      </View>
    </View>
  );
});

ModalSheetHeader.displayName = 'ModalSheetHeader';

const h = StyleSheet.create({
  wrap: { paddingTop: 10, paddingHorizontal: 16 },
  grabber: { alignSelf: 'center', width: 36, height: 5, borderRadius: 3, backgroundColor: SHEET.grabber },
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 12 },
  eyebrow: { color: SHEET.textFaint, fontSize: 11, letterSpacing: 1.5, fontWeight: '600' },
  close: { width: 32, height: 32, borderRadius: 16, alignItems: 'center', justifyContent: 'center', backgroundColor: SHEET.glass },
});
