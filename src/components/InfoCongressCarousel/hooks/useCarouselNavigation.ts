import { useState, useRef, useEffect } from 'react';
import Carousel from 'react-native-snap-carousel';
import { CongressType } from '@/types/CongressType';
import { UseCarouselNavigationReturn } from '../types';

export const useCarouselNavigation = (
  itemsCount: number
): UseCarouselNavigationReturn => {
  const [activeIndex, setActiveIndex] = useState<number>(0);
  const carouselRef = useRef<Carousel<CongressType>>(null);

  // Reset active index when items count changes
  useEffect(() => {
    if (itemsCount > 0 && activeIndex >= itemsCount) {
      setActiveIndex(0);
    }
  }, [itemsCount, activeIndex]);

  // Snap to active index when carousel is ready
  useEffect(() => {
    if (carouselRef.current && itemsCount > 0 && activeIndex < itemsCount) {
      // Use setTimeout to ensure carousel is fully rendered
      setTimeout(() => {
        carouselRef.current?.snapToItem(activeIndex, false, false);
      }, 100);
    }
  }, [activeIndex, itemsCount]);

  return {
    activeIndex,
    setActiveIndex,
    carouselRef,
  };
};