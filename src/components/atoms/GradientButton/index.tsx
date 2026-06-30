import React from 'react';
import { Pressable, StyleSheet, ViewStyle } from 'react-native';
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

  const handlePress = () => {
    if (isDisabled) return;
    if (haptic) Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    onPress();
  };

  return (
    <Pressable
      onPress={handlePress}
      disabled={isDisabled}
      style={({ pressed }) => [{ opacity: isDisabled ? 0.55 : pressed ? 0.92 : 1 }, styles.shadow, style]}
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
