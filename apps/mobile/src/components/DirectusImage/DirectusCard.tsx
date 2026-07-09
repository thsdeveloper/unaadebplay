import React, { memo, ReactNode } from 'react';
import { TouchableOpacity, View, ViewStyle } from 'react-native';
import DirectusImage from '../DirectusImage';
import { cn } from '@gluestack-ui/nativewind-utils/cn';
import type { DirectusResizeMode, DirectusPriority, DirectusStyleProp } from './types';

export interface DirectusCardProps {
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
  /** Conteúdo que aparece sobre a imagem */
  children?: ReactNode;
  /** Callback quando a imagem carrega */
  onLoad?: () => void;
  /** Callback quando há erro no carregamento */
  onError?: (error: any) => void;
  /** Callback quando o card é pressionado */
  onPress?: () => void;
  /** Se o card deve ser interativo */
  pressable?: boolean;
  /** Label de acessibilidade */
  accessibilityLabel?: string;
  /** ID para testes */
  testID?: string;
  /** Mostrar sombra */
  shadow?: boolean;
}

/**
 * Componente especializado para usar imagens em cards
 * Combina imagem com conteúdo sobreposto
 * Segue o princípio Open/Closed - extensível via children
 */
export const DirectusCard = memo<DirectusCardProps>(({
  assetId,
  width = '100%',
  height = 200,
  className,
  style,
  resizeMode = 'cover',
  borderRadius = 12,
  quality = 80,
  priority = 'normal',
  children,
  onLoad,
  onError,
  onPress,
  pressable = !!onPress,
  accessibilityLabel,
  testID,
  shadow = true
}) => {
  const cardContent = (
    <View
      className={cn(
        "relative overflow-hidden",
        shadow && "shadow-lg shadow-black/10 dark:shadow-black/20",
        className
      )}
      style={[
        {
          width: typeof width === 'string' ? width : width,
          height: typeof height === 'string' ? height : height,
          borderRadius,
        } as ViewStyle,
        style as ViewStyle
      ]}
      testID={testID}
    >
      <DirectusImage
        assetId={assetId}
        width="100%"
        height="100%"
        resizeMode={resizeMode}
        borderRadius={borderRadius}
        quality={quality}
        priority={priority}
        onLoad={onLoad}
        onError={onError}
        accessibilityLabel={accessibilityLabel}
        // Placeholder com gradiente para cards
        placeholder={
          <View 
            className="w-full h-full bg-gradient-to-br from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-800"
            style={{ borderRadius }}
          />
        }
      />
      
      {/* Renderizar children (conteúdo sobreposto) */}
      {children && (
        <View className="absolute inset-0 z-10">
          {children}
        </View>
      )}
    </View>
  );

  // Se pressable, envolver em TouchableOpacity
  if (pressable && onPress) {
    return (
      <TouchableOpacity
        onPress={onPress}
        activeOpacity={0.8}
        accessibilityLabel={accessibilityLabel}
        testID={testID ? `${testID}-pressable` : undefined}
      >
        {cardContent}
      </TouchableOpacity>
    );
  }

  return cardContent;
});

DirectusCard.displayName = 'DirectusCard';