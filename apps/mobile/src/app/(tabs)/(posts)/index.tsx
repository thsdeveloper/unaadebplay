import React, { memo, useCallback, useMemo, useState } from 'react';
import { View, Text as RNText, Pressable, FlatList, ScrollView, RefreshControl, ActivityIndicator, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { Newspaper, SearchX, RotateCw, Megaphone, CalendarDays, Tag, LayoutGrid } from 'lucide-react-native';
import { SHEET } from '@/constants/sheetTokens';
import { EventSearchBar } from '@/components/events/EventSearchBar';
import { NewsListCard } from '@/components/news/NewsListCard';
import NewsFiltersSheet from '@/components/news/NewsFiltersSheet';
import EventListSkeletons from '@/components/Skeletons/EventListSkeletons';
import { useNews } from '@/hooks/useNews';
import type { NewsTypes, NewsCategory } from '@/types/NewsTypes';

/** Ícone por categoria (mantém o padrão dos chips de eventos): mapeia por slug/nome. */
function categoryIcon(cat?: { slug?: string; name?: string }): any {
  const k = `${cat?.slug ?? ''} ${cat?.name ?? ''}`.toLowerCase();
  if (k.includes('aviso')) return Megaphone;
  if (k.includes('evento')) return CalendarDays;
  if (k.includes('not')) return Newspaper; // notícia / nota
  return Tag;
}

/** Chip de categoria (horizontal) — dark, com ícone; ativo em brand. */
const CategoryChip: React.FC<{ label: string; Icon: any; active: boolean; onPress: () => void }> = ({ label, Icon, active, onPress }) => (
  <Pressable onPress={onPress} style={[s.chip, active && s.chipActive]} accessibilityRole="button" accessibilityLabel={label}>
    <Icon size={14} color={active ? SHEET.textPrimary : SHEET.textMuted} />
    <RNText style={[s.chipText, active && s.chipTextActive]} numberOfLines={1}>{label}</RNText>
  </Pressable>
);

interface ListHeaderProps {
  categories: NewsCategory[];
  activeCategory: string | null;
  filterCount: number;
  onSearch: (q: string) => void;
  onSelectCategory: (id: string | null) => void;
  onOpenFilters: () => void;
}

/**
 * Header da lista em nível de módulo (tipo ESTÁVEL), passado como ELEMENTO à FlatList —
 * trocar categoria/buscar apenas re-renderiza (o GlassView do FAB e a busca não remontam).
 */
const NewsListHeader = memo(function NewsListHeader({ categories, activeCategory, filterCount, onSearch, onSelectCategory, onOpenFilters }: ListHeaderProps) {
  return (
    <View style={s.listHeader}>
      <View style={s.searchRow}>
        <EventSearchBar onSearch={onSearch} placeholder="Buscar notícias..." onOpenFilters={onOpenFilters} filterCount={filterCount} />
      </View>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={s.chipsRow} keyboardShouldPersistTaps="handled">
        <CategoryChip label="Todas" Icon={LayoutGrid} active={!activeCategory} onPress={() => onSelectCategory(null)} />
        {categories.map((cat) => (
          <CategoryChip key={cat.id} label={cat.name} Icon={categoryIcon(cat)} active={activeCategory === cat.id} onPress={() => onSelectCategory(cat.id)} />
        ))}
      </ScrollView>
    </View>
  );
});

export default function PostsScreen() {
  const { news, categories, tags, isLoading, isRefreshing, error, hasMore, filters, loadMore, refresh, setFilters } = useNews(10);
  const [showFilters, setShowFilters] = useState(false);

  const activeCategory = filters.category ?? null;
  const filterCount = (filters.tags?.length ?? 0) + (filters.featured ? 1 : 0);
  const hasQuery = !!filters.search;
  const isDefaultFeed = !filters.category && !filters.search && !(filters.tags?.length) && !filters.featured;
  const featuredId = isDefaultFeed && news.length > 2 ? news[0]?.id : null;

  // setFilters do useNews é o setter do useState → dá pra usar update funcional (handlers estáveis).
  const onSearch = useCallback((q: string) => setFilters((prev) => ({ ...prev, search: q || undefined })), [setFilters]);
  const onSelectCategory = useCallback((id: string | null) => setFilters((prev) => ({ ...prev, category: id ?? undefined })), [setFilters]);
  const onApplyFilters = useCallback((next: typeof filters) => setFilters(next), [setFilters]);
  const openFilters = useCallback(() => setShowFilters(true), []);

  const renderItem = useCallback(({ item }: { item: NewsTypes }) => (
    <NewsListCard news={item} featured={item.id === featuredId} />
  ), [featuredId]);

  const keyExtractor = useCallback((it: NewsTypes) => it.id, []);

  const ListHeader = useMemo(() => (
    <NewsListHeader
      categories={categories}
      activeCategory={activeCategory}
      filterCount={filterCount}
      onSearch={onSearch}
      onSelectCategory={onSelectCategory}
      onOpenFilters={openFilters}
    />
  ), [categories, activeCategory, filterCount, onSearch, onSelectCategory, openFilters]);

  const renderFooter = useCallback(() => {
    if (!hasMore || news.length === 0) return null;
    return <View style={s.footer}><ActivityIndicator size="small" color={SHEET.brand} /></View>;
  }, [hasMore, news.length]);

  const renderEmpty = useCallback(() => {
    const Icon = hasQuery ? SearchX : Newspaper;
    const title = hasQuery ? 'Nada encontrado' : 'Nenhuma notícia ainda';
    const desc = hasQuery
      ? `Nenhuma notícia corresponde a "${filters.search}".`
      : 'Assim que novas notícias forem publicadas, elas aparecem aqui.';
    return (
      <View style={s.empty}>
        <View style={s.emptyIcon}><Icon size={30} color={SHEET.textMuted} /></View>
        <RNText style={s.emptyTitle}>{title}</RNText>
        <RNText style={s.emptyDesc}>{desc}</RNText>
        {hasQuery ? (
          <Pressable onPress={() => onSearch('')} style={s.emptyBtn}>
            <RNText style={s.emptyBtnText}>Limpar busca</RNText>
          </Pressable>
        ) : (
          <Pressable onPress={refresh} style={s.emptyBtn}>
            <RotateCw size={16} color={SHEET.textPrimary} />
            <RNText style={s.emptyBtnText}>Atualizar</RNText>
          </Pressable>
        )}
      </View>
    );
  }, [hasQuery, filters.search, onSearch, refresh]);

  return (
    <SafeAreaView style={s.safe} edges={['top']}>
      <StatusBar style="light" />
      <View style={s.header}>
        <RNText style={s.eyebrow}>FIQUE POR DENTRO</RNText>
        <RNText style={s.title}>Notícias</RNText>
      </View>

      {isLoading && news.length === 0 ? (
        <EventListSkeletons count={4} />
      ) : error && news.length === 0 ? (
        <View style={s.empty}>
          <View style={s.emptyIcon}><Newspaper size={30} color={SHEET.danger} /></View>
          <RNText style={s.emptyTitle}>Erro ao carregar</RNText>
          <RNText style={s.emptyDesc}>{error}</RNText>
          <Pressable onPress={refresh} style={s.emptyBtn}>
            <RotateCw size={16} color={SHEET.textPrimary} />
            <RNText style={s.emptyBtnText}>Tentar novamente</RNText>
          </Pressable>
        </View>
      ) : (
        <FlatList
          data={news}
          keyExtractor={keyExtractor}
          renderItem={renderItem}
          ListHeaderComponent={ListHeader}
          ListEmptyComponent={renderEmpty}
          ListFooterComponent={renderFooter}
          contentContainerStyle={news.length === 0 ? s.emptyContainer : s.listContent}
          showsVerticalScrollIndicator={false}
          initialNumToRender={3}
          maxToRenderPerBatch={5}
          windowSize={9}
          removeClippedSubviews
          onEndReached={loadMore}
          onEndReachedThreshold={0.5}
          refreshControl={<RefreshControl refreshing={isRefreshing} onRefresh={refresh} tintColor={SHEET.brand} colors={[SHEET.brand]} />}
        />
      )}

      <NewsFiltersSheet
        isOpen={showFilters}
        onClose={() => setShowFilters(false)}
        onApplyFilters={onApplyFilters}
        activeFilters={filters}
        tags={tags}
      />
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: SHEET.bg },
  header: { paddingHorizontal: 16, paddingTop: 8, paddingBottom: 4 },
  eyebrow: { color: SHEET.textFaint, fontSize: 11, letterSpacing: 1.5, fontWeight: '600' },
  title: { color: SHEET.textPrimary, fontSize: 28, fontWeight: '800', marginTop: 4 },
  listContent: { paddingTop: 8, paddingBottom: 28 },
  emptyContainer: { flexGrow: 1, paddingBottom: 28 },
  listHeader: { paddingBottom: 8 },
  searchRow: { paddingHorizontal: 16, marginBottom: 14 },
  chipsRow: { paddingHorizontal: 16, gap: 8 },
  chip: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 14, paddingVertical: 9, borderRadius: 999, backgroundColor: SHEET.glass, borderWidth: 1, borderColor: SHEET.border },
  chipActive: { backgroundColor: SHEET.brand, borderColor: SHEET.brand },
  chipText: { color: SHEET.textMuted, fontSize: 13.5, fontWeight: '600' },
  chipTextActive: { color: SHEET.textPrimary },
  footer: { paddingVertical: 20 },
  empty: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 40, paddingTop: 60 },
  emptyIcon: { width: 72, height: 72, borderRadius: 36, alignItems: 'center', justifyContent: 'center', backgroundColor: SHEET.glass, borderWidth: 1, borderColor: SHEET.border, marginBottom: 16 },
  emptyTitle: { color: SHEET.textPrimary, fontSize: 17, fontWeight: '700', textAlign: 'center' },
  emptyDesc: { color: SHEET.textMuted, fontSize: 13.5, textAlign: 'center', marginTop: 6, lineHeight: 19 },
  emptyBtn: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 18, paddingHorizontal: 18, paddingVertical: 11, borderRadius: 999, backgroundColor: SHEET.glass, borderWidth: 1, borderColor: SHEET.border },
  emptyBtnText: { color: SHEET.textPrimary, fontSize: 14, fontWeight: '700' },
});
