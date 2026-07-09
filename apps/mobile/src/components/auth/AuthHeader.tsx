import React, { useRef, useEffect } from 'react';
import { Animated } from 'react-native';
import { Box } from '@/components/ui/box';
import { Heading } from '@/components/ui/heading';
import { Text } from '@/components/ui/text';
import { Image } from 'react-native';

interface AuthHeaderProps {
    title: string;
    subtitle?: string;
    showLogo?: boolean;
}

export function AuthHeader({ title, subtitle, showLogo = true }: AuthHeaderProps) {
    const scaleAnim = useRef(new Animated.Value(0.8)).current;
    const rotateAnim = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        Animated.spring(scaleAnim, {
            toValue: 1,
            friction: 4,
            delay: 300,
            useNativeDriver: true,
        }).start();

        // Sutil animação de rotação na logo
        Animated.loop(
            Animated.sequence([
                Animated.timing(rotateAnim, {
                    toValue: 1,
                    duration: 10000,
                    useNativeDriver: true,
                }),
                Animated.timing(rotateAnim, {
                    toValue: 0,
                    duration: 10000,
                    useNativeDriver: true,
                }),
            ])
        ).start();
    }, []);

    const spin = rotateAnim.interpolate({
        inputRange: [0, 1],
        outputRange: ['0deg', '360deg']
    });

    return (
        <Animated.View
            style={{
                transform: [{ scale: scaleAnim }],
                alignItems: 'center',
                marginBottom: 40
            }}
        >
            {showLogo && (
                <Animated.View
                    style={{
                        transform: [{ rotate: spin }]
                    }}
                >
                    <Box className="w-32 h-32 mb-6 bg-white/10 rounded-full items-center justify-center backdrop-blur-sm">
                        <Image
                            source={require("@/assets/unaadeb-login.png")}
                            className="w-28 h-28 rounded-full"
                            alt="Logo UNAADEB"
                        />
                    </Box>
                </Animated.View>
            )}
            
            <Heading className="text-center text-white text-3xl font-bold mb-2">
                {title}
            </Heading>
            
            {subtitle && (
                <Text className="text-center text-blue-200 text-base px-4">
                    {subtitle}
                </Text>
            )}
        </Animated.View>
    );
}