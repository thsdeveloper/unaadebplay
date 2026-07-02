import React, { memo, useCallback, useMemo, useState } from 'react';
import { View, Text as RNText, Pressable, SectionList, RefreshControl, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { useFocusEffect } from 'expo-router';
import { SlidersHorizontal, List, CalendarClock, Heart, CalendarX, HeartOff, SearchX, RotateCw } from 'lucide-react-native';
import { format, isSameDay } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { SHEET } from '@/constants/sheetTokens';
import { GlassSurface } from '@/components/atoms/GlassSurface';
import { EventSearchBar } from '@/components/events/EventSearchBar';
import { EventListCard } from '@/components/events/EventListCard';
import EventFiltersSheet from '@/components/events/EventFiltersSheet';
import EventListSkeletons from '@/components/Skeletons/EventListSkeletons';
import { useEvents } from '@/hooks/useEvents';
import { eventsService } from '@/services/events';
import type { EventsTypes } from '@/types/EventsTypes';

type TabId = 'all' | 'upcoming' | 'favorites';
type Section = { key: string; title: string; isToday: boolean; data: EventsTypes[] };

const TABS: { id: TabId; label: string; Icon: any }[] = [
  { id: 'all', label: 'Todos', Icon: List },
  { id: 'upcoming', label: 'Próximos', Icon: CalendarClock },
  { id: 'favorites', label: 'Favoritos', Icon: Heart },
];

interface ListHeaderProps {
  tab: TabId;
  favoritesCount: number;
  activeFilterCount: number;
  onSearch: (q: string) => void;
  onSelectTab: (id: TabId) => void;
  onOpenFilters: () => void;
}

/**
 * Header da lista em nível de módulo (tipo ESTÁVEL), passado como ELEMENTO à SectionList.
 * Assim, trocar de aba / favoritar apenas RE-RENDERIZA o header em vez de remontá-lo —
 * os GlassView (UIVisualEffectView) permanecem montados e o EventSearchBar não perde
 * texto/foco. Ver revisão adversarial do glass.
 */
const EventsListHeader = memo(function EventsListHeader({
  tab, favoritesCount, activeFilterCount, onSearch, onSelectTab, onOpenFilters,
}: ListHeaderProps) {
  return (
    <View style={s.listHeader}>
      <View style={s.searchRow}>
        <View style={{ flex: 1 }}><EventSearchBar onSearch={onSearch} /></View>
        <Pressable onPress={onOpenFilters} style={s.filterBtn} accessibilityRole="button" accessibilityLabel="Filtrar eventos">
          <GlassSurface style={s.fill} glassEffectStyle="regular" pointerEvents="none" />
          <SlidersHorizontal size={20} color={SHEET.textPrimary} />
          {activeFilterCount > 0 && <View style={s.filterDot} />}
        </Pressable>
      </View>
      <View style={s.tabs}>
        <GlassSurface style={s.fill} glassEffectStyle="regular" pointerEvents="none" />
        {TABS.map(({ id, label, Icon }) => {
          const active = tab === id;
          const count = id === 'favorites' ? favoritesCount : 0;
          return (
            <Pressable key={id} onPress={() => onSelectTab(id)} style={[s.tab, active && s.tabActive]}>
              <Icon size={15} color={active ? SHEET.textPrimary : SHEET.textMuted} fill={id === 'favorites' && active ? SHEET.textPrimary : 'transparent'} />
              <RNText style={[s.tabText, active && s.tabTextActive]}>{label}</RNText>
              {count > 0 && (
                <View style={[s.tabBadge, active && s.tabBadgeActive]}>
                  <RNText style={[s.tabBadgeText, active && s.tabBadgeTextActive]}>{count}</RNText>
                </View>
              )}
            </Pressable>
          );
        })}
      </View>
    </View>
  );
});

export default function EventsScreen() {
  const [tab, setTab] = useState<TabId>('all');
  const [favorites, setFavorites] = useState<Set<string>>(new Set());
  const [showFilters, setShowFilters] = useState(false);
  const { events, loading, refreshing, refresh, searchEvents, applyFilters, clearFilters, activeFilters } = useEvents({ autoLoad: true });

  const hasSearch = !!activeFilters.search?.trim();
  const activeFilterCount = useMemo(
    () => Object.entries(activeFilters).filter(([k, v]) => k !== 'search' && v).length,
    [activeFilters],
  );

  const loadFavorites = useCallback(async () => {
    try {
      setFavorites(new Set(await eventsService.getFavorites()));
    } catch (e) {
      console.warn('Erro ao carregar favoritos:', e);
    }
  }, []);
  useFocusEffect(useCallback(() => { loadFavorites(); }, [loadFavorites]));

  const toggleFavorite = useCallback(async (id: string) => {
    const isFav = favorites.has(id);
    setFavorites((prev) => {
      const n = new Set(prev);
      if (isFav) n.delete(id); else n.add(id);
      return n;
    });
    try {
      if (isFav) await eventsService.removeFromFavorites(id);
      else await eventsService.addToFavorites(id);
    } catch {
      setFavorites((prev) => {
        const n = new Set(prev);
        if (isFav) n.add(id); else n.delete(id);
        return n;
      });
    }
  }, [favorites]);

  const visibleEvents = useMemo(() => {
    if (tab === 'upcoming') {
      const now = Date.now();
      return events.filter((e) => new Date(e.start_date_time).getTime() >= now);
    }
    if (tab === 'favorites') return events.filter((e) => favorites.has(e.id));
    return events;
  }, [events, tab, favorites]);

  const sections = useMemo<Section[]>(() => {
    const groups = new Map<string, EventsTypes[]>();
    for (const e of visibleEvents) {
      const d = new Date(e.start_date_time);
      const key = isNaN(d.getTime()) ? 'sem-data' : d.toISOString().slice(0, 10);
      const arr = groups.get(key);
      if (arr) arr.push(e); else groups.set(key, [e]);
    }
    const today = new Date();
    return [...groups.entries()]
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([key, data]) => {
        const d = new Date(data[0].start_date_time);
        const valid = !isNaN(d.getTime());
        const title = valid
          ? format(d, "EEEE, dd 'de' MMMM", { locale: ptBR }).replace(/^\w/, (ch) => ch.toUpperCase())
          : 'Data a definir';
        return { key, title, isToday: valid && isSameDay(d, today), data };
      });
  }, [visibleEvents]);

  const renderItem = useCallback(({ item }: { item: EventsTypes }) => (
    <EventListCard event={item} isFavorite={favorites.has(item.id)} onToggleFavorite={toggleFavorite} />
  ), [favorites, toggleFavorite]);

  const renderSectionHeader = useCallback(({ section }: { section: Section }) => (
    <View style={s.secHeader}>
      <RNText style={s.secTitle}>{section.title}</RNText>
      {section.isToday && <View style={s.todayPill}><RNText style={s.todayText}>Hoje</RNText></View>}
    </View>
  ), []);

  const keyExtractor = useCallback((it: EventsTypes) => it.id, []);

  const renderEmpty = useCallback(() => {
    let Icon = CalendarX;
    let title = 'Nenhum evento por aqui';
    let desc = 'Assim que novos eventos forem publicados, eles aparecem aqui.';
    if (hasSearch) {
      Icon = SearchX; title = 'Nada encontrado'; desc = `Nenhum evento corresponde a "${activeFilters.search}".`;
    } else if (tab === 'upcoming') {
      Icon = CalendarClock; title = 'Sem eventos futuros'; desc = 'Você está em dia. Não há eventos próximos agendados.';
    } else if (tab === 'favorites') {
      Icon = HeartOff; title = 'Nenhum favorito ainda'; desc = 'Toque no coração de um evento para salvá-lo aqui.';
    }
    return (
      <View style={s.empty}>
        <View style={s.emptyIcon}><Icon size={30} color={SHEET.textMuted} /></View>
        <RNText style={s.emptyTitle}>{title}</RNText>
        <RNText style={s.emptyDesc}>{desc}</RNText>
        {hasSearch ? (
          <Pressable onPress={() => searchEvents('')} style={s.emptyBtn}>
            <RNText style={s.emptyBtnText}>Limpar busca</RNText>
          </Pressable>
        ) : tab === 'all' ? (
          <Pressable onPress={refresh} style={s.emptyBtn}>
            <RotateCw size={16} color={SHEET.textPrimary} />
            <RNText style={s.emptyBtnText}>Atualizar</RNText>
          </Pressable>
        ) : null}
      </View>
    );
  }, [hasSearch, tab, activeFilters.search, searchEvents, refresh]);

  const openFilters = useCallback(() => setShowFilters(true), []);

  return (
    <SafeAreaView style={s.safe} edges={['top']}>
      <StatusBar style="light" />
      <View style={s.header}>
        <RNText style={s.eyebrow}>AGENDA</RNText>
        <RNText style={s.title}>Eventos</RNText>
      </View>
      {loading && events.length === 0 ? (
        <EventListSkeletons count={4} />
      ) : (
        <SectionList
          sections={sections}
          keyExtractor={keyExtractor}
          renderItem={renderItem}
          renderSectionHeader={renderSectionHeader}
          ListHeaderComponent={
            <EventsListHeader
              tab={tab}
              favoritesCount={favorites.size}
              activeFilterCount={activeFilterCount}
              onSearch={searchEvents}
              onSelectTab={setTab}
              onOpenFilters={openFilters}
            />
          }
          ListEmptyComponent={renderEmpty}
          stickySectionHeadersEnabled
          contentContainerStyle={sections.length === 0 ? s.emptyContainer : s.listContent}
          showsVerticalScrollIndicator={false}
          initialNumToRender={4}
          maxToRenderPerBatch={6}
          windowSize={9}
          removeClippedSubviews
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={refresh} tintColor={SHEET.brand} colors={[SHEET.brand]} />}
        />
      )}
      <EventFiltersSheet
        isOpen={showFilters}
        onClose={() => setShowFilters(false)}
        onApplyFilters={applyFilters}
        activeFilters={activeFilters}
        onClearFilters={clearFilters}
      />
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: SHEET.bg },
  header: { paddingHorizontal: 16, paddingTop: 8, paddingBottom: 4 },
  eyebrow: { color: SHEET.textFaint, fontSize: 11, letterSpacing: 1.5, fontWeight: '600' },
  title: { color: SHEET.textPrimary, fontSize: 28, fontWeight: '800', marginTop: 4 },
  listContent: { paddingTop: 8, paddingBottom: 120 },
  emptyContainer: { flexGrow: 1, paddingBottom: 120 },
  listHeader: { paddingBottom: 8 },
  searchRow: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingHorizontal: 16, marginBottom: 14 },
  filterBtn: { width: 58, height: 58, borderRadius: 18, alignItems: 'center', justifyContent: 'center', overflow: 'hidden', borderWidth: 1, borderColor: SHEET.border },
  filterDot: { position: 'absolute', top: 12, right: 12, width: 9, height: 9, borderRadius: 5, backgroundColor: SHEET.brand, borderWidth: 1, borderColor: SHEET.bg },
  fill: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 },
  tabs: { flexDirection: 'row', gap: 8, marginHorizontal: 16, padding: 4, borderRadius: 999, borderWidth: 1, borderColor: SHEET.border, overflow: 'hidden' },
  tab: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, paddingVertical: 9, borderRadius: 999 },
  tabActive: { backgroundColor: SHEET.brand },
  tabText: { color: SHEET.textMuted, fontSize: 13.5, fontWeight: '600' },
  tabTextActive: { color: SHEET.textPrimary },
  tabBadge: { minWidth: 18, height: 18, paddingHorizontal: 5, borderRadius: 9, backgroundColor: SHEET.brandTint, alignItems: 'center', justifyContent: 'center' },
  tabBadgeActive: { backgroundColor: 'rgba(255,255,255,0.22)' },
  tabBadgeText: { color: SHEET.brand, fontSize: 11, fontWeight: '800' },
  tabBadgeTextActive: { color: SHEET.textPrimary },
  secHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: SHEET.bg, paddingHorizontal: 16, paddingTop: 14, paddingBottom: 8 },
  secTitle: { color: SHEET.textSecondary, fontSize: 13.5, fontWeight: '700' },
  todayPill: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 999, backgroundColor: SHEET.brandTint },
  todayText: { color: SHEET.brand, fontSize: 11, fontWeight: '800' },
  empty: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 40, paddingTop: 60 },
  emptyIcon: { width: 72, height: 72, borderRadius: 36, alignItems: 'center', justifyContent: 'center', backgroundColor: SHEET.glass, borderWidth: 1, borderColor: SHEET.border, marginBottom: 16 },
  emptyTitle: { color: SHEET.textPrimary, fontSize: 17, fontWeight: '700', textAlign: 'center' },
  emptyDesc: { color: SHEET.textMuted, fontSize: 13.5, textAlign: 'center', marginTop: 6, lineHeight: 19 },
  emptyBtn: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 18, paddingHorizontal: 18, paddingVertical: 11, borderRadius: 999, backgroundColor: SHEET.glass, borderWidth: 1, borderColor: SHEET.border },
  emptyBtnText: { color: SHEET.textPrimary, fontSize: 14, fontWeight: '700' },
});
