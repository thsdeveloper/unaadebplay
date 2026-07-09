import React, { useCallback, useEffect, useRef, useState } from 'react';
import { View, Text as RNText, Pressable, StyleSheet } from 'react-native';
import { Search, X, SlidersHorizontal } from 'lucide-react-native';
import { GlassInput } from '@/components/molecules/GlassInput';
import { SHEET } from '@/constants/sheetTokens';

interface SearchProps {
  onSearch: (q: string) => void;
  placeholder?: string;
  debounceMs?: number;
  /** Abre os filtros avançados (integrado no canto direito da busca). */
  onOpenFilters?: () => void;
  /** Qtd. de filtros avançados ativos → badge no ícone de filtro. */
  filterCount?: number;
}

/**
 * Busca de eventos — um ÚNICO controle: campo de busca com o gatilho de filtros
 * embutido à direita (separado por um divisor). Substitui o antigo "input + botão
 * quadrado" desconexo, deixando o header mais limpo. Debounce de 250ms.
 */
export const EventSearchBar = React.memo<SearchProps>(({ onSearch, placeholder = 'Buscar eventos...', debounceMs = 250, onOpenFilters, filterCount = 0 }) => {
  const [value, setValue] = useState('');
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const emit = useCallback((q: string) => {
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => onSearch(q), debounceMs);
  }, [onSearch, debounceMs]);

  const onChange = useCallback((t: string) => {
    setValue(t);
    emit(t.trim());
  }, [emit]);

  const clear = useCallback(() => {
    if (timer.current) clearTimeout(timer.current);
    setValue('');
    onSearch('');
  }, [onSearch]);

  useEffect(() => () => { if (timer.current) clearTimeout(timer.current); }, []);

  return (
    <GlassInput
      icon={<Search size={20} color={SHEET.textMuted} />}
      placeholder={placeholder}
      value={value}
      onChangeText={onChange}
      returnKeyType="search"
      autoCapitalize="none"
      accessibilityLabel="Buscar eventos"
      rightSlot={
        <View style={s.right}>
          {!!value && (
            <Pressable onPress={clear} hitSlop={10} accessibilityRole="button" accessibilityLabel="Limpar busca">
              <X size={18} color={SHEET.textMuted} />
            </Pressable>
          )}
          {!!onOpenFilters && (
            <>
              <View style={s.divider} />
              <Pressable onPress={onOpenFilters} hitSlop={10} style={s.filterBtn} accessibilityRole="button" accessibilityLabel={`Filtros avançados${filterCount ? `, ${filterCount} ativos` : ''}`}>
                <SlidersHorizontal size={19} color={filterCount > 0 ? SHEET.brand : SHEET.textMuted} />
                {filterCount > 0 && (
                  <View style={s.badge}><RNText style={s.badgeText}>{filterCount}</RNText></View>
                )}
              </Pressable>
            </>
          )}
        </View>
      }
    />
  );
});

EventSearchBar.displayName = 'EventSearchBar';

export default EventSearchBar;

const s = StyleSheet.create({
  right: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  divider: { width: 1, height: 22, backgroundColor: SHEET.border },
  filterBtn: { padding: 2 },
  badge: { position: 'absolute', top: -7, right: -9, minWidth: 15, height: 15, paddingHorizontal: 3, borderRadius: 8, backgroundColor: SHEET.brand, alignItems: 'center', justifyContent: 'center' },
  badgeText: { color: SHEET.textPrimary, fontSize: 9.5, fontWeight: '800' },
});
