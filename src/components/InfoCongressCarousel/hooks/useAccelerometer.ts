import { useEffect } from 'react';
import { Accelerometer } from 'expo-sensors';
import { useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';
import { CAROUSEL_CONFIG } from '../constants';
import { UseAccelerometerReturn } from '../types';

export const useAccelerometer = (enabled: boolean = true): UseAccelerometerReturn => {
  const tiltX = useSharedValue(0);
  const tiltY = useSharedValue(0);

  useEffect(() => {
    if (!enabled) return;

    let subscription: any;

    const startAccelerometer = async () => {
      try {
        // Check if accelerometer is available
        const isAvailable = await Accelerometer.isAvailableAsync();
        if (!isAvailable) {
          console.log('Accelerometer is not available on this device');
          return;
        }

        // Set update interval
        Accelerometer.setUpdateInterval(CAROUSEL_CONFIG.ACCELEROMETER_UPDATE_INTERVAL);

        // Subscribe to accelerometer updates
        subscription = Accelerometer.addListener(({ x, y }) => {
          tiltX.value = withSpring(
            x * CAROUSEL_CONFIG.ACCELEROMETER_MULTIPLIER.X,
            CAROUSEL_CONFIG.SPRING_CONFIG
          );
          tiltY.value = withSpring(
            y * CAROUSEL_CONFIG.ACCELEROMETER_MULTIPLIER.Y,
            CAROUSEL_CONFIG.SPRING_CONFIG
          );
        });
      } catch (error) {
        console.warn('Error setting up accelerometer:', error);
      }
    };

    startAccelerometer();

    return () => {
      if (subscription) {
        subscription.remove();
      }
    };
  }, [enabled, tiltX, tiltY]);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [
        { translateX: tiltX.value * CAROUSEL_CONFIG.ACCELEROMETER_TRANSLATION.X },
        { translateY: tiltY.value * CAROUSEL_CONFIG.ACCELEROMETER_TRANSLATION.Y },
      ],
    };
  }, []);

  return { animatedStyle };
};