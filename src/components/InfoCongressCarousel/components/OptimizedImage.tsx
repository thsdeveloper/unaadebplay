import React, { memo, useState, useCallback, useMemo } from 'react';
import { View, StyleSheet } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';
import { Feather } from '@expo/vector-icons';
import { Text } from '@/components/ui/text';
import { Skeleton } from '@/components/ui/skeleton';
import { OptimizedImageProps } from '../types';
import { styles } from '../styles';
import { CAROUSEL_CONFIG, COLORS, SIZES } from '../constants';

export const OptimizedImage = memo<OptimizedImageProps>(({
  uri,
  style,
  animatedStyle,
  onLoadEnd,
  onError
}) => {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const opacity = useSharedValue(0);

  const fadeStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }));
  
  // Combine styles
  const imageStyle = animatedStyle 
    ? [style, fadeStyle, animatedStyle]
    : [style, fadeStyle];

  const handleLoadEnd = useCallback(() => {
    setIsLoading(false);
    opacity.value = withSpring(1, CAROUSEL_CONFIG.FADE_CONFIG);
    onLoadEnd?.();
  }, [onLoadEnd, opacity]);

  const handleError = useCallback(() => {
    console.log('Image failed to load:', uri);
    setHasError(true);
    setIsLoading(false);
    onError?.();
  }, [onError, uri]);

  if (hasError) {
    return (
      <View style={[style, styles.errorContainer]}>
        <Feather name="image" size={SIZES.ICON_LARGE} color={COLORS.TEXT_MUTED} />
        <Text style={styles.errorText}>Imagem não disponível</Text>
      </View>
    );
  }

  return (
    <>
      {isLoading && (
        <View style={[StyleSheet.absoluteFillObject, styles.imageLoader]}>
          <Skeleton className="w-full h-full" />
        </View>
      )}
      <Animated.Image
        source={{ uri }}
        style={imageStyle}
        resizeMode="cover"
        onLoadEnd={handleLoadEnd}
        onError={handleError}
      />
    </>
  );
});

OptimizedImage.displayName = 'OptimizedImage';