import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { View, Text as RNText, FlatList, RefreshControl, Pressable, TextInput, StyleSheet, ActivityIndicator } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { useAnimatedStyle, useSharedValue, withRepeat, withTiming, Easing, FadeIn } from 'react-native-reanimated';
import { ChevronLeft, Search, X, UserSearch } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { UserItem, USER_ITEM_HEIGHT } from '@/components/users';
import { useUserList } from '@/hooks/useUserList';
import { useSectorMap } from '@/hooks/useSectorMap';
import { SHEET } from '@/constants/sheetTokens';
import type { User } from '@/types/UserTypes';

/* ---------------------------- Skeleton --------------------------- */
const SkeletonRow = () => {
  const p = useSharedValue(0);
  React.useEffect(() => {
    p.value = withRepeat(withTiming(1, { duration: 900, easing: Easing.inOut(Easing.ease) }), -1, true);
  }, [p]);
  const shimmer = useAnimatedStyle(() => ({ opacity: 0.4 + p.value * 0.35 }));

  return (
    <Animated.View style={[s.skRow, shimmer]}>
      <View style={s.skAvatar} />
      <View style={{ flex: 1, gap: 8 }}>
        <View style={[s.skBar, { width: '45%' }]} />
        <View style={[s.skBar, { width: '30%', height: 9 }]} />
      </View>
    </Animated.View>
  );
};

/* --------------------------- Empty state ------------------------- */
const EmptyState = ({ hasSearch }: { hasSearch: boolean }) => (
  <Animated.View entering={FadeIn.duration(300)} style={s.empty}>
    <View style={s.emptyIcon}>
      <UserSearch size={30} color={SHEET.textMuted} />
    </View>
    <RNText style={s.emptyTitle}>
      {hasSearch ? 'Nenhum membro encontrado' : 'Nenhum membro ainda'}
    </RNText>
    <RNText style={s.emptyText}>
      {hasSearch ? 'Tente buscar por outro nome.' : 'Os membros da comunidade aparecerão aqui.'}
    </RNText>
  </Animated.View>
);

export default function UsersScreen() {
  const router = useRouter();
  const { users, isLoading, isRefreshing, isLoadingMore, searchQuery, search, loadMore, refresh } = useUserList();

  /* --------- Busca embutida no header (estilo Instagram) --------- */
  const [searching, setSearching] = useState(false);
  const inputRef = useRef<TextInput>(null);
  const t = useSharedValue(0); // 0 = título · 1 = campo de busca (cross-fade)

  useEffect(() => {
    t.value = withTiming(searching ? 1 : 0, { duration: 220, easing: Easing.out(Easing.cubic) });
  }, [searching, t]);

  const openSearch = useCallback(() => {
    Haptics.selectionAsync();
    setSearching(true);
    // Foca após o próximo frame (deixa a camada de busca virar interativa antes).
    setTimeout(() => inputRef.current?.focus(), 50);
  }, []);

  // O chevron do header SEMPRE volta para a página anterior — mesmo com a busca aberta.
  const onLeftPress = useCallback(() => {
    router.back();
  }, [router]);

  const titleLayer = useAnimatedStyle(() => ({ opacity: 1 - t.value, transform: [{ translateY: t.value * -8 }] }));
  const searchLayer = useAnimatedStyle(() => ({ opacity: t.value, transform: [{ translateY: (1 - t.value) * 8 }] }));

  /* -------------------------- Lista ------------------------------ */
  const sectorMap = useSectorMap(); // id → nome (resolve o UUID `user.sector`)

  const handleUserPress = useCallback((user: User) => {
    router.push(`/(tabs)/(home)/(profile)/${user.id}`);
  }, [router]);

  const renderItem = useCallback(
    ({ item }: { item: User }) => (
      <UserItem user={item} onPress={handleUserPress} sectorName={item.sector ? sectorMap[item.sector] : undefined} />
    ),
    [handleUserPress, sectorMap],
  );

  const keyExtractor = useCallback((item: User) => String(item.id), []);

  // Altura fixa por linha → a FlatList pula a medição e escala para milhares de contas.
  const getItemLayout = useCallback(
    (_data: ArrayLike<User> | null | undefined, index: number) => ({
      length: USER_ITEM_HEIGHT,
      offset: USER_ITEM_HEIGHT * index,
      index,
    }),
    [],
  );

  const hasSearch = searchQuery.trim().length > 0;
  const countLabel = useMemo(() => {
    const n = users.length;
    if (hasSearch) return `${n} ${n === 1 ? 'resultado' : 'resultados'}`;
    return `${n} ${n === 1 ? 'membro' : 'membros'}`;
  }, [users.length, hasSearch]);

  const initialLoading = isLoading && users.length === 0;

  const ListFooter = isLoadingMore ? (
    <View style={s.footer}><ActivityIndicator color={SHEET.brand} /></View>
  ) : null;

  return (
    <View style={s.screen}>
      <StatusBar style="light" />
      {/* Brilho ambiente no topo (cobre a tela toda e resolve p/ SHEET.bg → sem "risco"). */}
      <LinearGradient
        colors={['#1E2A47', '#172136', SHEET.bg]}
        locations={[0, 0.14, 0.32]}
        start={{ x: 1, y: 0 }}
        end={{ x: 0.2, y: 0.4 }}
        style={s.glow}
        pointerEvents="none"
      />

      <SafeAreaView edges={['top']} style={s.flex}>
        {/* Header: chevron + (título ↔ busca) em cross-fade */}
        <View style={s.header}>
          <Pressable
            onPress={onLeftPress}
            hitSlop={8}
            style={s.iconBtn}
            accessibilityRole="button"
            accessibilityLabel="Voltar"
          >
            <ChevronLeft size={24} color={SHEET.textPrimary} />
          </Pressable>

          <View style={s.headerCenter}>
            {/* Camada TÍTULO */}
            <Animated.View style={[s.layer, titleLayer]} pointerEvents={searching ? 'none' : 'auto'}>
              <View style={s.titles}>
                <RNText style={s.eyebrow}>COMUNIDADE</RNText>
                <RNText style={s.title}>Membros</RNText>
              </View>
              <Pressable onPress={openSearch} hitSlop={8} style={s.iconBtn} accessibilityRole="button" accessibilityLabel="Buscar membros">
                <Search size={21} color={SHEET.textPrimary} />
              </Pressable>
            </Animated.View>

            {/* Camada BUSCA */}
            <Animated.View style={[s.layer, searchLayer]} pointerEvents={searching ? 'auto' : 'none'}>
              <View style={s.searchField}>
                <Search size={18} color={SHEET.textMuted} />
                <TextInput
                  ref={inputRef}
                  value={searchQuery}
                  onChangeText={search}
                  placeholder="Buscar membros..."
                  placeholderTextColor={SHEET.textFaint}
                  style={s.searchInput}
                  autoCapitalize="words"
                  autoCorrect={false}
                  returnKeyType="search"
                />
                {searchQuery.length > 0 && (
                  <Pressable onPress={() => search('')} hitSlop={10} style={s.clearBtn}>
                    <X size={13} color={SHEET.textSecondary} />
                  </Pressable>
                )}
              </View>
            </Animated.View>
          </View>
        </View>

        {/* Caption de contagem (contexto discreto, no lugar do antigo "pill") */}
        {!initialLoading && <RNText style={s.caption}>{countLabel}</RNText>}

        {initialLoading ? (
          <View style={s.listPad}>
            {Array.from({ length: 8 }).map((_, i) => <SkeletonRow key={i} />)}
          </View>
        ) : (
          <FlatList
            data={users}
            renderItem={renderItem}
            keyExtractor={keyExtractor}
            getItemLayout={getItemLayout}
            contentContainerStyle={users.length === 0 ? s.emptyContainer : s.listPad}
            showsVerticalScrollIndicator={false}
            ListEmptyComponent={<EmptyState hasSearch={hasSearch} />}
            ListFooterComponent={ListFooter}
            onEndReached={loadMore}
            onEndReachedThreshold={0.4}
            keyboardShouldPersistTaps="handled"
            keyboardDismissMode="on-drag"
            refreshControl={
              <RefreshControl
                refreshing={isRefreshing}
                onRefresh={refresh}
                tintColor={SHEET.brand}
                colors={[SHEET.brand]}
                progressBackgroundColor={SHEET.surface}
              />
            }
            removeClippedSubviews
            initialNumToRender={12}
            maxToRenderPerBatch={12}
            windowSize={10}
          />
        )}
      </SafeAreaView>
    </View>
  );
}

const s = StyleSheet.create({
  screen: { flex: 1, backgroundColor: SHEET.bg },
  flex: { flex: 1 },
  glow: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 },

  header: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 10, paddingTop: 4, paddingBottom: 6 },
  iconBtn: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  headerCenter: { flex: 1, height: 52, justifyContent: 'center' },
  // As duas camadas ocupam o MESMO espaço e fazem cross-fade (opacity + translateY).
  layer: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },

  titles: { flex: 1 },
  eyebrow: { color: SHEET.textFaint, fontSize: 11, fontWeight: '700', letterSpacing: 1.4 },
  title: { color: SHEET.textPrimary, fontSize: 24, fontWeight: '800', marginTop: 2 },

  searchField: {
    flex: 1, flexDirection: 'row', alignItems: 'center', gap: 10,
    height: 44, paddingHorizontal: 14, borderRadius: 14,
    backgroundColor: SHEET.glass, borderWidth: 1, borderColor: SHEET.border,
  },
  searchInput: { flex: 1, color: SHEET.textPrimary, fontSize: 15.5, padding: 0 },
  clearBtn: {
    width: 22, height: 22, borderRadius: 11, alignItems: 'center', justifyContent: 'center',
    backgroundColor: SHEET.glass, borderWidth: 1, borderColor: SHEET.border,
  },

  caption: { color: SHEET.textFaint, fontSize: 12.5, fontWeight: '600', paddingHorizontal: 16, paddingTop: 4, paddingBottom: 8, letterSpacing: 0.2 },

  listPad: { paddingBottom: 32 },
  footer: { paddingVertical: 20, alignItems: 'center' },

  emptyContainer: { flexGrow: 1 },
  empty: { flex: 1, alignItems: 'center', justifyContent: 'flex-start', paddingHorizontal: 40, paddingTop: 32, gap: 12 },
  emptyIcon: {
    width: 72, height: 72, borderRadius: 36, alignItems: 'center', justifyContent: 'center',
    backgroundColor: SHEET.glass, borderWidth: 1, borderColor: SHEET.border, marginBottom: 4,
  },
  emptyTitle: { color: SHEET.textPrimary, fontSize: 17, fontWeight: '700', textAlign: 'center' },
  emptyText: { color: SHEET.textMuted, fontSize: 14, textAlign: 'center', lineHeight: 20 },

  skRow: { flexDirection: 'row', alignItems: 'center', gap: 12, height: USER_ITEM_HEIGHT, paddingHorizontal: 16 },
  skAvatar: { width: 52, height: 52, borderRadius: 26, backgroundColor: SHEET.border },
  skBar: { height: 12, borderRadius: 6, backgroundColor: SHEET.border },
});
