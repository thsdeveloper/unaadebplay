import React, { memo, useState, useCallback, useMemo, useEffect } from 'react';
import { Image as ExpoImage, ImageSource } from 'expo-image';
import type { ImageContentFit } from 'expo-image';
import { StyleProp, ImageStyle, View, ViewStyle, Platform } from 'react-native';
import { Skeleton } from '@/components/ui/skeleton';
import { Text } from '@/components/ui/text';
import { cn } from "@gluestack-ui/nativewind-utils/cn";
import NetInfo from '@react-native-community/netinfo';

// Constants
const API_URL = process.env.EXPO_PUBLIC_API_URL || 'https://unaadebplay-api.up.railway.app';
const DEFAULT_QUALITY = 80;
const DEFAULT_CACHE_POLICY = 'memory-disk' as const;
const DEFAULT_RESIZE_MODE = 'cover' as const;
const BLURHASH_QUALITY = 10;
const BLURHASH_WIDTH = 20;
const IMAGE_TRANSITION_DURATION = 300;

// Import types
import type { 
    DirectusImageBaseProps as DirectusImageProps,
    DirectusResizeMode as ResizeMode,
    DirectusCachePolicy as CachePolicy
} from './DirectusImage/types';

// Re-export types for external use
export type { DirectusImageProps, ResizeMode, CachePolicy };

interface ImageDimensions {
    width?: number;
    height?: number;
}

// Utility functions
const parseNumberValue = (value: string | number | undefined): number | undefined => {
    if (value === undefined) return undefined;
    if (typeof value === 'number') return value;
    const parsed = parseInt(value, 10);
    return isNaN(parsed) ? undefined : parsed;
};

const buildQueryString = (params: Record<string, string>): string => {
    const entries = Object.entries(params).filter(([_, value]) => value);
    if (entries.length === 0) return '';
    return '?' + entries.map(([key, value]) => `${key}=${encodeURIComponent(value)}`).join('&');
};

// Image URL builder service
class DirectusImageService {
    private static instance: DirectusImageService;
    private networkConnected: boolean = true;

    private constructor() {
        this.initNetworkListener();
    }

    static getInstance(): DirectusImageService {
        if (!DirectusImageService.instance) {
            DirectusImageService.instance = new DirectusImageService();
        }
        return DirectusImageService.instance;
    }

    private initNetworkListener(): void {
        NetInfo.addEventListener(state => {
            this.networkConnected = state.isConnected ?? true;
        });
    }

    buildImageUrl(
        assetId: string,
        options: {
            width?: number;
            height?: number;
            quality?: number;
            fit?: string;
            format?: string;
        } = {}
    ): string {
        if (!assetId || !this.isValidAssetId(assetId)) {
            console.warn('[DirectusImage] Invalid asset ID:', assetId);
            return '';
        }

        const baseUrl = `${API_URL}/assets/${assetId}`;
        const params: Record<string, string> = {};

        if (options.width && options.width > 0) {
            params.width = options.width.toString();
        }

        if (options.height && options.height > 0) {
            params.height = options.height.toString();
        }

        if (options.quality) {
            params.quality = options.quality.toString();
        }

        if (options.fit) {
            params.fit = options.fit;
        }

        // Add format for better performance
        if (Platform.OS === 'web') {
            params.format = 'webp';
        }

        return baseUrl + buildQueryString(params);
    }

    buildPlaceholderUrl(assetId: string): string {
        return this.buildImageUrl(assetId, {
            width: BLURHASH_WIDTH,
            quality: BLURHASH_QUALITY,
            format: 'jpg'
        });
    }

    private isValidAssetId(assetId: string): boolean {
        // Basic validation for UUID format or other expected formats
        if (!assetId || assetId.length === 0) return false;

        // Check if it's a valid UUID pattern (loose check)
        const uuidPattern = /^[0-9a-f-]{36}$/i;
        const isUuid = uuidPattern.test(assetId);

        // Also accept other formats that don't contain spaces
        const isValidFormat = !assetId.includes(' ') && assetId.length > 5;

        return isUuid || isValidFormat;
    }

    get isNetworkAvailable(): boolean {
        return this.networkConnected;
    }
}

// Loading state component
const LoadingState = memo(({ placeholder, dimensions, borderRadius }: {
    placeholder?: React.ReactNode;
    dimensions: ImageDimensions;
    borderRadius?: number;
}) => (
    <View
        className="absolute inset-0 justify-center items-center bg-gray-100 dark:bg-gray-800"
        style={{ borderRadius }}
    >
        {placeholder || (
            <Skeleton
                className="w-full h-full bg-red-500"
                style={{ borderRadius }}
            />
        )}
    </View>
));

// Error state component
const ErrorState = memo(({ fallback, dimensions, borderRadius }: {
    fallback?: React.ReactNode;
    dimensions: ImageDimensions;
    borderRadius?: number;
}) => (
    <View
        className="absolute inset-0 justify-center items-center bg-gray-100 dark:bg-gray-800"
        style={{ borderRadius }}
    >
        {fallback || (
            <View className="items-center justify-center p-4 w-full h-full">
                <Skeleton
                    className="w-full h-full"
                    style={{ borderRadius }}
                />
            </View>
        )}
    </View>
));

// Main component
const DirectusImage = memo(({
    assetId,
    width,
    height,
    resizeMode = DEFAULT_RESIZE_MODE,
    borderRadius = 0,
    style,
    className,
    quality = DEFAULT_QUALITY,
    blurhash = true,
    cachePolicy = DEFAULT_CACHE_POLICY,
    placeholder,
    fallback,
    onLoad,
    onError,
    priority = 'normal',
    accessibilityLabel,
    testID
}: DirectusImageProps) => {
    const [loadingState, setLoadingState] = useState<'loading' | 'loaded' | 'error'>('loading');
    const imageService = useMemo(() => DirectusImageService.getInstance(), []);

    // Debug effect
    useEffect(() => {
        console.log('[DirectusImage] Component mounted/updated:', {
            assetId,
            loadingState,
            width,
            height,
            imageUrl
        });

        // Fallback timeout to prevent infinite loading
        const timeout = setTimeout(() => {
            if (loadingState === 'loading') {
                console.warn('[DirectusImage] Timeout reached, forcing loaded state');
                setLoadingState('loaded');
            }
        }, 5000);

        return () => clearTimeout(timeout);
    }, [assetId, loadingState, width, height]);

    // Parse dimensions
    const dimensions: ImageDimensions = useMemo(() => ({
        width: parseNumberValue(width),
        height: parseNumberValue(height)
    }), [width, height]);

    // Build image URLs
    const imageUrl = useMemo(
        () => {
            const url = imageService.buildImageUrl(assetId, {
                width: dimensions.width,
                height: dimensions.height,
                quality,
                fit: resizeMode
            });
            console.log('[DirectusImage] Built URL:', url, 'for assetId:', assetId);
            return url;
        },
        [assetId, dimensions.width, dimensions.height, quality, resizeMode, imageService]
    );

    const placeholderUrl = useMemo(
        () => blurhash ? imageService.buildPlaceholderUrl(assetId) : undefined,
        [assetId, blurhash, imageService]
    );

    // Cache key for recycling
    const cacheKey = useMemo(
        () => `directus-${assetId}-${dimensions.width}-${dimensions.height}-${quality}`,
        [assetId, dimensions.width, dimensions.height, quality]
    );

    // Event handlers
    const handleLoadStart = useCallback(() => {
        console.log('[DirectusImage] Load started for:', assetId);
        setLoadingState('loading');
    }, [assetId]);

    const handleLoadEnd = useCallback(() => {
        console.log('[DirectusImage] Load completed for:', assetId);
        setLoadingState('loaded');
        onLoad?.();
    }, [assetId, onLoad]);

    const handleError = useCallback((error: any) => {
        console.error('[DirectusImage] Failed to load image:', assetId, 'Error:', error);
        setLoadingState('error');
        onError?.(error);
    }, [assetId, onError]);

    // Container styles
    const containerStyle: ViewStyle[] = useMemo(() => [
        {
            borderRadius,
            ...(dimensions.width && { width: dimensions.width }),
            ...(dimensions.height && { height: dimensions.height })
        },
        style as ViewStyle
    ], [borderRadius, dimensions, style]);

    // Check for valid asset ID and network
    if (!assetId || !imageUrl) {
        return (
            <View
                className={cn("relative overflow-hidden bg-gray-100 dark:bg-gray-800", className)}
                style={containerStyle}
                testID={testID}
                accessible={true}
                accessibilityLabel={accessibilityLabel || "Empty image container"}
            >
                <ErrorState
                    fallback={fallback}
                    dimensions={dimensions}
                    borderRadius={borderRadius}
                />
            </View>
        );
    }

    // Check network availability
    if (!imageService.isNetworkAvailable) {
        return (
            <View
                className={cn("relative overflow-hidden", className)}
                style={containerStyle}
                testID={testID}
            >
                <ErrorState
                    fallback={fallback || <Text className="text-center text-gray-500">Sem conexão</Text>}
                    dimensions={dimensions}
                    borderRadius={borderRadius}
                />
            </View>
        );
    }

    // Image source configuration
    const imageSource: ImageSource = useMemo(() => ({
        uri: imageUrl,
        ...(Platform.OS === 'web' && {
            headers: {
                'Accept': 'image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8'
            }
        })
    }), [imageUrl]);

    const placeholderSource: ImageSource | undefined = useMemo(() =>
        placeholderUrl ? { uri: placeholderUrl } : undefined,
        [placeholderUrl]
    );

    return (
        <View
            className={cn("relative overflow-hidden bg-gray-100 dark:bg-gray-800", className)}
            style={containerStyle}
            testID={testID}
        >
            {/* Loading state */}
            {loadingState === 'loading' && (
                <LoadingState
                    placeholder={placeholder}
                    dimensions={dimensions}
                    borderRadius={borderRadius}
                />
            )}

            {/* Error state */}
            {loadingState === 'error' && (
                <ErrorState
                    fallback={fallback}
                    dimensions={dimensions}
                    borderRadius={borderRadius}
                />
            )}


            {/* Main image */}
            <ExpoImage
                source={imageSource}
                style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    width: '100%',
                    height: '100%',
                    borderRadius
                }}
                contentFit={resizeMode as ImageContentFit}
                transition={IMAGE_TRANSITION_DURATION}
                cachePolicy={cachePolicy}
                onLoadStart={handleLoadStart}
                onLoad={handleLoadEnd}
                onError={handleError}
                priority={priority}
            />
        </View>
    );
});

// Display name for debugging
DirectusImage.displayName = 'DirectusImage';
LoadingState.displayName = 'DirectusImage.LoadingState';
ErrorState.displayName = 'DirectusImage.ErrorState';

// Export
export default DirectusImage;
export { DirectusImage, DirectusImageService };
