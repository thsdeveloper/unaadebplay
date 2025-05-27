import { CongressType } from '@/types/CongressType';
import { ViewStyle } from 'react-native';

export interface InfoCongressCarouselProps {
  refreshing?: boolean;
  onRefresh?: () => void;
}

export interface CongressItemProps {
  item: CongressType;
  animatedStyle: ViewStyle | ViewStyle[];
  imageUrl: string;
  onPress?: () => void;
}

export interface OptimizedImageProps {
  uri: string;
  style?: ViewStyle | ViewStyle[];
  animatedStyle?: any;
  onLoadEnd?: () => void;
  onError?: () => void;
}

export interface CarouselSkeletonProps {
  // No props needed, but interface kept for future extensibility
}

export interface EmptyStateProps {
  message?: string;
}

export interface UseCongressDataReturn {
  congress: CongressType[];
  isLoading: boolean;
  error: string | null;
  loadCongress: () => Promise<void>;
}

export interface UseAccelerometerReturn {
  animatedStyle: ViewStyle;
}

export interface UseCarouselNavigationReturn {
  activeIndex: number;
  setActiveIndex: (index: number) => void;
  carouselRef: React.RefObject<any>;
}

export interface ImageUrlParams {
  posterId: string | { id: string } | undefined;
  url_api: string;
  width?: number;
  quality?: number;
}