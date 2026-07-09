import React, { memo, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  View,
  FlatList,
  Pressable,
  Text as RNText,
  Platform,
  Keyboard,
  useWindowDimensions,
  AccessibilityInfo,
  StyleSheet,
  Animated,
} from 'react-native';
import { Building2, Search, X, SearchX, RotateCw } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import {
  Actionsheet,
  ActionsheetBackdrop,
  ActionsheetContent,
  ActionsheetDragIndicatorWrapper,
  ActionsheetDragIndicator,
} from '@/components/ui/actionsheet';
import { SelectTrigger } from '@/components/atoms/SelectTrigger';
import { GlassInput } from '@/components/molecules/GlassInput';
import { useSectors } from '@/hooks/useSectors';
import { SectorRow, ROW_HEIGHT } from './SectorRow';
import type { Sector } from '@/services/sectors';

const SHEET_BG = '#0E1526';
const BRAND_LIGHT = '#FF4D6D';

interface SectorSelectProps {
  value?: string;
  onChange: (value: string) => void;
  label?: string;
  error?: string;
  disabled?: boolean;
  className?: string;
}

/**
 * Seletor de setor no padrão de mercado (Uber/iFood): bottom sheet escuro com
 * busca fixa no topo, lista virtualizada de linhas de 56px e seleção imediata
 * (toque seleciona e fecha, com tique háptico). API pública preservada — `value`
 * e `onChange` carregam o TÍTULO do setor.
 */
export const SectorSelect = memo<SectorSelectProps>(({
  value,
  onChange,
  label = 'Setor',
  error,
  disabled = false,
  className,
}) => {
  const { height: SCREEN_H } = useWindowDimensions();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [kb, setKb] = useState(0);
  const listRef = useRef<FlatList<Sector>>(null);

  // Carrega ao abrir (lazy). O cache de módulo evita refetch nas reaberturas; e, se
  // a primeira carga falhar, reabrir o sheet tenta de novo (não fica preso no erro).
  const { sectors, loading, loaded, error: loadError, reload } = useSectors(open);

  // O ActionsheetContent não embute KeyboardAvoidingView; rastreamos o teclado
  // para empurrar as últimas linhas acima dele — só enquanto o sheet está aberto,
  // para não re-renderizar acoplado aos outros campos do formulário.
  useEffect(() => {
    if (!open) {
      setKb(0);
      return;
    }
    const showEvt = Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow';
    const hideEvt = Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide';
    const s = Keyboard.addListener(showEvt, (e) => setKb(e.endCoordinates.height));
    const h = Keyboard.addListener(hideEvt, () => setKb(0));
    return () => {
      s.remove();
      h.remove();
    };
  }, [open]);

  const handleOpen = useCallback(() => {
    if (disabled) return;
    Haptics.selectionAsync();
    setOpen(true);
  }, [disabled]);

  const handleClose = useCallback(() => {
    setOpen(false);
    setQuery('');
    Keyboard.dismiss();
  }, []);

  const handleSelect = useCallback(
    (title: string) => {
      Haptics.selectionAsync();
      onChange(title);
      setOpen(false);
      setQuery('');
      Keyboard.dismiss();
    },
    [onChange],
  );

  const filtered = useMemo<Sector[]>(() => {
    const raw = query.trim().toLowerCase();
    if (!raw) return sectors;
    const digits = raw.replace(/\D/g, '');
    return sectors.filter((s) => {
      const t = s.title.toLowerCase();
      if (t.includes(raw)) return true;
      if (digits) return t.replace(/\D/g, '').includes(digits);
      return false; // guarda: 'abc' não pode casar com tudo
    });
  }, [sectors, query]);

  const showSkeleton = loading || !loaded;
  const showError = loaded && (loadError || sectors.length === 0);

  // iOS não tem accessibilityLiveRegion -> anunciamos a contagem manualmente.
  // Só quando a lista está de fato visível (não durante skeleton/erro), para não
  // anunciar um "0 resultados" enganoso antes de carregar ou na falha.
  useEffect(() => {
    if (!open || showSkeleton || showError) return;
    if (Platform.OS === 'ios') {
      const n = filtered.length;
      AccessibilityInfo.announceForAccessibility(`${n} ${n === 1 ? 'resultado' : 'resultados'}`);
    }
  }, [filtered.length, open, showSkeleton, showError]);

  const keyExtractor = useCallback((item: Sector) => item.id, []);
  const getItemLayout = useCallback(
    (_data: ArrayLike<Sector> | null | undefined, index: number) => ({
      length: ROW_HEIGHT,
      offset: ROW_HEIGHT * index,
      index,
    }),
    [],
  );
  const renderItem = useCallback(
    ({ item }: { item: Sector }) => (
      <SectorRow item={item} selected={item.title === value} onSelect={handleSelect} />
    ),
    [value, handleSelect],
  );

  const initialScrollIndex = useMemo(() => {
    if (query.trim()) return undefined;
    const i = sectors.findIndex((s) => s.title === value);
    return i >= 0 ? i : undefined;
  }, [sectors, value, query]);

  // Altura fixa imposta num wrapper INTERNO (e não no ActionsheetContent): o
  // MotionView do Actionsheet dimensiona-se pelo conteúdo, então é o wrapper de
  // altura definida que dá espaço para a FlatList `flex:1` se expandir.
  const sheetHeight = Math.min(SCREEN_H * 0.8, 640);
  const count = filtered.length;
  const counter = showSkeleton
    ? 'Carregando...'
    : showError
      ? 'Indisponível'
      : query.trim()
        ? `${count} ${count === 1 ? 'resultado' : 'resultados'}`
        : `${sectors.length} setores`;

  return (
    <View className={className}>
      <SelectTrigger
        leftIcon={<Building2 size={20} color="rgba(226,232,240,0.7)" />}
        value={value}
        placeholder="Selecione o setor"
        label={label}
        error={error}
        disabled={disabled}
        onPress={handleOpen}
        accessibilityHint="Abre a lista de setores"
      />

      <Actionsheet isOpen={open} onClose={handleClose}>
        <ActionsheetBackdrop />
        <ActionsheetContent
          style={{
            backgroundColor: SHEET_BG,
            borderTopLeftRadius: 28,
            borderTopRightRadius: 28,
            paddingHorizontal: 0,
            paddingTop: 8,
            paddingBottom: 0,
          }}
        >
          <ActionsheetDragIndicatorWrapper>
            <ActionsheetDragIndicator style={{ backgroundColor: 'rgba(255,255,255,0.18)' }} />
          </ActionsheetDragIndicatorWrapper>

          {/* Wrapper de altura fixa -> dá espaço para a FlatList flex:1 */}
          <View style={{ height: sheetHeight, width: '100%' }}>
            {/* HEADER */}
            <View style={styles.header}>
              <View style={{ flex: 1 }}>
                <RNText style={styles.title}>Selecione o setor</RNText>
                <RNText style={styles.counter} accessibilityLiveRegion="polite">
                  {counter}
                </RNText>
              </View>
              <Pressable onPress={handleClose} hitSlop={12} accessibilityRole="button" accessibilityLabel="Fechar">
                <X size={22} color="rgba(226,232,240,0.7)" />
              </Pressable>
            </View>

            {/* BUSCA (fixa, fora da FlatList) */}
            <View style={styles.searchWrap}>
              <GlassInput
                icon={<Search size={20} color="rgba(226,232,240,0.7)" />}
                placeholder="Buscar setor — ex.: 12"
                value={query}
                onChangeText={setQuery}
                keyboardType="default"
                returnKeyType="search"
                autoCapitalize="none"
                accessibilityLabel="Buscar setor"
                rightSlot={
                  query ? (
                    <Pressable
                      onPress={() => setQuery('')}
                      hitSlop={14}
                      accessibilityRole="button"
                      accessibilityLabel="Limpar busca"
                    >
                      <X size={18} color="rgba(226,232,240,0.6)" />
                    </Pressable>
                  ) : undefined
                }
              />
            </View>

            <View style={styles.divider} />

            {/* ESTADOS */}
            {showSkeleton ? (
              <SkeletonRows />
            ) : showError ? (
              <ErrorState onRetry={reload} />
            ) : (
              <FlatList
                ref={listRef}
                data={filtered}
                style={styles.list}
                keyExtractor={keyExtractor}
                renderItem={renderItem}
                getItemLayout={getItemLayout}
                extraData={value}
                initialScrollIndex={initialScrollIndex}
                initialNumToRender={12}
                maxToRenderPerBatch={10}
                updateCellsBatchingPeriod={50}
                windowSize={7}
                removeClippedSubviews={Platform.OS === 'android'}
                keyboardShouldPersistTaps="handled"
                keyboardDismissMode="on-drag"
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{ paddingBottom: kb > 0 ? kb : 24 }}
                onScrollToIndexFailed={({ index }) => {
                  requestAnimationFrame(() =>
                    listRef.current?.scrollToOffset({ offset: ROW_HEIGHT * index, animated: false }),
                  );
                }}
                ListEmptyComponent={<EmptyState onClear={() => setQuery('')} />}
              />
            )}
          </View>
        </ActionsheetContent>
      </Actionsheet>
    </View>
  );
});

SectorSelect.displayName = 'SectorSelect';

/* ───────────────── estados (apresentacionais, co-locados) ───────────────── */

const EmptyState: React.FC<{ onClear: () => void }> = ({ onClear }) => (
  <View style={styles.centerSlot}>
    <SearchX size={48} color="rgba(226,232,240,0.25)" />
    <RNText style={styles.stateTitle}>Nenhum setor encontrado</RNText>
    <RNText style={styles.stateSub}>Tente outro número ou nome</RNText>
    <Pressable onPress={onClear} hitSlop={14} accessibilityRole="button" accessibilityLabel="Limpar busca">
      <RNText style={styles.ghostAction}>Limpar busca</RNText>
    </Pressable>
  </View>
);

const ErrorState: React.FC<{ onRetry: () => void }> = ({ onRetry }) => (
  <View style={styles.centerSlot}>
    <SearchX size={48} color="rgba(226,232,240,0.25)" />
    <RNText style={styles.stateTitle}>Não foi possível carregar os setores</RNText>
    <RNText style={styles.stateSub}>Verifique sua conexão e tente de novo</RNText>
    <Pressable
      onPress={onRetry}
      hitSlop={14}
      accessibilityRole="button"
      accessibilityLabel="Tentar de novo"
      style={styles.retryRow}
    >
      <RotateCw size={16} color={BRAND_LIGHT} />
      <RNText style={styles.ghostAction}>Tentar de novo</RNText>
    </Pressable>
  </View>
);

const SkeletonRows: React.FC = () => {
  const pulse = useRef(new Animated.Value(0.4)).current;
  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, { toValue: 0.8, duration: 900, useNativeDriver: true }),
        Animated.timing(pulse, { toValue: 0.4, duration: 900, useNativeDriver: true }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [pulse]);

  return (
    <View style={{ flex: 1, width: '100%' }}>
      {Array.from({ length: 9 }).map((_, i) => (
        <View key={i} style={styles.skelRow}>
          <Animated.View style={[styles.skelBar, { opacity: pulse }]} />
        </View>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    width: '100%',
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  title: { color: '#F8FAFC', fontSize: 18, fontWeight: '700' },
  counter: { color: 'rgba(226,232,240,0.6)', fontSize: 13, marginTop: 2 },
  searchWrap: { width: '100%', paddingHorizontal: 20, paddingBottom: 12 },
  divider: { width: '100%', height: 1, backgroundColor: 'rgba(255,255,255,0.06)' },
  list: { flex: 1, width: '100%' },
  centerSlot: {
    flex: 1,
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 48,
    gap: 8,
  },
  stateTitle: { color: '#F8FAFC', fontSize: 16, fontWeight: '600', marginTop: 6, textAlign: 'center', paddingHorizontal: 24 },
  stateSub: { color: 'rgba(226,232,240,0.6)', fontSize: 14, textAlign: 'center', paddingHorizontal: 24 },
  ghostAction: { color: BRAND_LIGHT, fontSize: 14, fontWeight: '600', marginTop: 10 },
  retryRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 6 },
  skelRow: { height: ROW_HEIGHT, paddingHorizontal: 20, justifyContent: 'center' },
  skelBar: { height: 18, width: '45%', borderRadius: 9, backgroundColor: 'rgba(255,255,255,0.06)' },
});
