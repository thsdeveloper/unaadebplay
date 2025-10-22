import React, { useEffect, useState, useRef } from 'react';
import {
  Platform,
  Dimensions,
  Keyboard,
  StatusBar,
  Animated,
} from 'react-native';
import { Box } from '@/components/ui/box';
import { Center } from '@/components/ui/center';
import { VStack } from '@/components/ui/vstack';
import { ScrollView } from '@/components/ui/scroll-view';
import { KeyboardAvoidingView } from '@/components/ui/keyboard-avoiding-view';
import { GradientBackground } from '@/components/atoms/GradientBackground';
import { LoadingSpinner } from '@/components/atoms/LoadingSpinner';

const { height } = Dimensions.get('window');

interface AuthTemplateProps {
  children: React.ReactNode;
  loading?: boolean;
  isLoading?: boolean;
  title?: string;
  subtitle?: string;
  gradientColors?: readonly [string, string, ...string[]];
}

export const AuthTemplate: React.FC<AuthTemplateProps> = ({
  children,
  loading = false,
  isLoading = false,
  title,
  subtitle,
  gradientColors = ['#0f172a', '#1e293b', '#334155'],
}) => {
  const [keyboardVisible, setKeyboardVisible] = useState(false);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;

  const isLoadingState = loading || isLoading;

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
  }, [fadeAnim, slideAnim]);

  if (isLoadingState) {
    return (
      <GradientBackground colors={gradientColors}>
        <Center className="flex-1">
          <LoadingSpinner
            type="lottie"
            size="large"
            containerStyle={{
              flex: 1,
              justifyContent: 'center',
              alignItems: 'center',
            }}
          />
        </Center>
      </GradientBackground>
    );
  }

  return (
    <Box className="flex-1">
      <StatusBar barStyle="light-content" />
      <GradientBackground colors={gradientColors}>
        <KeyboardAvoidingView
          className="flex-1"
          behavior={Platform.OS === "ios" ? "padding" : undefined}
        >
          <ScrollView
            contentContainerStyle={{ flexGrow: 1 }}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            <Animated.View
              style={{
                flex: 1,
                opacity: fadeAnim,
                transform: [{ translateY: slideAnim }],
                minHeight: height,
              }}
            >
              <Center className="flex-1 px-6 py-10">
                <VStack space="2xl" className="w-full max-w-md">
                  {children}
                </VStack>
              </Center>
            </Animated.View>
          </ScrollView>
        </KeyboardAvoidingView>
      </GradientBackground>
    </Box>
  );
};

AuthTemplate.displayName = 'AuthTemplate';