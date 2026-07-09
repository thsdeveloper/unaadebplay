import React, { useEffect, useRef } from 'react';
import { View, Animated, ViewStyle } from 'react-native';
import { BlurView } from 'expo-blur';
import { Icon, IconFamily } from '@/components/atoms/Icon';
import { Text } from '@/components/atoms/Text';

export type ToastType = 'success' | 'error' | 'warning' | 'info';

interface ToastProps {
  type: ToastType;
  message: string;
  duration?: number;
  onDismiss?: () => void;
  style?: ViewStyle;
}

const toastConfig: Record<ToastType, {
  icon: string;
  family: IconFamily;
  color: string;
  backgroundColor: string;
}> = {
  success: {
    icon: 'check-circle',
    family: 'MaterialIcons',
    color: '#10b981',
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
  },
  error: {
    icon: 'error',
    family: 'MaterialIcons',
    color: '#ef4444',
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
  },
  warning: {
    icon: 'warning',
    family: 'MaterialIcons',
    color: '#f59e0b',
    backgroundColor: 'rgba(245, 158, 11, 0.1)',
  },
  info: {
    icon: 'info',
    family: 'MaterialIcons',
    color: '#3b82f6',
    backgroundColor: 'rgba(59, 130, 246, 0.1)',
  },
};

export const Toast: React.FC<ToastProps> = React.memo(({
  type,
  message,
  duration = 3000,
  onDismiss,
  style,
}) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(-100)).current;
  const config = toastConfig[type];

  useEffect(() => {
    // Animate in
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.spring(slideAnim, {
        toValue: 0,
        friction: 8,
        tension: 40,
        useNativeDriver: true,
      }),
    ]).start();

    // Auto dismiss
    const timer = setTimeout(() => {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: -100,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start(() => {
        onDismiss?.();
      });
    }, duration);

    return () => clearTimeout(timer);
  }, []);

  return (
    <Animated.View
      style={[{
        position: 'absolute',
        top: 60,
        left: 20,
        right: 20,
        opacity: fadeAnim,
        transform: [{ translateY: slideAnim }],
        borderRadius: 12,
        overflow: 'hidden',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 5,
      }, style]}
    >
      <BlurView intensity={80} tint="dark">
        <View style={{
          flexDirection: 'row',
          alignItems: 'center',
          padding: 16,
          backgroundColor: config.backgroundColor,
        }}>
          <Icon
            family={config.family}
            name={config.icon}
            size={24}
            color={config.color}
            style={{ marginRight: 12 }}
          />
          <Text
            size="sm"
            weight="medium"
            style={{ flex: 1 }}
          >
            {message}
          </Text>
        </View>
      </BlurView>
    </Animated.View>
  );
});

Toast.displayName = 'Toast';