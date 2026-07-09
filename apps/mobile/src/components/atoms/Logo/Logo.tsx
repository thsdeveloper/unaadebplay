import React from 'react';
import { View, Image, ViewStyle, ImageStyle } from 'react-native';
import { BlurView } from 'expo-blur';
import Animated, { 
  useAnimatedStyle, 
  useSharedValue, 
  withRepeat, 
  withSequence, 
  withTiming,
  withSpring,
} from 'react-native-reanimated';

interface LogoProps {
  size?: number;
  animated?: boolean;
  showBorder?: boolean;
  containerStyle?: ViewStyle;
  imageStyle?: ImageStyle;
}

export const Logo: React.FC<LogoProps> = React.memo(({
  size = 100,
  animated = false,
  showBorder = true,
  containerStyle,
  imageStyle,
}) => {
  const rotation = useSharedValue(0);
  const scale = useSharedValue(1);

  React.useEffect(() => {
    if (animated) {
      rotation.value = withRepeat(
        withSequence(
          withTiming(0.02, { duration: 4000 }),
          withTiming(-0.02, { duration: 4000 })
        ),
        -1
      );
      
      scale.value = withRepeat(
        withSequence(
          withSpring(1.05),
          withSpring(1)
        ),
        -1
      );
    }
  }, [animated]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { rotate: `${rotation.value}rad` },
      { scale: scale.value },
    ],
  }));

  const containerSize = size + 20;
  const innerSize = size + 12;

  return (
    <Animated.View style={[animated && animatedStyle, containerStyle]}>
      <View
        style={{
          width: containerSize,
          height: containerSize,
          borderRadius: containerSize / 2,
          overflow: 'hidden',
        }}
      >
        {showBorder ? (
          <BlurView intensity={40} tint="dark" style={{ padding: 4 }}>
            <View style={{
              width: innerSize,
              height: innerSize,
              borderRadius: innerSize / 2,
              backgroundColor: 'rgba(255,255,255,0.1)',
              justifyContent: 'center',
              alignItems: 'center',
              borderWidth: 2,
              borderColor: 'rgba(96, 165, 250, 0.3)',
            }}>
              <Image
                source={require("@/assets/default.png")}
                style={[
                  { 
                    width: size, 
                    height: size, 
                    borderRadius: size / 2 
                  },
                  imageStyle
                ]}
                alt="Logo"
              />
            </View>
          </BlurView>
        ) : (
          <Image
            source={require("@/assets/default.png")}
            style={[
              { 
                width: size, 
                height: size, 
                borderRadius: size / 2 
              },
              imageStyle
            ]}
            alt="Logo"
          />
        )}
      </View>
    </Animated.View>
  );
});

Logo.displayName = 'Logo';