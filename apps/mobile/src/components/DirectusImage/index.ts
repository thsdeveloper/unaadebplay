// Barrel export para todos os componentes relacionados ao DirectusImage
export { default as DirectusImage } from '../DirectusImage';
export { DirectusAvatar } from './DirectusAvatar';
export { DirectusBanner } from './DirectusBanner';
export { DirectusThumbnail } from './DirectusThumbnail';
export { DirectusCard } from './DirectusCard';

// Re-export types
export type { DirectusImageProps } from '../DirectusImage';
export type { 
  UseDirectusImageOptions, 
  UseDirectusImageReturn 
} from '@/hooks/useDirectusImage';
export type {
  DirectusResizeMode,
  DirectusCachePolicy,
  DirectusPriority,
  DirectusStyleProp,
  DirectusImageBaseProps
} from './types';