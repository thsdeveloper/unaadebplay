import React, { memo } from 'react';
import { View } from 'react-native';
import DirectusImage from '../DirectusImage';
import { useDirectusThumbnail } from '@/hooks/useDirectusImage';
import type { DirectusResizeMode, DirectusPriority, DirectusStyleProp } from './types';

export interface DirectusThumbnailProps {
  /** Asset ID da imagem no Directus */
  assetId: string;
  /** Tamanho da thumbnail (width e height iguais) */
  size?: number;
  /** Classes CSS customizadas */
  className?: string;
  /** Estilos customizados */
  style?: DirectusStyleProp;
  /** Modo de redimensionamento */
  resizeMode?: DirectusResizeMode;
  /** Raio da borda */
  borderRadius?: number;
  /** Prioridade de carregamento (normalmente baixa para thumbnails) */
  priority?: DirectusPriority;
  /** Callback quando a imagem carrega */
  onLoad?: () => void;
  /** Callback quando há erro no carregamento */
  onError?: (error: any) => void;
  /** Callback quando a thumbnail é pressionada */
  onPress?: () => void;
  /** Label de acessibilidade */
  accessibilityLabel?: string;
  /** ID para testes */
  testID?: string;
}

/**
 * Componente especializado para thumbnails (miniaturas)
 * Otimizado para carregamento rápido e baixo uso de dados
 * Segue o princípio Single Responsibility - apenas para thumbnails
 */
export const DirectusThumbnail = memo<DirectusThumbnailProps>(({
  assetId,
  size = 150,
  className,
  style,
  resizeMode = 'cover',
  borderRadius = 8,
  priority = 'low',
  onLoad,
  onError,
  onPress,
  accessibilityLabel,
  testID
}) => {
  // Usar hook especializado para thumbnails
  const { isValidAssetId } = useDirectusThumbnail(assetId, size);

  // Se o asset ID não é válido, não renderizar nada
  if (!assetId || !isValidAssetId) {
    return null;
  }

  return (
    <DirectusImage
      assetId={assetId}
      width={size}
      height={size}
      className={className}
      style={style as any}
      resizeMode={resizeMode}
      borderRadius={borderRadius}
      quality={75} // Qualidade reduzida para thumbnails
      priority={priority}
      cachePolicy="memory-disk" // Cache agressivo para thumbnails
      onLoad={onLoad}
      onError={onError}
      accessibilityLabel={accessibilityLabel}
      testID={testID}
      // Placeholder simples para thumbnails
      placeholder={
        <View 
          className="w-full h-full bg-gray-200 dark:bg-gray-700"
          style={{ borderRadius }}
        />
      }
    />
  );
});

DirectusThumbnail.displayName = 'DirectusThumbnail';