import React, { useCallback } from 'react';
import { FlatList, ListRenderItem } from 'react-native';
import { Feather } from '@expo/vector-icons';
import SectionContainer from '@/components/SectionContainer';
import { RailSkeleton } from './RailSkeleton';
import type { SectionStatus } from '@/hooks/useHomeFeed';

/** Recuo lateral do trilho — usado no contentContainerStyle E no getItemLayout (não podem divergir). */
const RAIL_PADDING = 12;

export interface MediaRailProps<T> {
  title: string;
  icon?: keyof typeof Feather.glyphMap;
  data: T[];
  status: SectionStatus;
  renderCard: (item: T, index: number) => React.ReactElement;
  keyExtractor: (item: T) => string;
  seeAllRoute?: string;
  cardWidth: number;
  cardHeight?: number;
  gap?: number;
}

/**
 * Prateleira horizontal genérica (Netflix-style): reusa SectionContainer como
 * cabeçalho (título + ícone + "Ver todos") e virtualiza os cards.
 * Some do feed quando a fonte está vazia/errada — sem cabeçalho órfão.
 */
function MediaRailInner<T>({
  title,
  icon,
  data,
  status,
  renderCard,
  keyExtractor,
  seeAllRoute,
  cardWidth,
  cardHeight,
  gap = 12,
}: MediaRailProps<T>) {
  // Hooks SEMPRE antes de qualquer return condicional (Rules of Hooks) — o status
  // 'empty'/'error' varia entre renders (ex.: no reload), então o early-return
  // precisa vir DEPOIS dos useCallback.
  const renderItem = useCallback<ListRenderItem<T>>(
    ({ item, index }) => renderCard(item, index),
    [renderCard],
  );

  const getItemLayout = useCallback(
    (_d: ArrayLike<T> | null | undefined, index: number) => ({
      length: cardWidth + gap,
      // + RAIL_PADDING: o item 0 começa após o recuo lateral do contentContainer.
      offset: RAIL_PADDING + (cardWidth + gap) * index,
      index,
    }),
    [cardWidth, gap],
  );

  if (status === 'empty' || status === 'error') return null;

  return (
    <SectionContainer title={title} icon={icon} seeAllRoute={seeAllRoute} animateOnMount={false}>
      {status === 'loading' ? (
        <RailSkeleton cardWidth={cardWidth} cardHeight={cardHeight} gap={gap} />
      ) : (
        <FlatList
          horizontal
          data={data}
          renderItem={renderItem}
          keyExtractor={keyExtractor}
          getItemLayout={getItemLayout}
          showsHorizontalScrollIndicator={false}
          decelerationRate="fast"
          snapToInterval={cardWidth + gap}
          snapToAlignment="start"
          contentContainerStyle={{ paddingHorizontal: RAIL_PADDING, gap }}
          initialNumToRender={3}
          maxToRenderPerBatch={4}
          windowSize={3}
          removeClippedSubviews
        />
      )}
    </SectionContainer>
  );
}

export const MediaRail = React.memo(MediaRailInner) as typeof MediaRailInner;
