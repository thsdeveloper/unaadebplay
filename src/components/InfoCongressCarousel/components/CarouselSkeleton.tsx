import React, { memo } from 'react';
import { View } from 'react-native';
import { Skeleton } from '@/components/ui/skeleton';
import { HStack } from '@/components/ui/hstack';
import { CarouselSkeletonProps } from '../types';
import { styles } from '../styles';

export const CarouselSkeleton = memo<CarouselSkeletonProps>(() => {
  return (
    <View style={styles.skeletonContainer}>
      <Skeleton className="w-full h-full absolute" />

      <View style={styles.skeletonContent}>
        {/* Title skeleton */}
        <Skeleton className="h-10 w-64 rounded-lg" />

        {/* Tags skeleton */}
        <HStack className="gap-2 mt-3">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton
              key={i}
              className="h-5 w-16 rounded"
            />
          ))}
        </HStack>

        {/* Buttons skeleton */}
        <HStack className="gap-4 mt-5">
          <Skeleton className="h-10 w-20 rounded-full" />
          <Skeleton className="h-10 w-32 rounded" />
          <Skeleton className="h-10 w-20 rounded-full" />
        </HStack>
      </View>
    </View>
  );
});

CarouselSkeleton.displayName = 'CarouselSkeleton';