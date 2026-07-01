import React from 'react';
import { View } from 'react-native';
import { Skeleton } from '@/components/ui/skeleton';

interface Props {
  cardWidth: number;
  cardHeight?: number;
  gap?: number;
}

/** Placeholders da prateleira durante o cold start — dá forma antes dos dados. */
export const RailSkeleton: React.FC<Props> = ({ cardWidth, cardHeight, gap = 12 }) => {
  const h = cardHeight ?? Math.round(cardWidth * 0.56);
  return (
    <View style={{ flexDirection: 'row', paddingHorizontal: 12, gap }}>
      {[0, 1, 2].map((i) => (
        <Skeleton key={i} style={{ width: cardWidth, height: h, borderRadius: 16 }} />
      ))}
    </View>
  );
};
