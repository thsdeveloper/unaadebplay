import React, { memo, useMemo } from 'react';
import { View, ViewStyle } from 'react-native';
import { Text } from '@/components/ui/text';
import DirectusImage from '../DirectusImage';
import { useDirectusAvatar } from '@/hooks/useDirectusImage';
import { cn } from '@gluestack-ui/nativewind-utils/cn';

export interface DirectusAvatarProps {
  /** Asset ID do avatar no Directus */
  assetId?: string;
  /** Tamanho do avatar (width e height iguais) */
  size?: number | 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  /** Nome para fallback quando não há imagem */
  name?: string;
  /** Classes CSS customizadas */
  className?: string;
  /** Estilos customizados */
  style?: ViewStyle;
  /** Mostrar badge de status online */
  isOnline?: boolean;
  /** Callback quando a imagem carrega */
  onLoad?: () => void;
  /** Callback quando há erro no carregamento */
  onError?: (error: any) => void;
  /** ID para testes */
  testID?: string;
}

/**
 * Componente especializado para exibir avatares do Directus
 * Segue o princípio Single Responsibility - apenas para avatares
 */
export const DirectusAvatar = memo<DirectusAvatarProps>(({
  assetId,
  size = 'md',
  name = '',
  className,
  style,
  isOnline,
  onLoad,
  onError,
  testID
}) => {
  // Mapear tamanhos predefinidos para números
  const numericSize = useMemo(() => {
    if (typeof size === 'number') return size;
    
    const sizeMap = {
      'xs': 24,
      'sm': 32,
      'md': 48,
      'lg': 64,
      'xl': 80,
      '2xl': 96
    };
    
    return sizeMap[size] || 48;
  }, [size]);

  // Usar hook especializado para avatares
  const { imageUrl, isValidAssetId } = useDirectusAvatar(assetId, numericSize);

  // Gerar iniciais do nome para fallback
  const initials = useMemo(() => {
    if (!name) return '?';
    
    const words = name.trim().split(' ');
    if (words.length === 1) {
      return words[0].charAt(0).toUpperCase();
    }
    
    return (words[0].charAt(0) + words[words.length - 1].charAt(0)).toUpperCase();
  }, [name]);

  // Estilos do container
  const containerStyle: ViewStyle = useMemo(() => ({
    width: numericSize,
    height: numericSize,
    borderRadius: numericSize / 2,
    position: 'relative',
    overflow: 'hidden',
    backgroundColor: '#E5E7EB', // bg-gray-200
    ...style
  }), [numericSize, style]);

  // Fallback quando não há imagem válida
  const renderFallback = () => (
    <View 
      className={cn(
        "w-full h-full items-center justify-center bg-gray-300 dark:bg-gray-600",
        className
      )}
      style={containerStyle}
      testID={testID}
    >
      <Text 
        className="text-gray-600 dark:text-gray-300 font-medium"
        style={{ fontSize: numericSize * 0.4 }}
      >
        {initials}
      </Text>
      {isOnline !== undefined && (
        <View
          className={cn(
            "absolute bottom-0 right-0 rounded-full border-2 border-white dark:border-gray-800",
            isOnline ? "bg-green-500" : "bg-gray-400"
          )}
          style={{
            width: numericSize * 0.25,
            height: numericSize * 0.25,
          }}
        />
      )}
    </View>
  );

  // Se não há asset ID válido, mostrar fallback
  if (!assetId || !isValidAssetId) {
    return renderFallback();
  }

  return (
    <View style={containerStyle} testID={testID}>
      <DirectusImage
        assetId={assetId}
        width={numericSize}
        height={numericSize}
        className={cn("rounded-full", className)}
        quality={85}
        resizeMode="cover"
        onLoad={onLoad}
        onError={onError}
        fallback={
          <View className="w-full h-full items-center justify-center bg-gray-300 dark:bg-gray-600">
            <Text 
              className="text-gray-600 dark:text-gray-300 font-medium"
              style={{ fontSize: numericSize * 0.4 }}
            >
              {initials}
            </Text>
          </View>
        }
      />
      
      {/* Badge de status online */}
      {isOnline !== undefined && (
        <View
          className={cn(
            "absolute bottom-0 right-0 rounded-full border-2 border-white dark:border-gray-800",
            isOnline ? "bg-green-500" : "bg-gray-400"
          )}
          style={{
            width: numericSize * 0.25,
            height: numericSize * 0.25,
          }}
        />
      )}
    </View>
  );
});

DirectusAvatar.displayName = 'DirectusAvatar';