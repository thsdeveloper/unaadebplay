import React, { memo } from 'react';
import { CongressType } from '@/types/CongressType';
import { CongressItem } from './CongressItem';
import { getCongressImageUrl } from '../utils/imageHelpers';

interface CarouselItemWrapperProps {
  data: {
    item: CongressType;
    index: number;
  };
  animatedStyle: any;
  apiUrl: string;
}

/**
 * Wrapper component to isolate carousel items from react-native-snap-carousel's
 * internal prop spreading that causes the "key prop" warning
 */
export const CarouselItemWrapper = memo<CarouselItemWrapperProps>(({ 
  data, 
  animatedStyle, 
  apiUrl 
}) => {
  const { item } = data;
  const imageUrl = getCongressImageUrl(item, apiUrl);
  
  return (
    <CongressItem
      item={item}
      animatedStyle={animatedStyle}
      imageUrl={imageUrl}
    />
  );
});

CarouselItemWrapper.displayName = 'CarouselItemWrapper';