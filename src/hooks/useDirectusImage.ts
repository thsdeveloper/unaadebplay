import { useMemo, useContext } from 'react';
import ConfigContext from '@/contexts/ConfigContext';

export interface UseDirectusImageOptions {
  width?: number | string;
  height?: number | string;
  quality?: number;
  fit?: 'cover' | 'contain' | 'fill';
  format?: 'webp' | 'jpg' | 'png';
}

export interface UseDirectusImageReturn {
  imageUrl: string | null;
  isValidAssetId: boolean;
  buildUrl: (assetId: string, options?: UseDirectusImageOptions) => string | null;
}

/**
 * Hook personalizado para gerenciar URLs de imagens do Directus
 * Fornece uma interface consistente para construir URLs de assets
 */
export const useDirectusImage = (
  assetId?: string,
  options: UseDirectusImageOptions = {}
): UseDirectusImageReturn => {
  const config = useContext(ConfigContext);
  
  const apiUrl = useMemo(() => {
    return config?.url_api || process.env.EXPO_PUBLIC_API_URL || 'https://unaadebplay-api.up.railway.app';
  }, [config?.url_api]);

  const isValidAssetId = useMemo(() => {
    if (!assetId || assetId.length === 0) return false;
    
    // Check UUID pattern (loose check)
    const uuidPattern = /^[0-9a-f-]{36}$/i;
    const isUuid = uuidPattern.test(assetId);
    
    // Also accept other formats that don't contain spaces
    const isValidFormat = !assetId.includes(' ') && assetId.length > 5;
    
    return isUuid || isValidFormat;
  }, [assetId]);

  const buildUrl = useMemo(() => {
    return (targetAssetId: string, targetOptions: UseDirectusImageOptions = {}) => {
      if (!targetAssetId || !apiUrl) return null;
      
      const params = new URLSearchParams();
      
      // Merge options with defaults
      const finalOptions = { ...options, ...targetOptions };
      
      if (finalOptions.width) {
        params.append('width', finalOptions.width.toString());
      }
      
      if (finalOptions.height) {
        params.append('height', finalOptions.height.toString());
      }
      
      if (finalOptions.quality) {
        params.append('quality', finalOptions.quality.toString());
      }
      
      if (finalOptions.fit) {
        params.append('fit', finalOptions.fit);
      }
      
      if (finalOptions.format) {
        params.append('format', finalOptions.format);
      }
      
      const queryString = params.toString();
      return `${apiUrl}/assets/${targetAssetId}${queryString ? `?${queryString}` : ''}`;
    };
  }, [apiUrl, options]);

  const imageUrl = useMemo(() => {
    if (!assetId || !isValidAssetId) return null;
    return buildUrl(assetId);
  }, [assetId, isValidAssetId, buildUrl]);

  return {
    imageUrl,
    isValidAssetId,
    buildUrl
  };
};

/**
 * Hook especializado para avatares
 */
export const useDirectusAvatar = (assetId?: string, size: number = 64) => {
  return useDirectusImage(assetId, {
    width: size,
    height: size,
    quality: 85,
    fit: 'cover',
    format: 'webp'
  });
};

/**
 * Hook especializado para banners e imagens grandes
 */
export const useDirectusBanner = (
  assetId?: string, 
  options: { width?: number; height?: number } = {}
) => {
  return useDirectusImage(assetId, {
    ...options,
    quality: 90,
    fit: 'cover',
    format: 'webp'
  });
};

/**
 * Hook especializado para thumbnails
 */
export const useDirectusThumbnail = (assetId?: string, size: number = 150) => {
  return useDirectusImage(assetId, {
    width: size,
    height: size,
    quality: 75,
    fit: 'cover',
    format: 'webp'
  });
};