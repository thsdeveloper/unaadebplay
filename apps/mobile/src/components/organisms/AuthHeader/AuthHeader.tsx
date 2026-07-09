import React from 'react';
import { View, Dimensions } from 'react-native';
import Animated, { 
  useAnimatedStyle, 
  interpolate,
  SharedValue,
} from 'react-native-reanimated';
import { Logo } from '@/components/atoms/Logo';
import { Text } from '@/components/atoms/Text';

const { height } = Dimensions.get('window');

interface AuthHeaderProps {
  title: string;
  subtitle?: string;
  keyboardVisible?: boolean;
  fadeAnim?: SharedValue<number>;
  scaleAnim?: SharedValue<number>;
  shimmerAnim?: SharedValue<number>;
}

export const AuthHeader: React.FC<AuthHeaderProps> = React.memo(({
  title,
  subtitle,
  keyboardVisible = false,
  fadeAnim,
  scaleAnim,
  shimmerAnim,
}) => {
  const animatedContainerStyle = useAnimatedStyle(() => {
    if (!scaleAnim) return {};
    
    return {
      transform: [{ scale: scaleAnim.value }],
    };
  });

  const animatedTextStyle = useAnimatedStyle(() => {
    if (!shimmerAnim) return {};
    
    return {
      opacity: interpolate(shimmerAnim.value, [0, 1], [0.8, 1]),
    };
  });

  return (
    <Animated.View
      style={[{
        alignItems: 'center',
        marginBottom: keyboardVisible ? 20 : 40,
      }, animatedContainerStyle]}
    >
      <Logo
        size={100}
        animated={true}
        showBorder={true}
        containerStyle={{ marginBottom: 24 }}
      />

      <Animated.View style={animatedTextStyle}>
        <Text
          variant="heading"
          size="3xl"
          align="center"
          style={{
            marginBottom: 8,
            textShadowColor: 'rgba(0, 0, 0, 0.3)',
            textShadowOffset: { width: 0, height: 2 },
            textShadowRadius: 4,
          }}
        >
          {title}
        </Text>
      </Animated.View>
      
      {subtitle && (
        <Text
          variant="body"
          align="center"
          color="rgba(255,255,255,0.7)"
        >
          {subtitle}
        </Text>
      )}
    </Animated.View>
  );
});

AuthHeader.displayName = 'AuthHeader';