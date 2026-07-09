import React, { memo, ReactNode } from 'react';
import { View } from 'react-native';
import DirectusImage from '../DirectusImage';
import { useDirectusBanner } from '@/hooks/useDirectusImage';
import type { DirectusResizeMode, DirectusPriority, DirectusStyleProp } from './types';

export interface DirectusBannerProps {
  /** Asset ID da imagem no Directus */
  assetId: string;
  /** Largura da imagem */
  width?: number | string;
  /** Altura da imagem */
  height?: number | string;
  /** Classes CSS customizadas */
  className?: string;
  /** Estilos customizados */
  style?: DirectusStyleProp;
  /** Modo de redimensionamento */
  resizeMode?: DirectusResizeMode;
  /** Raio da borda */
  borderRadius?: number;
  /** Qualidade da imagem (1-100) */
  quality?: number;
  /** Prioridade de carregamento */
  priority?: DirectusPriority;
  /** Overlay content que aparece sobre a imagem */
  overlay?: ReactNode;
  /** Callback quando a imagem carrega */
  onLoad?: () => void;
  /** Callback quando há erro no carregamento */
  onError?: (error: any) => void;
  /** Callback quando a imagem é pressionada */
  onPress?: () => void;
  /** Label de acessibilidade */
  accessibilityLabel?: string;
  /** ID para testes */
  testID?: string;
}

/**
 * Componente especializado para banners e imagens de destaque
 * Otimizado para imagens grandes com overlays
 * Segue o princípio Open/Closed - extensível via props
 */
export const DirectusBanner = memo<DirectusBannerProps>(({
  assetId,
  width = '100%',
  height = 200,
  className,
  style,
  resizeMode = 'cover',
  borderRadius = 0,
  quality = 90,
  priority = 'high',
  overlay,
  onLoad,
  onError,
  onPress,
  accessibilityLabel,
  testID
}) => {
  // Usar hook especializado para banners
  const { isValidAssetId } = useDirectusBanner(assetId, {
    width: typeof width === 'number' ? width : undefined,
    height: typeof height === 'number' ? height : undefined
  });

  // Se o asset ID não é válido, não renderizar nada
  if (!assetId || !isValidAssetId) {
    return null;
  }

  return (
    <View style={{ position: 'relative' }}>
      <DirectusImage
        assetId={assetId}
        width={width}
        height={height}
        className={className}
        style={style as any}
        resizeMode={resizeMode}
        borderRadius={borderRadius}
        quality={quality}
        priority={priority}
        onLoad={onLoad}
        onError={onError}
        accessibilityLabel={accessibilityLabel}
        testID={testID}
        // Placeholder otimizado para banners
        placeholder={
          <View className="w-full h-full bg-gray-200 dark:bg-gray-700" />
        }
      />
      {/* Renderizar overlay se fornecido */}
      {overlay && (
        <View style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }}>
          {overlay}
        </View>
      )}
    </View>
  );
});

DirectusBanner.displayName = 'DirectusBanner';