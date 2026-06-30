import { CongressType } from '@/types/CongressType';
import { CAROUSEL_CONFIG, SCREEN_DIMENSIONS } from '../constants';
import { getStorageUrl } from '@/services/storage';

/**
 * Extracts the poster ID from a congress item
 * Handles both string IDs and object relationships
 */
export const extractPosterId = (poster: CongressType['poster']): string | null => {
  if (!poster) return null;
  // poster é uma coluna de texto (path do Storage) no Supabase.
  if (typeof poster === 'string') return poster;
  // Compat: caso venha como objeto { id } de dados legados.
  const maybe = poster as any;
  return maybe?.id ?? null;
};

/**
 * Generates the full image URL for a poster
 */
export const generateImageUrl = (
  posterId: string | null,
  _apiUrl?: string,
  _width: number = SCREEN_DIMENSIONS.width,
  _quality: number = CAROUSEL_CONFIG.IMAGE_QUALITY
): string => {
  return getStorageUrl(posterId, 'images') ?? '';
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