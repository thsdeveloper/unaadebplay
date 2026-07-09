import React, { memo, useCallback, useMemo, useRef, useState } from 'react';
import { View, Text as RNText, Pressable, ScrollView, SectionList, RefreshControl, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { useFocusEffect, useRouter } from 'expo-router';
import {
  List, CalendarClock, Heart, CalendarX, HeartOff, SearchX, RotateCw, TicketCheck,
} from 'lucide-react-native';
import { format, isValid } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { SHEET } from '@/constants/sheetTokens';
import { EventSearchBar } from '@/components/events/EventSearchBar';
import { EventAgendaCard } from '@/components/events/EventAgendaCard';
import { EventCountdownHero } from '@/components/events/EventCountdownHero';
import { EVENT_TYPES, typeTint } from '@/components/events/eventTypeMeta';
import EventFiltersSheet from '@/components/events/EventFiltersSheet';
import EventListSkeletons from '@/components/Skeletons/EventListSkeletons';
import { useEvents } from '@/hooks/useEvents';
import { eventsService } from '@/services/events';
import type { EventsTypes } from '@/types/EventsTypes';

type TabId = 'upcoming' | 'all' | 'favorites';
type Section = { key: string; title: string; count: number; data: EventsTypes[] };

const TABS: { id: TabId; label: string; Icon: any }[] = [
  { id: 'upcoming', label: 'Próximos', Icon: CalendarClock },
  { id: 'all', label: 'Todos', Icon: List },
  { id: 'favorites', label: 'Favoritos', Icon: Heart },
];

const getTime = (e: EventsTypes) => new Date(e.start_date_time).getTime();

/* ------------------------------- Type chip ------------------------------- */
const TypeChip: React.FC<{ label: string; Icon: any; color: string; active: boolean; onPress: () => void }> = ({ label, Icon, color, active, onPress }) => (
  <Pressable
    onPress={onPress}
    style={[tc.chip, active && { backgroundColor: typeTint(color, 0.18), borderColor: typeTint(color, 0.55) }]}
    accessibilityRole="button"
    accessibilityLabel={label}
  >
    <Icon size={14} color={active ? color : SHEET.textMuted} />
    <RNText style={[tc.text, active && tc.textActive]} numberOfLines={1}>{label}</RNText>
  </Pressable>
);

/* --------------------------------- Header -------------------------------- */
interface HeaderProps {
  tab: TabId;
  activeType: string | null;
  favoritesCount: number;
  sheetFilterCount: number;
  onSearch: (q: string) => void;
  onSelectTab: (id: TabId) => void;
  onSelectType: (id: string | null) => void;
  onOpenFilters: () => void;
}

/** Header estável (memo) — passado como ELEMENTO: trocar aba/tipo só re-renderiza,
 *  os GlassView permanecem montados e o EventSearchBar não perde foco/texto. */
const AgendaHeader = memo(function AgendaHeader({
  tab, activeType, favoritesCount, sheetFilterCount, onSearch, onSelectTab, onSelectType, onOpenFilters,
}: HeaderProps) {
  return (
    <View style={s.listHeader}>
      <View style={s.searchRow}>
        <EventSearchBar onSearch={onSearch} onOpenFilters={onOpenFilters} filterCount={sheetFilterCount} />
      </View>

      {/* Barra única: escopo (Próximos/Todos/Favoritos) + tipos, separados por um divisor.
          Antes eram DUAS linhas (chips + abas); unir libera a altura de uma linha inteira. */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={s.chipsRow} keyboardShouldPersistTaps="handled">
        {TABS.map(({ id, label, Icon }) => {
          const active = tab === id;
          const count = id === 'favorites' ? favoritesCount : 0;
          return (
            <Pressable key={id} onPress={() => onSelectTab(id)} style={[s.scopeChip, active && s.scopeChipActive]} accessibilityRole="button" accessibilityLabel={label}>
              <Icon size={14} color={active ? SHEET.textPrimary : SHEET.textMuted} fill={id === 'favorites' && active ? SHEET.textPrimary : 'transparent'} />
              <RNText style={[s.scopeText, active && s.scopeTextActive]}>{label}</RNText>
              {count > 0 && (
                <View style={[s.scopeBadge, active && s.scopeBadgeActive]}>
                  <RNText style={[s.scopeBadgeText, active && s.scopeBadgeTextActive]}>{count}</RNText>
                </View>
              )}
            </Pressable>
          );
        })}

        <View style={s.chipDivider} />

        {EVENT_TYPES.map((t) => {
          const active = activeType === t.id;
          return (
            <TypeChip key={t.id} label={t.label} Icon={t.Icon} color={t.color} active={active} onPress={() => onSelectType(active ? null : t.id)} />
          );
        })}
      </ScrollView>
    </View>
  );
});

/* --------------------------------- Screen -------------------------------- */
export default function EventsScreen() {
  const router = useRouter();
  const [tab, setTab] = useState<TabId>('upcoming');
  const [favorites, setFavorites] = useState<Set<string>>(new Set());
  const [showFilters, setShowFilters] = useState(false);
  const seen = useRef<Set<string>>(new Set()); // ids já animados (evita replay ao rolar)
  const { events, loading, refreshing, refresh, searchEvents, applyFilters, clearFilters, activeFilters } = useEvents({ autoLoad: true });

  const hasSearch = !!activeFilters.search?.trim();
  const activeType = (activeFilters as any).eventType ?? null;
  const sheetFilterCount = useMemo(
    () => Object.entries(activeFilters).filter(([k, v]) => k !== 'search' && k !== 'eventType' && v).length,
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

  const onSelectType = useCallback((id: string | null) => applyFilters({ eventType: id ?? undefined } as any), [applyFilters]);

  // Próximo evento (hero) — só na aba Próximos e sem busca ativa.
  const heroEvent = useMemo(() => {
    if (tab !== 'upcoming' || hasSearch) return null;
    const now = Date.now();
    return events.filter((e) => getTime(e) >= now).sort((a, b) => getTime(a) - getTime(b))[0] ?? null;
  }, [events, tab, hasSearch]);

  const visibleEvents = useMemo(() => {
    const now = Date.now();
    let list = events;
    if (tab === 'upcoming') list = events.filter((e) => getTime(e) >= now);
    else if (tab === 'favorites') list = events.filter((e) => favorites.has(e.id));
    const sorted = [...list].sort((a, b) => getTime(a) - getTime(b));
    return heroEvent ? sorted.filter((e) => e.id !== heroEvent.id) : sorted;
  }, [events, tab, favorites, heroEvent]);

  const sections = useMemo<Section[]>(() => {
    const groups = new Map<string, EventsTypes[]>();
    for (const e of visibleEvents) {
      const dt = new Date(e.start_date_time);
      const key = isValid(dt) ? format(dt, 'yyyy-MM') : 'zzz-sem-data';
      const arr = groups.get(key);
      if (arr) arr.push(e); else groups.set(key, [e]);
    }
    return [...groups.entries()]
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([key, data]) => {
        const dt = new Date(data[0].start_date_time);
        const title = isValid(dt)
          ? format(dt, "MMMM 'de' yyyy", { locale: ptBR }).replace(/^\w/, (c) => c.toUpperCase())
          : 'Data a definir';
        return { key, title, count: data.length, data };
      });
  }, [visibleEvents]);

  const renderItem = useCallback(({ item, index, section }: { item: EventsTypes; index: number; section: Section }) => {
    const first = !seen.current.has(item.id);
    seen.current.add(item.id);
    return (
      <EventAgendaCard
        event={item}
        isFavorite={favorites.has(item.id)}
        onToggleFavorite={toggleFavorite}
        isPast={getTime(item) < Date.now()}
        isFirst={index === 0}
        isLast={index === section.data.length - 1}
        animate={first}
        index={index}
      />
    );
  }, [favorites, toggleFavorite]);

  const renderSectionHeader = useCallback(({ section }: { section: Section }) => (
    <View style={s.monthHeader}>
      <RNText style={s.monthTitle}>{section.title}</RNText>
      <View style={s.monthRule} />
      <View style={s.monthCount}><RNText style={s.monthCountText}>{section.count}</RNText></View>
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
        ) : tab !== 'favorites' ? (
          <Pressable onPress={refresh} style={s.emptyBtn}>
            <RotateCw size={16} color={SHEET.textPrimary} />
            <RNText style={s.emptyBtnText}>Atualizar</RNText>
          </Pressable>
        ) : null}
      </View>
    );
  }, [hasSearch, tab, activeFilters.search, searchEvents, refresh]);

  const openFilters = useCallback(() => setShowFilters(true), []);

  const headerEl = (
    <View>
      <AgendaHeader
        tab={tab}
        activeType={activeType}
        favoritesCount={favorites.size}
        sheetFilterCount={sheetFilterCount}
        onSearch={searchEvents}
        onSelectTab={setTab}
        onSelectType={onSelectType}
        onOpenFilters={openFilters}
      />
      {heroEvent && (
        <EventCountdownHero event={heroEvent} isFavorite={favorites.has(heroEvent.id)} onToggleFavorite={toggleFavorite} />
      )}
    </View>
  );

  return (
    <SafeAreaView style={s.safe} edges={['top']}>
      <StatusBar style="light" />
      <View style={s.header}>
        <View style={{ flex: 1 }}>
          <RNText style={s.eyebrow}>PROGRAMAÇÃO</RNText>
          <RNText style={s.title}>Agenda</RNText>
        </View>
        <Pressable
          onPress={() => router.push('/(tabs)/(events)/subscriptions' as any)}
          style={s.myEventsBtn}
          accessibilityRole="button"
          accessibilityLabel="Minhas inscrições"
        >
          <TicketCheck size={17} color={SHEET.brand} />
          <RNText style={s.myEventsText}>Inscrições</RNText>
        </Pressable>
      </View>

      {loading && events.length === 0 ? (
        <EventListSkeletons count={4} />
      ) : (
        <SectionList
          sections={sections}
          keyExtractor={keyExtractor}
          renderItem={renderItem}
          renderSectionHeader={renderSectionHeader}
          ListHeaderComponent={headerEl}
          ListEmptyComponent={renderEmpty}
          stickySectionHeadersEnabled={false}
          contentContainerStyle={sections.length === 0 ? s.emptyContainer : s.listContent}
          showsVerticalScrollIndicator={false}
          initialNumToRender={6}
          maxToRenderPerBatch={8}
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

const tc = StyleSheet.create({
  chip: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 13, paddingVertical: 8, borderRadius: 999, backgroundColor: SHEET.glass, borderWidth: 1, borderColor: SHEET.border },
  text: { color: SHEET.textMuted, fontSize: 13, fontWeight: '700' },
  textActive: { color: SHEET.textPrimary },
});

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: SHEET.bg },
  header: { flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between', gap: 12, paddingHorizontal: 16, paddingTop: 8, paddingBottom: 4 },
  eyebrow: { color: SHEET.textFaint, fontSize: 11, letterSpacing: 1.5, fontWeight: '600' },
  title: { color: SHEET.textPrimary, fontSize: 28, fontWeight: '800', marginTop: 4 },
  myEventsBtn: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 12, paddingVertical: 9, borderRadius: 999, backgroundColor: SHEET.brandTint, borderWidth: 1, borderColor: 'rgba(229,28,68,0.35)' },
  myEventsText: { color: SHEET.brand, fontSize: 13, fontWeight: '700' },
  listContent: { paddingTop: 8, paddingBottom: 120 },
  emptyContainer: { flexGrow: 1, paddingBottom: 120 },
  listHeader: { paddingBottom: 6 },

  searchRow: { paddingHorizontal: 16, marginBottom: 12 },

  chipsRow: { paddingHorizontal: 16, gap: 8, paddingBottom: 10, alignItems: 'center' },
  scopeChip: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 13, paddingVertical: 8, borderRadius: 999, backgroundColor: SHEET.glass, borderWidth: 1, borderColor: SHEET.border },
  scopeChipActive: { backgroundColor: SHEET.brand, borderColor: SHEET.brand },
  scopeText: { color: SHEET.textMuted, fontSize: 13, fontWeight: '700' },
  scopeTextActive: { color: SHEET.textPrimary },
  scopeBadge: { minWidth: 16, height: 16, paddingHorizontal: 4, borderRadius: 8, backgroundColor: SHEET.brandTint, alignItems: 'center', justifyContent: 'center' },
  scopeBadgeActive: { backgroundColor: 'rgba(255,255,255,0.22)' },
  scopeBadgeText: { color: SHEET.brand, fontSize: 10, fontWeight: '800' },
  scopeBadgeTextActive: { color: SHEET.textPrimary },
  chipDivider: { width: 1, height: 22, backgroundColor: SHEET.border, marginHorizontal: 4, alignSelf: 'center' },

  monthHeader: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: 16, paddingTop: 12, paddingBottom: 12 },
  monthTitle: { color: SHEET.textPrimary, fontSize: 13, fontWeight: '800', letterSpacing: 0.4, textTransform: 'uppercase' },
  monthRule: { flex: 1, height: 1, backgroundColor: SHEET.hairline },
  monthCount: { minWidth: 22, height: 20, paddingHorizontal: 6, borderRadius: 10, alignItems: 'center', justifyContent: 'center', backgroundColor: SHEET.glass, borderWidth: 1, borderColor: SHEET.border },
  monthCountText: { color: SHEET.textMuted, fontSize: 11, fontWeight: '800' },

  empty: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 40, paddingTop: 60 },
  emptyIcon: { width: 72, height: 72, borderRadius: 36, alignItems: 'center', justifyContent: 'center', backgroundColor: SHEET.glass, borderWidth: 1, borderColor: SHEET.border, marginBottom: 16 },
  emptyTitle: { color: SHEET.textPrimary, fontSize: 17, fontWeight: '700', textAlign: 'center' },
  emptyDesc: { color: SHEET.textMuted, fontSize: 13.5, textAlign: 'center', marginTop: 6, lineHeight: 19 },
  emptyBtn: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 18, paddingHorizontal: 18, paddingVertical: 11, borderRadius: 999, backgroundColor: SHEET.glass, borderWidth: 1, borderColor: SHEET.border },
  emptyBtnText: { color: SHEET.textPrimary, fontSize: 14, fontWeight: '700' },
});
