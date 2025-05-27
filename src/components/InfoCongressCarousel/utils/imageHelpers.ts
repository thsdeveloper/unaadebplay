import { CongressType } from '@/types/CongressType';
import { CAROUSEL_CONFIG, SCREEN_DIMENSIONS } from '../constants';

/**
 * Extracts the poster ID from a congress item
 * Handles both string IDs and object relationships
 */
export const extractPosterId = (poster: CongressType['poster']): string | null => {
  if (!poster) return null;
  
  if (typeof poster === 'string') {
    return poster;
  }
  
  if (typeof poster === 'object' && 'id' in poster && poster.id) {
    return poster.id;
  }
  
  return null;
};

/**
 * Generates the full image URL for a poster
 */
export const generateImageUrl = (
  posterId: string | null,
  apiUrl: string,
  width: number = SCREEN_DIMENSIONS.width,
  quality: number = CAROUSEL_CONFIG.IMAGE_QUALITY
): string => {
  if (!posterId || !apiUrl) return '';
  
  return `${apiUrl}/assets/${posterId}?fit=cover&width=${Math.round(width)}&quality=${quality}`;
};

/**
 * Gets the image URL from a congress item
 */
export const getCongressImageUrl = (
  item: CongressType,
  apiUrl: string
): string => {
  const posterId = extractPosterId(item.poster);
  return generateImageUrl(posterId, apiUrl);
};

/**
 * Preloads an image URL
 */
export const preloadImage = async (url: string): Promise<void> => {
  if (!url) return;
  
  try {
    const { Image } = await import('react-native');
    await Image.prefetch(url);
  } catch (error) {
    console.warn('Failed to preload image:', url, error);
  }
};

/**
 * Preloads multiple images
 */
export const preloadImages = async (urls: string[]): Promise<void> => {
  const validUrls = urls.filter(Boolean);
  await Promise.all(validUrls.map(preloadImage));
};