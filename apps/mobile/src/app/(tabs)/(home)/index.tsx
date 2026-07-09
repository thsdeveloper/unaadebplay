import React, { useCallback } from 'react';
import { View, StyleSheet, ListRenderItem, RefreshControl } from 'react-native';
import Animated, { useSharedValue, useAnimatedScrollHandler, withTiming } from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { HomeHeader, HOME_HEADER_H } from '@/components/home/HomeHeader';
import { useHomeFeed } from '@/hooks/useHomeFeed';
import { HomeHero } from '@/components/organisms/HomeHero';
import { QuickAccessBento } from '@/components/organisms/QuickAccessBento';
import { HomeBannerCard } from '@/components/organisms/HomeBanner';
import { MediaRail } from '@/components/organisms/MediaRail';
import { LeadershipRail } from '@/components/organisms/LeadershipRail';
import { HomeFooter } from '@/components/organisms/HomeFooter';
import { EventCard, EVENT_CARD_WIDTH } from '@/components/molecules/EventCard';
import { NewsCard, NEWS_CARD_WIDTH } from '@/components/NewsCard';
import type { EventsTypes } from '@/types/EventsTypes';
import type { NewsTypes } from '@/types/NewsTypes';

const BG = '#0D0F17';

// Header "quick-return": limiares em px do gesto para colapsar/revelar as tags.
// SHOW pequeno = revela ao subir "um pouquinho"; HIDE um pouco maior evita esconder por tremida.
const HIDE_THRESHOLD = 12; // rolar PRA BAIXO ~12px → esconde as tags
const SHOW_THRESHOLD = 8; // rolar PRA CIMA ~8px → revela as tags (responsivo)

type SectionType = 'banner' | 'quickAccess' | 'events' | 'news' | 'leadership' | 'footer';
interface Section { key: string; type: SectionType; }

const SECTIONS: Section[] = [
  { key: 'banner', type: 'banner' },
  { key: 'quickAccess', type: 'quickAccess' },
  { key: 'events', type: 'events' },
  { key: 'news', type: 'news' },
  { key: 'leadership', type: 'leadership' },
  { key: 'footer', type: 'footer' },
];

/**
 * Home no estilo Netflix: um único FlatList vertical virtualizado cujos itens SÃO
 * as seções — hero cinematográfico (ListHeaderComponent), âncora de acesso rápido
 * e prateleiras horizontais. Zero lógica de negócio (fica no useHomeFeed).
 */
export default function HomeScreen() {
  const feed = useHomeFeed();
  const insets = useSafeAreaInsets();

  // Scroll compartilhado (UI thread).
  const scrollY = useSharedValue(0); // posição absoluta → fundo/hairline do header
  const reveal = useSharedValue(1); // 1 = tags visíveis, 0 = colapsadas (dirigido pelo SENTIDO)
  const lastY = useSharedValue(0);
  const accum = useSharedValue(0); // px acumulados no sentido atual (+ baixo / − cima)
  const shown = useSharedValue(1); // intenção atual — evita re-disparar withTiming a cada frame

  // "Quick-return": as tags revelam pelo SENTIDO do gesto (subiu um pouco → aparecem), não
  // pela posição — então funcionam mesmo lá no fim da lista, sem precisar voltar ao topo.
  const onScroll = useAnimatedScrollHandler({
    onScroll: (e) => {
      const y = e.contentOffset.y;
      scrollY.value = y;
      const dy = y - lastY.value;
      lastY.value = y;

      // No topo (ou quase): tags sempre visíveis.
      if (y <= 4) {
        accum.value = 0;
        if (shown.value !== 1) { shown.value = 1; reveal.value = withTiming(1, { duration: 160 }); }
        return;
      }
      if (dy === 0) return;

      // Acumula no sentido atual; zera ao inverter o sentido (descarta jitter oposto).
      if (dy > 0) accum.value = accum.value > 0 ? accum.value + dy : dy;
      else accum.value = accum.value < 0 ? accum.value + dy : dy;

      if (accum.value > HIDE_THRESHOLD && shown.value !== 0) {
        shown.value = 0;
        reveal.value = withTiming(0, { duration: 200 });
      } else if (accum.value < -SHOW_THRESHOLD && shown.value !== 1) {
        shown.value = 1;
        reveal.value = withTiming(1, { duration: 160 });
      }
    },
  });

  // Callbacks estáveis -> o React.memo do MediaRail consegue pular trilhos inalterados.
  const renderEventCard = useCallback((e: EventsTypes) => <EventCard event={e} />, []);
  const renderNewsCard = useCallback((n: NewsTypes) => <NewsCard news={n} variant="rail" />, []);
  const eventKey = useCallback((e: EventsTypes) => e.id, []);
  const newsKey = useCallback((n: NewsTypes) => n.id, []);

  const renderItem = useCallback<ListRenderItem<Section>>(
    ({ item }) => {
      switch (item.type) {
        case 'banner':
          return <HomeBannerCard banner={feed.banners.data[0]} />;
        case 'quickAccess':
          return <QuickAccessBento />;
        case 'events':
          return (
            <MediaRail<EventsTypes>
              title="Próximos eventos"
              icon="calendar"
              data={feed.events.data}
              status={feed.events.status}
              cardWidth={EVENT_CARD_WIDTH}
              cardHeight={Math.round(EVENT_CARD_WIDTH * 0.56)}
              keyExtractor={eventKey}
              renderCard={renderEventCard}
              seeAllRoute="/(tabs)/(events)"
            />
          );
        case 'news':
          return (
            <MediaRail<NewsTypes>
              title="Notícias"
              icon="book-open"
              data={feed.news.data}
              status={feed.news.status}
              cardWidth={NEWS_CARD_WIDTH}
              cardHeight={Math.round(NEWS_CARD_WIDTH * 0.62)}
              keyExtractor={newsKey}
              renderCard={renderNewsCard}
              seeAllRoute="/(tabs)/(posts)"
            />
          );
        case 'leadership':
          return <LeadershipRail slice={feed.leadership} />;
        case 'footer':
          return <HomeFooter />;
        default:
          return null;
      }
    },
    [feed.banners, feed.events, feed.news, feed.leadership],
  );

  return (
    <View style={{ flex: 1, backgroundColor: BG }}>
      {/* Degradê ambiente (só na Home) — tom mais claro vindo do canto direito, à la Netflix. */}
      <LinearGradient
        colors={['#1E2A47', '#12182B', '#0D0F17']}
        locations={[0, 0.42, 0.88]}
        start={{ x: 1, y: 0.02 }}
        end={{ x: 0.05, y: 0.62 }}
        style={StyleSheet.absoluteFill}
        pointerEvents="none"
      />
      <StatusBar style="light" />
      <Animated.FlatList
        style={{ backgroundColor: 'transparent' }}
        data={SECTIONS}
        keyExtractor={(s) => s.key}
        renderItem={renderItem}
        ListHeaderComponent={<HomeHero slides={feed.heroSlides} status={feed.heroStatus} />}
        // paddingBottom limpa a tab bar NATIVA flutuante (Liquid Glass): como usamos
        // contentInsetAdjustmentBehavior="never" (p/ o header sobreposto não duplicar o
        // inset do topo), o inset inferior nativo não entra — reservamos manualmente para
        // o último card (CTA de comunidade) ficar 100% visível acima da barra.
        contentContainerStyle={{ paddingTop: insets.top + HOME_HEADER_H + 2, paddingBottom: insets.bottom + 20 }}
        contentInsetAdjustmentBehavior="never"
        showsVerticalScrollIndicator={false}
        removeClippedSubviews
        windowSize={5}
        initialNumToRender={3}
        maxToRenderPerBatch={3}
        updateCellsBatchingPeriod={50}
        onScroll={onScroll}
        scrollEventThrottle={16}
        refreshControl={
          <RefreshControl
            refreshing={feed.refreshing}
            onRefresh={feed.reload}
            tintColor="#E51C44"
            colors={['#E51C44']}
            progressBackgroundColor="#111827"
          />
        }
      />
      <HomeHeader scrollY={scrollY} reveal={reveal} />
    </View>
  );
}
