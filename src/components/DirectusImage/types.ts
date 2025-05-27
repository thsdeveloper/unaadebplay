import { StyleProp, ImageStyle, ViewStyle } from 'react-native';

// Tipos base exportados para uso nos componentes especializados
export type DirectusResizeMode = 'cover' | 'contain' | 'fill' | 'scale-down';
export type DirectusCachePolicy = 'memory' | 'disk' | 'memory-disk';
export type DirectusPriority = 'low' | 'normal' | 'high';

// Interface base com tipos corretos
export interface DirectusImageBaseProps {
    assetId: string;
    width?: number | string;
    height?: number | string;
    resizeMode?: DirectusResizeMode;
    borderRadius?: number;
    style?: StyleProp<ImageStyle>;
    className?: string;
    quality?: number;
    blurhash?: boolean;
    cachePolicy?: DirectusCachePolicy;
    placeholder?: React.ReactNode;
    fallback?: React.ReactNode;
    onLoad?: () => void;
    onError?: (error: any) => void;
    priority?: DirectusPriority;
    accessibilityLabel?: string;
    testID?: string;
}

// Tipo auxiliar para style que aceita ViewStyle em componentes especializados
export type DirectusStyleProp = StyleProp<ImageStyle> | StyleProp<ViewStyle>;