import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Pressable } from 'react-native';
import { Search, X } from 'lucide-react-native';
import { GlassInput } from '@/components/molecules/GlassInput';
import { SHEET } from '@/constants/sheetTokens';

interface SearchProps {
  onSearch: (q: string) => void;
  placeholder?: string;
  debounceMs?: number;
}

/** Busca de eventos — wrapper escuro sobre o GlassInput, com debounce de 250ms. */
export const EventSearchBar = React.memo<SearchProps>(({ onSearch, placeholder = 'Buscar eventos...', debounceMs = 250 }) => {
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
        value ? (
          <Pressable onPress={clear} hitSlop={12} accessibilityRole="button" accessibilityLabel="Limpar busca">
            <X size={18} color={SHEET.textMuted} />
          </Pressable>
        ) : undefined
      }
    />
  );
});

EventSearchBar.displayName = 'EventSearchBar';

export default EventSearchBar;
