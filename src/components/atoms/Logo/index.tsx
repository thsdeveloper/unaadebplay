import { Image } from 'expo-image';
import { memo, useEffect } from 'react';
import { Animated, Easing } from 'react-native';
import { cn } from '@/utils/cn';

interface LogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  variant?: 'default' | 'white' | 'minimal';
  animated?: boolean;
  className?: string;
}

const sizeStyles = {
  sm: 'w-16 h-16',
  md: 'w-24 h-24',
  lg: 'w-32 h-32',
  xl: 'w-40 h-40',
};

const logoSources = {
  default: require('@/assets/unaadeb-login.png'),
  white: require('@/assets/unaadeb-login.png'), // Você pode ter uma versão branca
  minimal: require('@/assets/unaadeb-login.png'), // Você pode ter uma versão minimal
};

export const Logo = memo<LogoProps>(({
  size = 'md',
  variant = 'default',
  animated = false,
  className,
}) => {
  const scaleAnim = new Animated.Value(1);
  const rotateAnim = new Animated.Value(0);

  useEffect(() => {
    if (animated) {
      // Animação de escala suave
      Animated.loop(
        Animated.sequence([
          Animated.timing(scaleAnim, {
            toValue: 1.05,
            duration: 2000,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
          Animated.timing(scaleAnim, {
            toValue: 1,
            duration: 2000,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
        ])
      ).start();

      // Rotação suave
      Animated.loop(
        Animated.timing(rotateAnim, {
          toValue: 1,
          duration: 20000,
          easing: Easing.linear,
          useNativeDriver: true,
        })
      ).start();
    }
  }, [animated, scaleAnim, rotateAnim]);

  const rotation = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  const baseClasses = cn(
    sizeStyles[size],
    'rounded-xl',
    className
  );

  return (
    <Animated.View
      style={{
        transform: animated
          ? [
              { scale: scaleAnim },
              { rotate: rotation },
            ]
          : undefined,
      }}
      className={baseClasses}
    >
      <Image
        source={logoSources[variant]}
        style={{ width: '100%', height: '100%' }}
        contentFit="contain"
        transition={300}
        placeholder={undefined}
        placeholderContentFit="contain"
        cachePolicy="memory-disk"
      />
    </Animated.View>
  );
});

Logo.displayName = 'Logo';