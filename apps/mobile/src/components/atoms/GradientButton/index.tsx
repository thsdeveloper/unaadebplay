import React, { useRef } from 'react';
import { Pressable, StyleSheet, ViewStyle, Animated } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { HStack } from '@/components/ui/hstack';
import { Text } from '@/components/ui/text';
import { Spinner } from '@/components/ui/spinner';
import * as Haptics from 'expo-haptics';

const BRAND = '#E51C44';
const BRAND_DARK = '#B0143A';

interface GradientButtonProps {
  label: string;
  onPress: () => void;
  loading?: boolean;
  disabled?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  style?: ViewStyle;
  haptic?: boolean;
}

/** CTA primário das telas de auth: gradiente de marca + glow. */
export const GradientButton: React.FC<GradientButtonProps> = ({
  label, onPress, loading, disabled, leftIcon, rightIcon, style, haptic = true,
}) => {
  const isDisabled = disabled || loading;
  const scale = useRef(new Animated.Value(1)).current;

  const springTo = (toValue: number, friction: number) =>
    Animated.spring(scale, { toValue, useNativeDriver: true, friction, tension: 180 }).start();

  const handlePress = () => {
    if (isDisabled) return;
    if (haptic) Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    onPress();
  };

  return (
    <Animated.View style={[styles.shadow, { transform: [{ scale }] }, style]}>
      <Pressable
        onPress={handlePress}
        onPressIn={() => !isDisabled && springTo(0.95, 8)}
        onPressOut={() => springTo(1, 5)}
        disabled={isDisabled}
        style={({ pressed }) => ({ opacity: isDisabled ? 0.55 : pressed ? 0.94 : 1 })}
      >
        <LinearGradient colors={[BRAND, BRAND_DARK]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.cta}>
          {loading ? (
            <Spinner color="#fff" />
          ) : (
            <HStack className="items-center" space="sm">
              {leftIcon}
              <Text style={styles.text}>{label}</Text>
              {rightIcon}
            </HStack>
          )}
        </LinearGradient>
      </Pressable>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  cta: { height: 58, borderRadius: 18, alignItems: 'center', justifyContent: 'center' },
  text: { color: '#fff', fontSize: 17, fontWeight: '700' },
  shadow: {
    shadowColor: BRAND,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.45,
    shadowRadius: 18,
    elevation: 10,
  },
});

export default GradientButton;
