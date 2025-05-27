import React, { useCallback, useContext, useEffect, memo } from 'react';
import { View, ActivityIndicator, Platform } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import Carousel from 'react-native-snap-carousel';
import ConfigContext from '@/contexts/ConfigContext';
import { CongressType } from '@/types/CongressType';
import { CongressItem } from './components/CongressItem';
import { CarouselSkeleton } from './components/CarouselSkeleton';
import { EmptyState } from './components/EmptyState';
import { useCongressData } from './hooks/useCongressData';
import { useAccelerometer } from './hooks/useAccelerometer';
import { useCarouselNavigation } from './hooks/useCarouselNavigation';
import { getCongressImageUrl } from './utils/imageHelpers';
import { InfoCongressCarouselProps } from './types';
import { styles } from './styles';
import { CAROUSEL_CONFIG, COLORS, SCREEN_DIMENSIONS } from './constants';

// Isolated carousel item component to prevent key prop warnings
const CarouselRenderItem = memo(({ data, animatedStyle, apiUrl }: any) => {
  if (!data?.item) return null;

  const imageUrl = getCongressImageUrl(data.item, apiUrl);

  return (
    <CongressItem
      item={data.item}
      animatedStyle={animatedStyle}
      imageUrl={imageUrl}
    />
  );
});

const InfoCongressCarousel: React.FC<InfoCongressCarouselProps> = ({
  refreshing = false,
  onRefresh
}) => {
  const { url_api } = useContext(ConfigContext);
  const { congress, isLoading, loadCongress } = useCongressData();
  const { activeIndex, setActiveIndex, carouselRef } = useCarouselNavigation(congress.length);
  const { animatedStyle: accelerometerStyle } = useAccelerometer(!isLoading);

  // Load data on mount
  useEffect(() => {
    loadCongress();
  }, [loadCongress]);

  // Handle refresh
  useEffect(() => {
    if (refreshing && onRefresh) {
      loadCongress().then(() => {
        onRefresh();
      });
    }
  }, [refreshing, loadCongress, onRefresh]);

  // Render carousel item - create new object to avoid prop contamination
  const renderCarouselItem = useCallback(({ item, index }: any) => {
    // Return a wrapper div that creates a new React element tree
    return (
      <View style={{ flex: 1 }}>
        <CarouselRenderItem
          data={{ item, index }}
          animatedStyle={accelerometerStyle}
          apiUrl={url_api}
        />
      </View>
    );
  }, [accelerometerStyle, url_api]);

  // Handle snap to item
  const handleSnapToItem = useCallback((index: number) => {
    setActiveIndex(index);
  }, [setActiveIndex]);

  // Show skeleton while loading
  if (isLoading && !refreshing) {
    return <CarouselSkeleton />;
  }

  // Show empty state if no data
  if (!congress.length) {
    return <EmptyState />;
  }

  return (
    <View style={styles.container}>
      <Carousel<CongressType>
        ref={carouselRef}
        data={congress}
        renderItem={renderCarouselItem}
        sliderWidth={SCREEN_DIMENSIONS.width}
        itemWidth={SCREEN_DIMENSIONS.width}
        firstItem={activeIndex}
        onSnapToItem={handleSnapToItem}
        inactiveSlideOpacity={CAROUSEL_CONFIG.INACTIVE_SLIDE_OPACITY}
        inactiveSlideScale={CAROUSEL_CONFIG.INACTIVE_SLIDE_SCALE}
        loop={CAROUSEL_CONFIG.ENABLE_LOOP}
        autoplay={CAROUSEL_CONFIG.ENABLE_AUTOPLAY}
        lockScrollWhileSnapping={CAROUSEL_CONFIG.LOCK_SCROLL_WHILE_SNAPPING}
        useScrollView={CAROUSEL_CONFIG.USE_SCROLL_VIEW}
        enableSnap={CAROUSEL_CONFIG.ENABLE_SNAP}
        removeClippedSubviews={Platform.OS === 'android'}
      />

      {/* Refresh indicator */}
      {refreshing && (
        <View style={styles.refreshIndicator}>
          <ActivityIndicator size="small" color={COLORS.TEXT_PRIMARY} />
        </View>
      )}
    </View>
  );
};

export default InfoCongressCarousel;
