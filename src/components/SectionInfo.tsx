import React, { useRef, useState } from "react";
import { TouchableOpacity, Animated, StyleSheet, View } from "react-native";
import { Feather } from "@expo/vector-icons";
import { Link } from "expo-router";
import { Box } from "@/components/ui/box";
import { Text } from "@/components/ui/text";
import { LinearGradient } from "expo-linear-gradient";
import { BlurView } from "expo-blur";

interface PropsSectionInfo {
    to: string;
    title: string;
    description: string;
    icon: string;
    bgColor: string;
    variant?: "gradient" | "glass" | "outline" | "solid";
    iconVariant?: "circle" | "square" | "floating";
}

export default function SectionInfo({
                                        to,
                                        title,
                                        description,
                                        icon,
                                        bgColor,
                                        variant = "gradient",
                                        iconVariant = "circle"
                                    }: PropsSectionInfo) {
    // Animações
    const scaleAnim = useRef(new Animated.Value(1)).current;
    const [isPressed, setIsPressed] = useState(false);

    // Gera uma cor mais escura para o gradiente
    const getDarkerColor = (color: string) => {
        // Se a cor for hexadecimal, convertemos para uma versão mais escura
        if (color.startsWith('#')) {
            let r = parseInt(color.slice(1, 3), 16);
            let g = parseInt(color.slice(3, 5), 16);
            let b = parseInt(color.slice(5, 7), 16);

            r = Math.max(0, r - 40);
            g = Math.max(0, g - 40);
            b = Math.max(0, b - 40);

            return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
        }
        return color;
    };

    // Cores para o gradiente
    const gradientColors = [bgColor, getDarkerColor(bgColor)];

    // Handlers para as animações
    const handlePressIn = () => {
        setIsPressed(true);
        Animated.spring(scaleAnim, {
            toValue: 0.97,
            friction: 5,
            tension: 40,
            useNativeDriver: true,
        }).start();
    };

    const handlePressOut = () => {
        setIsPressed(false);
        Animated.spring(scaleAnim, {
            toValue: 1,
            friction: 3,
            tension: 40,
            useNativeDriver: true,
        }).start();
    };

    // Renderiza o conteúdo interno
    const renderContent = () => (
        <Animated.View style={[
            styles.container,
            { transform: [{ scale: scaleAnim }] }
        ]}>
            {/* Fundo com base na variante escolhida */}
            {variant === "gradient" && (
                <LinearGradient
                    colors={gradientColors}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={styles.background}
                />
            )}
            {variant === "glass" && (
                <BlurView intensity={25} tint="light" style={styles.background} />
            )}
            {variant === "solid" && (
                <View style={[styles.background, { backgroundColor: bgColor }]} />
            )}
            {variant === "outline" && (
                <View style={[styles.background, styles.outline, { borderColor: bgColor }]} />
            )}

            {/* Conteúdo */}
            <Box style={styles.contentContainer}>
                {/* Ícone com variantes */}
                {iconVariant === "circle" && (
                    <Box style={[styles.iconCircle, { backgroundColor: variant === "outline" ? bgColor : 'rgba(255, 255, 255, 0.25)' }]}>
                        <Feather
                            name={icon}
                            size={28}
                            color={variant === "outline" ? "#fff" : "#fff"}
                        />
                    </Box>
                )}
                {iconVariant === "square" && (
                    <Box style={[styles.iconSquare, { backgroundColor: variant === "outline" ? bgColor : 'rgba(255, 255, 255, 0.25)' }]}>
                        <Feather
                            name={icon}
                            size={28}
                            color={variant === "outline" ? "#fff" : "#fff"}
                        />
                    </Box>
                )}
                {iconVariant === "floating" && (
                    <Box style={styles.iconFloating}>
                        <LinearGradient
                            colors={['rgba(255,255,255,0.8)', 'rgba(255,255,255,0.4)']}
                            style={styles.iconFloatingGradient}
                        >
                            <Feather
                                name={icon}
                                size={32}
                                color={bgColor}
                            />
                        </LinearGradient>
                    </Box>
                )}

                {/* Textos */}
                <Box style={styles.textContainer}>
                    <Text
                        style={[
                            styles.title,
                            variant === "outline" ? { color: bgColor } : styles.lightText
                        ]}
                    >
                        {title}
                    </Text>
                    <Text
                        style={[
                            styles.description,
                            variant === "outline" ? { color: '#666' } : styles.lightTextSecondary
                        ]}
                    >
                        {description}
                    </Text>
                </Box>

                {/* Seta indicando que é clicável */}
                <Box style={styles.arrowContainer}>
                    <Feather
                        name="chevron-right"
                        size={24}
                        color={variant === "outline" ? bgColor : "#fff"}
                    />
                </Box>
            </Box>
        </Animated.View>
    );

    return (
        <Link href={to} asChild>
            <TouchableOpacity
                activeOpacity={1}
                onPressIn={handlePressIn}
                onPressOut={handlePressOut}
                style={[
                    styles.touchable,
                    { marginBottom: 10 } // Espaçamento entre componentes
                ]}
            >
                {renderContent()}
            </TouchableOpacity>
        </Link>
    );
}

const styles = StyleSheet.create({
    touchable: {
        borderRadius: 16,
        overflow: 'hidden',
        marginVertical: 8,
    },
    container: {
        height: 100,
        width: '100%',
        borderRadius: 16,
        overflow: 'hidden',
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 3,
        },
        shadowOpacity: 0.12,
        shadowRadius: 8,
        elevation: 6,
    },
    background: {
        position: 'absolute',
        width: '100%',
        height: '100%',
    },
    outline: {
        backgroundColor: 'transparent',
        borderWidth: 1.5,
    },
    contentContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: 16,
        height: '100%',
    },
    iconCircle: {
        width: 56,
        height: 56,
        borderRadius: 28,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 16,
    },
    iconSquare: {
        width: 56,
        height: 56,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 16,
    },
    iconFloating: {
        width: 60,
        height: 60,
        borderRadius: 30,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 16,
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.1,
        shadowRadius: 3,
        elevation: 4,
    },
    iconFloatingGradient: {
        width: 60,
        height: 60,
        borderRadius: 30,
        justifyContent: 'center',
        alignItems: 'center',
    },
    textContainer: {
        flex: 1,
        justifyContent: 'center',
    },
    title: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 4,
    },
    description: {
        fontSize: 14,
    },
    lightText: {
        color: '#fff',
        fontWeight: 'bold',
    },
    lightTextSecondary: {
        color: 'rgba(255, 255, 255, 0.9)',
    },
    arrowContainer: {
        padding: 6,
    },
});
