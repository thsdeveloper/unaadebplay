import React, { memo, useState, useCallback } from 'react';
import { View, TouchableOpacity } from 'react-native';
import { Link } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Feather } from '@expo/vector-icons';
import Animated from 'react-native-reanimated';
import { Text } from '@/components/ui/text';
import { Heading } from '@/components/ui/heading';
import { OptimizedImage } from './OptimizedImage';
import { CongressItemProps } from '../types';
import { styles } from '../styles';
import { COLORS, SIZES } from '../constants';

export const CongressItem = memo<CongressItemProps>(({
  item,
  animatedStyle,
  imageUrl,
  onPress
}) => {
  const [imageLoaded, setImageLoaded] = useState(false);

  const handleImageLoad = useCallback(() => {
    setImageLoaded(true);
  }, []);

  const handlePress = useCallback(() => {
    onPress?.();
  }, [onPress]);

  return (
    <View style={styles.itemContainer}>
      {/* Poster container without animation at this level */}
      <View style={styles.posterContainer}>
        <OptimizedImage
          uri={imageUrl}
          style={styles.posterImage}
          animatedStyle={animatedStyle}
          onLoadEnd={handleImageLoad}
        />

        {/* Overlay gradients - outside animated view */}
        <View style={styles.overlayContainer}>
          <View style={styles.generalOverlay} />
          
          <LinearGradient
            colors={COLORS.GRADIENT_TOP}
            style={styles.topGradient}
          />
          
          <LinearGradient
            colors={COLORS.GRADIENT_BOTTOM}
            style={styles.bottomGradient}
          />
        </View>
      </View>

      {/* Content overlay */}
      <View style={styles.contentContainer}>
        <Heading 
          size={SIZES.TEXT_HEADING} 
          className="text-white font-extrabold text-center"
        >
          {item.name}
        </Heading>

        {/* Tags */}
        <View style={styles.tagsContainer}>
          <Text style={styles.tagText}>{item.theme || 'Tema'}</Text>
          <View style={styles.tagDot} />
          <Text style={styles.tagText}>Congresso</Text>
          <View style={styles.tagDot} />
          <Text style={styles.tagText}>Adoração</Text>
        </View>

        {/* Action buttons */}
        <View style={styles.buttonsContainer}>
          {/* Confirm button */}
          <TouchableOpacity 
            style={styles.sideButton}
            onPress={handlePress}
          >
            <Feather name="check" size={SIZES.ICON_MEDIUM} color={COLORS.TEXT_PRIMARY} />
            <Text style={styles.buttonSmallText}>Confirmar</Text>
          </TouchableOpacity>

          {/* Access button */}
          <Link href={`/(tabs)/(home)/(congresso)/${item.id}`} asChild>
            <TouchableOpacity style={styles.playButton}>
              <Feather name="play" size={SIZES.ICON_SMALL} color={COLORS.BUTTON_PRIMARY_TEXT} />
              <Text style={styles.playButtonText}>Acessar</Text>
            </TouchableOpacity>
          </Link>

          {/* Info button */}
          <TouchableOpacity style={styles.sideButton}>
            <Feather name="info" size={SIZES.ICON_MEDIUM} color={COLORS.TEXT_PRIMARY} />
            <Text style={styles.buttonSmallText}>Informações</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
});

CongressItem.displayName = 'CongressItem';