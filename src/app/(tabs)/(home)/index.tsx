import React, { useCallback } from 'react';
import { FlatList, ListRenderItem, RefreshControl } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useHomeFeed } from '@/hooks/useHomeFeed';
import { HomeHero } from '@/components/organisms/HomeHero';
import { QuickAccessBento } from '@/components/organisms/QuickAccessBento';
import { MediaRail } from '@/components/organisms/MediaRail';
import { LeadershipRail } from '@/components/organisms/LeadershipRail';
import { HomeFooter } from '@/components/organisms/HomeFooter';
import { EventCard, EVENT_CARD_WIDTH } from '@/components/molecules/EventCard';
import { NewsCard, NEWS_CARD_WIDTH } from '@/components/NewsCard';
import type { EventsTypes } from '@/types/EventsTypes';
import type { NewsTypes } from '@/types/NewsTypes';

const BG = '#0D0F17';

type SectionType = 'quickAccess' | 'events' | 'news' | 'leadership' | 'footer';
interface Section { key: string; type: SectionType; }

const SECTIONS: Section[] = [
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

  // Callbacks estáveis -> o React.memo do MediaRail consegue pular trilhos inalterados.
  const renderEventCard = useCallback((e: EventsTypes) => <EventCard event={e} />, []);
  const renderNewsCard = useCallback((n: NewsTypes) => <NewsCard news={n} variant="rail" />, []);
  const eventKey = useCallback((e: EventsTypes) => e.id, []);
  const newsKey = useCallback((n: NewsTypes) => n.id, []);

  const renderItem = useCallback<ListRenderItem<Section>>(
    ({ item }) => {
      switch (item.type) {
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
    [feed.events, feed.news, feed.leadership],
  );

  return (
    <>
      <StatusBar style="light" />
      <FlatList
        style={{ backgroundColor: BG }}
        data={SECTIONS}
        keyExtractor={(s) => s.key}
        renderItem={renderItem}
        ListHeaderComponent={<HomeHero slides={feed.heroSlides} status={feed.heroStatus} />}
        contentContainerStyle={{ paddingBottom: 12 }}
        showsVerticalScrollIndicator={false}
        removeClippedSubviews
        windowSize={5}
        initialNumToRender={3}
        maxToRenderPerBatch={3}
        updateCellsBatchingPeriod={50}
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
    </>
  );
}
