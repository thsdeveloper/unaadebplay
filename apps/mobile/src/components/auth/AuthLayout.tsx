import React, { ReactNode, useEffect, useRef } from 'react';
import { Platform, Animated } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { StatusBar } from 'expo-status-bar';
import { ScrollView } from '@/components/ui/scroll-view';
import { KeyboardAvoidingView } from '@/components/ui/keyboard-avoiding-view';
import { Box } from '@/components/ui/box';

interface AuthLayoutProps {
    children: ReactNode;
    gradientColors?: readonly [string, string, ...string[]];
}

export function AuthLayout({ 
    children, 
    gradientColors = ['#1e293b', '#334155', '#0f172a'] as const
}: AuthLayoutProps) {
    const fadeAnim = useRef(new Animated.Value(0)).current;
    const slideAnim = useRef(new Animated.Value(30)).current;

    useEffect(() => {
        Animated.parallel([
            Animated.timing(fadeAnim, {
                toValue: 1,
                duration: 600,
                useNativeDriver: true,
            }),
            Animated.timing(slideAnim, {
                toValue: 0,
                duration: 500,
                delay: 100,
                useNativeDriver: true,
            }),
        ]).start();
    }, []);

    return (
        <KeyboardAvoidingView
            style={{ flex: 1 }}
            behavior={Platform.OS === "ios" ? "padding" : undefined}
        >
            <StatusBar style="light" />
            <LinearGradient
                colors={gradientColors}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={{ flex: 1 }}
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
                            transform: [{ translateY: slideAnim }]
                        }}
                    >
                        <Box className="flex-1 px-6 py-8 justify-center">
                            {children}
                        </Box>
                    </Animated.View>
                </ScrollView>
            </LinearGradient>
        </KeyboardAvoidingView>
    );
}