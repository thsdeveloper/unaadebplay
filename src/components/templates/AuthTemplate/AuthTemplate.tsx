import React, { useEffect, useState, useRef } from 'react';
import {
  Platform,
  Dimensions,
  Keyboard,
  KeyboardAvoidingView,
  ScrollView,
  StatusBar,
  Animated,
  ViewStyle,
} from 'react-native';
import { GradientBackground } from '@/components/atoms/GradientBackground';
import { LoadingSpinner } from '@/components/atoms/LoadingSpinner';

const { height } = Dimensions.get('window');

interface AuthTemplateProps {
  children: React.ReactNode;
  loading?: boolean;
  gradientColors?: readonly [string, string, ...string[]];
  contentContainerStyle?: ViewStyle;
}

export const AuthTemplate: React.FC<AuthTemplateProps> = ({
  children,
  loading = false,
  gradientColors = ['#0f172a', '#1e293b', '#334155'],
  contentContainerStyle,
}) => {
  const [keyboardVisible, setKeyboardVisible] = useState(false);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;

  // Keyboard detection
  useEffect(() => {
    const keyboardDidShowListener = Keyboard.addListener('keyboardDidShow', () => {
      setKeyboardVisible(true);
    });
    const keyboardDidHideListener = Keyboard.addListener('keyboardDidHide', () => {
      setKeyboardVisible(false);
    });

    return () => {
      keyboardDidShowListener.remove();
      keyboardDidHideListener.remove();
    };
  }, []);

  // Entry animations
  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      }),
      Animated.spring(slideAnim, {
        toValue: 0,
        friction: 5,
        tension: 40,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  if (loading) {
    return (
      <GradientBackground colors={gradientColors}>
        <LoadingSpinner
          type="lottie"
          size="large"
          containerStyle={{
            flex: 1,
            justifyContent: 'center',
            alignItems: 'center',
          }}
        />
      </GradientBackground>
    );
  }

  return (
    <>
      <StatusBar barStyle="light-content" />
      <GradientBackground colors={gradientColors}>
        <KeyboardAvoidingView
          style={{ flex: 1 }}
          behavior={Platform.OS === "ios" ? "padding" : undefined}
        >
          <ScrollView
            contentContainerStyle={{ flexGrow: 1 }}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            <Animated.View
              style={[{
                flex: 1,
                opacity: fadeAnim,
                transform: [{ translateY: slideAnim }],
                paddingHorizontal: 24,
                paddingVertical: 40,
                justifyContent: 'center',
                minHeight: height,
              }, contentContainerStyle]}
            >
              {children}
            </Animated.View>
          </ScrollView>
        </KeyboardAvoidingView>
      </GradientBackground>
    </>
  );
};

AuthTemplate.displayName = 'AuthTemplate';