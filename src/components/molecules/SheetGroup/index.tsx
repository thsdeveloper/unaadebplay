import React, { memo, Children, isValidElement, Fragment } from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import { SHEET } from '@/constants/sheetTokens';

interface SheetGroupProps {
  title?: string;
  children: React.ReactNode;
  style?: ViewStyle;
}

/**
 * Card "vidro escuro" agrupado (estilo iOS inset-grouped): título opcional +
 * card com hairlines injetadas entre as linhas. Cor sempre via SHEET (hex).
 */
export const SheetGroup = memo<SheetGroupProps>(({ title, children, style }) => {
  const items = Children.toArray(children).filter(isValidElement);
  if (items.length === 0) return null;

  return (
    <View style={style}>
      {!!title && <Text style={g.title}>{title}</Text>}
      <View style={g.card}>
        {items.map((child, i) => (
          <Fragment key={i}>
            {i > 0 && <View style={g.hairline} />}
            {child}
          </Fragment>
        ))}
      </View>
    </View>
  );
});

SheetGroup.displayName = 'SheetGroup';

const g = StyleSheet.create({
  title: { color: SHEET.textMuted, fontSize: 13, fontWeight: '600', marginBottom: 8, marginLeft: 4 },
  card: { backgroundColor: SHEET.glass, borderRadius: 16, borderWidth: 1, borderColor: SHEET.border, overflow: 'hidden' },
  // inset 60 = passa o chip de 40 + gap, começando a linha após o ícone.
  hairline: { height: 1, backgroundColor: SHEET.hairline, marginLeft: 60 },
});
