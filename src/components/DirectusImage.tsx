
import React, { memo, useState } from 'react';
import { Image as ExpoImage } from 'expo-image';
import { StyleProp, ImageStyle, View } from 'react-native';
import { Skeleton } from '@/components/ui/skeleton';
import {cn} from "@gluestack-ui/nativewind-utils/cn";

const apiUrl = process.env.EXPO_PUBLIC_API_URL;


interface DirectusImageProps {
    assetId: string;
    width: number | string;
    height: number | string;
    resizeMode?: 'cover' | 'contain' | 'stretch' | 'center';
    borderRadius?: number;
    style?: StyleProp<ImageStyle>;
    className?: string;
    quality?: number;
    blurhash?: boolean;
    cachePolicy?: 'memory' | 'disk' | 'memory-disk' | 'memory-disk-web';
    placeholder?: React.ReactNode;
    fallback?: React.ReactNode;
}

// Helper para construir URLs do Directus com transformações
const buildDirectusImageUrl = (
    assetId: string,
    width: number | string,
    height: number | string,
    quality: number = 80
): string => {
    if (!assetId) return '';

    // Converter strings para números para largura e altura, se aplicável
    const numWidth = typeof width === 'string' ? parseInt(width, 10) : width;
    const numHeight = typeof height === 'string' ? parseInt(height, 10) : height;

    // Base URL para assets no Directus
    let url = `${apiUrl}/assets/${assetId}`;

    // Parâmetros de transformação
    const params: Record<string, string> = {};

    // Adicionar dimensões, se fornecidas e válidas
    if (!isNaN(numWidth) && numWidth > 0) {
        params.width = numWidth.toString();
    }

    if (!isNaN(numHeight) && numHeight > 0) {
        params.height = numHeight.toString();
    }

    // Adicionar qualidade da imagem
    params.quality = quality.toString();

    // Fit (cover é o padrão do Directus)
    params.fit = 'cover';

    // Construir a URL com parâmetros
    if (Object.keys(params).length > 0) {
        const queryString = Object.entries(params)
            .map(([key, value]) => `${key}=${encodeURIComponent(value)}`)
            .join('&');

        url = `${url}?${queryString}`;
    }

    return url;
};

// Componente principal memoizado para evitar re-renders desnecessários
const DirectusImage = memo(({
                                assetId,
                                width,
                                height,
                                resizeMode = 'cover',
                                borderRadius = 0,
                                style,
                                className,
                                quality = 80,
                                blurhash = true,
                                cachePolicy = 'memory-disk',
                                placeholder,
                                fallback
                            }: DirectusImageProps) => {
    const [isLoading, setIsLoading] = useState(true);
    const [hasError, setHasError] = useState(false);

    // Determinar dimensões numéricas para o placeholder
    const numWidth = typeof width === 'string' ? parseInt(width, 10) : width;
    const numHeight = typeof height === 'string' ? parseInt(height, 10) : height;

    // Gerar URL da imagem com transformações
    const imageUrl = buildDirectusImageUrl(assetId, width, height, quality);

    // Definir a política de cache da imagem
    const cacheKey = `directus-${assetId}-${width}-${height}-${quality}`;

    const onLoadStart = () => setIsLoading(true);
    const onLoadEnd = () => setIsLoading(false);
    const onError = () => {
        setIsLoading(false);
        setHasError(true);
    };

    // Se não há ID de asset ou URL, mostrar fallback
    if (!assetId || !imageUrl) {
        return (
            <View
                className="relative overflow-hidden"
                style={{
                    width: numWidth,
                    height: numHeight,
                    borderRadius
                }}
            >
                {fallback || (
                    <Skeleton
                        width={numWidth || 100}
                        height={numHeight || 100}
                        borderRadius={borderRadius}
                    />
                )}
            </View>
        );
    }

    return (
        <View
            className="relative overflow-hidden"
            style={{
                width: numWidth,
                height: numHeight,
                borderRadius
            }}
        >
            {/* Mostrar placeholder ou skeleton durante o carregamento */}
            {isLoading && (
                <View
                    className="absolute inset-0 justify-center items-center bg-black/10"
                    style={{ borderRadius }}
                >
                    {placeholder || (
                        <Skeleton
                            width={numWidth || 100}
                            height={numHeight || 100}
                            borderRadius={borderRadius}
                        />
                    )}
                </View>
            )}

            {/* Mostrar fallback em caso de erro */}
            {hasError && !isLoading && (
                <View
                    className="absolute inset-0 justify-center items-center"
                    style={{ borderRadius }}
                >
                    {fallback || (
                        <View
                            className="w-full h-full bg-black/10"
                            style={{ borderRadius }}
                        />
                    )}
                </View>
            )}

            {/* A imagem principal */}
            <ExpoImage
                source={{ uri: imageUrl }}
                className={cn("flex-1", className)}
                style={[
                    {
                        width: numWidth,
                        height: numHeight,
                        borderRadius
                    },
                    style
                ]}
                contentFit={resizeMode}
                transition={300}
                cachePolicy={cachePolicy}
                recyclingKey={cacheKey}
                onLoadStart={onLoadStart}
                onLoad={onLoadEnd}
                onError={onError}
                placeholder={blurhash ? { uri: `${apiUrl}/assets/${assetId}?width=20&quality=10` } : undefined}
            />
        </View>
    );
});

export default DirectusImage;
