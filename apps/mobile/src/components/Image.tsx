import React, { memo, useContext, useMemo } from 'react';
import { ViewStyle, ImageStyle, StyleProp } from 'react-native';
import DirectusImage from './DirectusImage';
import ConfigContext from '../contexts/ConfigContext';
import { useDirectusImage } from '@/hooks/useDirectusImage';

interface ImageProps {
  /** Asset ID no Directus */
  assetId?: string;
  /** Largura da imagem */
  width?: string | number;
  /** Altura da imagem */
  height?: string | number;
  /** Raio da borda */
  borderRadius?: number;
  /** Classes CSS customizadas */
  className?: string;
  /** Estilos customizados */
  style?: StyleProp<ImageStyle> | StyleProp<ViewStyle>;
  /** Modo de redimensionamento */
  resizeMode?: 'cover' | 'contain' | 'fill';
  /** Qualidade da imagem */
  quality?: number;
  /** Alt text para acessibilidade */
  alt?: string;
  /** Callback quando carrega */
  onLoad?: () => void;
  /** Callback quando há erro */
  onError?: (error: any) => void;
}

/**
 * Componente Image refatorado para usar DirectusImage
 * Mantém compatibilidade com a API anterior enquanto usa a nova implementação
 * Inclui fallback para avatar padrão via ConfigContext
 */
export const Image = memo<ImageProps>(({
  assetId,
  width = '100%',
  height = '100%',
  borderRadius = 0,
  className,
  style,
  resizeMode = 'cover',
  quality = 80,
  alt,
  onLoad,
  onError
}) => {
  const config = useContext(ConfigContext);
  
  // Determinar o asset ID final (usar padrão se não fornecido)
  const finalAssetId = useMemo(() => {
    if (assetId) return assetId;
    return config?.avatar_default || '';
  }, [assetId, config?.avatar_default]);

  // Usar hook para validação
  const { isValidAssetId } = useDirectusImage(finalAssetId);

  // Se não há asset ID válido, não renderizar
  if (!finalAssetId || !isValidAssetId) {
    return null;
  }

  return (
    <DirectusImage
      assetId={finalAssetId}
      width={width}
      height={height}
      borderRadius={borderRadius}
      className={className}
      style={style as any}
      resizeMode={resizeMode}
      quality={quality}
      accessibilityLabel={alt}
      onLoad={onLoad}
      onError={onError}
    />
  );
});

Image.displayName = 'Image';

// Manter export padrão para compatibilidade
export default Image;