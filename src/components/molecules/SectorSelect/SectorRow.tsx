import React, { memo, useCallback, useState } from 'react';
import { Pressable, Text, StyleSheet } from 'react-native';
import { Check } from 'lucide-react-native';
import type { Sector } from '@/services/sectors';

/** Altura total da linha — usada por getItemLayout (deve casar com o estilo). */
export const ROW_HEIGHT = 56;
const BRAND = '#E51C44';

interface SectorRowProps {
  item: Sector;
  selected: boolean;
  onSelect: (title: string) => void;
}

const SectorRowBase: React.FC<SectorRowProps> = ({ item, selected, onSelect }) => {
  const handlePress = useCallback(() => onSelect(item.title), [item.title, onSelect]);
  const [pressed, setPressed] = useState(false);

  // Estilo ESTÁTICO (array, não função): o cssInterop do NativeWind aplicado ao
  // Pressable ignora a forma de função `style={({pressed}) => ...}` para layout,
  // então o feedback de toque é controlado por estado + array estático.
  const rowStyle = [
    styles.row,
    selected ? styles.rowSelected : pressed ? styles.rowPressed : null,
  ];

  return (
    <Pressable
      onPress={handlePress}
      onPressIn={() => setPressed(true)}
      onPressOut={() => setPressed(false)}
      accessibilityRole="radio"
      // Para papéis "checkáveis" (radio), o estado on/off é `checked` — `selected`
      // sozinho faz o leitor de tela anunciar "não marcado" no item escolhido.
      accessibilityState={{ checked: selected, selected }}
      accessibilityLabel={item.title}
      style={rowStyle}
    >
      <Text
        style={[styles.label, selected && styles.labelSelected]}
        numberOfLines={1}
        maxFontSizeMultiplier={1.3}
      >
        {item.title}
      </Text>
      {selected && (
        <Check
          size={20}
          color={BRAND}
          accessibilityElementsHidden
          importantForAccessibility="no-hide-descendants"
        />
      )}
    </Pressable>
  );
};

/**
 * Linha memoizada: só re-renderiza quando o próprio item, seu estado de seleção
 * ou o handler mudam — assim, ao trocar a seleção, apenas as duas linhas
 * afetadas (a anterior e a nova) re-renderizam.
 */
export const SectorRow = memo(
  SectorRowBase,
  (p, n) => p.item.id === n.item.id && p.selected === n.selected && p.onSelect === n.onSelect,
);

SectorRow.displayName = 'SectorRow';

const styles = StyleSheet.create({
  row: {
    height: ROW_HEIGHT,
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    // hairline DENTRO da altura da linha -> offsets do getItemLayout exatos.
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.04)',
    backgroundColor: 'transparent',
  },
  rowSelected: { backgroundColor: 'rgba(229,28,68,0.12)' },
  rowPressed: { backgroundColor: 'rgba(255,255,255,0.04)' },
  label: { color: '#F8FAFC', fontSize: 16, fontWeight: '500' },
  labelSelected: { fontWeight: '600' },
});
