// components/common/LoadingIndicator.tsx
import React from 'react';
import { StyleSheet } from 'react-native';
import { BlurView } from 'expo-blur';
import Animated, {
    useAnimatedStyle,
    useSharedValue,
    withRepeat,
    withTiming,
    Easing
} from 'react-native-reanimated';
import {VStack} from "@/components/ui/vstack";
import {Spinner} from "@/components/ui/spinner";
import {Center} from "@/components/ui/center";
import {Text} from "@/components/ui/text";

type LoadingIndicatorProps = {
    message?: string;
    fullScreen?: boolean;
    transparent?: boolean;
};

const LoadingIndicator: React.FC<LoadingIndicatorProps> = ({
                                                               message = 'Carregando...',
                                                               fullScreen = false,
                                                               transparent = false
                                                           }) => {
    // Configuração de animação de escala para um efeito "pulse"
    const scale = useSharedValue(1);

    React.useEffect(() => {
        scale.value = withRepeat(
            withTiming(1.1, { duration: 800, easing: Easing.ease }),
            -1, // -1 para repetir infinitamente
            true // reverso (vai e volta)
        );
    }, []);

    const animatedStyle = useAnimatedStyle(() => {
        return {
            transform: [{ scale: scale.value }]
        };
    });

    const Container = fullScreen
        ? Animated.View // Container full screen com backdrop blur
        : Center;        // Container simples centralizado

    const containerProps = fullScreen
        ? { style: styles.fullscreen }
        : { w: "100%" };

    return (
        <Container {...containerProps}>
            {fullScreen && transparent && (
                <BlurView intensity={20} style={StyleSheet.absoluteFill} />
            )}

            <VStack
                space="sm"
                alignItems="center"
                justifyContent="center"
                p="$4"
                bg={transparent ? "rgba(255,255,255,0.6)" : "$background.50"}
                borderRadius="$lg"
                style={fullScreen && !transparent ? styles.fullscreenContent : undefined}
                // Adicionando uma sutil sombra de elevação
                shadowColor="$dark.400"
                shadowOffset={{ width: 0, height: 2 }}
                shadowRadius={4}
                shadowOpacity={0.15}
                elevation={3}
            >
                <Animated.View style={animatedStyle}>
                    <Spinner size="lg" color="$primary.500" />
                </Animated.View>

                {message && (
                    <Text
                        color="$dark.500"
                        fontWeight="500"
                        textAlign="center"
                    >
                        {message}
                    </Text>
                )}
            </VStack>
        </Container>
    );
};

const styles = StyleSheet.create({
    fullscreen: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 1000,
    },
    fullscreenContent: {
        minWidth: 150,
        minHeight: 120,
    }
});

export default LoadingIndicator;
