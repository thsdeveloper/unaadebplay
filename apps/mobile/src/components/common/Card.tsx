import React from 'react';
import { Box } from "@/components/ui/box";
import { HStack } from "@/components/ui/hstack";
import { VStack } from "@/components/ui/vstack";
import { Heading } from "@/components/ui/heading";
import { Pressable } from "@/components/ui/pressable";
import { Icon } from "@/components/ui/icon";
import { Image as ExpoImage } from "@/components/Image";
import { Divider } from "@/components/ui/divider";
import { LinearGradient } from 'expo-linear-gradient';
import { StyleSheet, ImageSourcePropType, StyleProp, ViewStyle } from 'react-native';
import { MaterialIcons, Ionicons } from '@expo/vector-icons';

interface CardProps {
    /**
     * Header title for the card
     */
    title?: string;
    /**
     * Subtitle displayed below the title
     */
    subtitle?: string;
    /**
     * Image source for card cover
     */
    imageSource?: string | ImageSourcePropType;
    /**
     * Asset ID for Expo Image if using Directus/CMS
     */
    imageAssetId?: string;
    /**
     * Additional content for card
     */
    children?: React.ReactNode;
    /**
     * Function called when card is pressed
     */
    onPress?: () => void;
    /**
     * Footer content for the card
     */
    footer?: React.ReactNode;
    /**
     * Custom style for the card container
     */
    style?: StyleProp<ViewStyle>;
    /**
     * Controls if the header should be displayed
     */
    showHeader?: boolean;
    /**
     * Controls if the footer should be displayed
     */
    showFooter?: boolean;
    /**
     * Controls if the image should be displayed
     */
    showImage?: boolean;
    /**
     * Icon name for the header (MaterialIcons)
     */
    headerIcon?: string;
    /**
     * Color for header elements
     */
    headerColor?: string;
    /**
     * Background gradient colors
     */
    gradientColors?: string[];
    /**
     * Fixed card size preset
     */
    size?: 'sm' | 'md' | 'lg' | 'full';
    /**
     * Card elevation/shadow intensity
     */
    elevation?: 'none' | 'sm' | 'md' | 'lg';
    /**
     * Card border radius size
     */
    borderRadius?: 'none' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl';
    /**
     * Controls if the card has pressable animation
     */
    isPressable?: boolean;
}

/**
 * A versatile Card component following the GlueStack UI design system
 */
const Card: React.FC<CardProps> = ({
                                       title,
                                       subtitle,
                                       imageSource,
                                       imageAssetId,
                                       children,
                                       onPress,
                                       footer,
                                       style,
                                       showHeader = true,
                                       showFooter = !!footer,
                                       showImage = true,
                                       headerIcon,
                                       headerColor = '#3182CE',
                                       gradientColors,
                                       size = 'md',
                                       elevation = 'md',
                                       borderRadius = 'lg',
                                       isPressable = true
                                   }) => {
    // Define size dimensions
    const sizeStyles = {
        sm: { width: 280 },
        md: { width: 340 },
        lg: { width: 380 },
        full: { width: '100%' }
    };

    // Define elevation/shadow styles
    const elevationStyles = {
        none: {},
        sm: {
            shadowOffset: { width: 0, height: 1 },
            shadowOpacity: 0.15,
            shadowRadius: 3,
            elevation: 2,
        },
        md: {
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.2,
            shadowRadius: 5,
            elevation: 4,
        },
        lg: {
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.25,
            shadowRadius: 8,
            elevation: 8,
        }
    };

    // Define border radius styles
    const borderRadiusStyles = {
        none: { borderRadius: 0 },
        sm: { borderRadius: 4 },
        md: { borderRadius: 8 },
        lg: { borderRadius: 12 },
        xl: { borderRadius: 16 },
        '2xl': { borderRadius: 24 },
        '3xl': { borderRadius: 32 }
    };

    // Main container component (Pressable or Box)
    const Container = isPressable ? Pressable : Box;

    // Container props
    const containerProps = isPressable ? {
        onPress,
        style: ({ pressed }: { pressed: boolean }) => [
            styles.container,
            sizeStyles[size],
            elevationStyles[elevation],
            borderRadiusStyles[borderRadius],
            style,
            pressed && styles.pressed
        ]
    } : {
        style: [
            styles.container,
            sizeStyles[size],
            elevationStyles[elevation],
            borderRadiusStyles[borderRadius],
            style
        ]
    };

    return (
        // @ts-ignore - TS has issues with the conditional component
        <Container {...containerProps} className={'bg-neutral-100 shadow-sm rounded-lg'}>
            {/* Header Section */}
            {showHeader && (title || subtitle) && (
                <Box>
                    {gradientColors ? (
                        <LinearGradient
                            colors={gradientColors}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 0 }}
                            style={[
                                styles.header,
                                { borderTopLeftRadius: borderRadiusStyles[borderRadius].borderRadius,
                                    borderTopRightRadius: borderRadiusStyles[borderRadius].borderRadius }
                            ]}
                        >
                            <CardHeader
                                title={title}
                                subtitle={subtitle}
                                icon={headerIcon}
                                color="white"
                            />
                        </LinearGradient>
                    ) : (
                        <Box
                            style={styles.header}
                            bg="white"
                            borderTopLeftRadius={borderRadiusStyles[borderRadius].borderRadius}
                            borderTopRightRadius={borderRadiusStyles[borderRadius].borderRadius}
                        >
                            <CardHeader
                                title={title}
                                subtitle={subtitle}
                                icon={headerIcon}
                                color={headerColor}
                            />
                        </Box>
                    )}
                </Box>
            )}

            {/* Image Section */}
            {showImage && (imageSource || imageAssetId) && (
                <Box style={styles.imageContainer}>
                    {imageAssetId ? (
                        <ExpoImage
                            style={styles.image}
                            resizeMode="cover"
                            assetId={imageAssetId}
                        />
                    ) : (
                        <ExpoImage
                            style={styles.image}
                            resizeMode="cover"
                            // @ts-ignore
                            source={typeof imageSource === 'string' ? { uri: imageSource } : imageSource}
                        />
                    )}
                </Box>
            )}

            {/* Content Section */}
            <Box bg="white" p="$4" style={styles.content}>
                {children}
            </Box>

            {/* Footer Section */}
            {showFooter && (
                <>
                    <Divider />
                    <Box
                        p="$3"
                        bg="white"
                        borderBottomLeftRadius={borderRadiusStyles[borderRadius].borderRadius}
                        borderBottomRightRadius={borderRadiusStyles[borderRadius].borderRadius}
                    >
                        {footer}
                    </Box>
                </>
            )}
        </Container>
    );
};

// Header subcomponent
const CardHeader = ({
                        title,
                        icon,
                        color
                    }: {
    title?: string;
    subtitle?: string;
    icon?: string;
    color?: string;
}) => (
    <HStack space="md" alignItems="center">
        {icon && (
            <Icon
                as={MaterialIcons}
                name={icon}
                size="lg"
                color={color || "primary.500"}
            />
        )}
        <VStack>
            {title && (
                <Heading size="sm" className={'text-neutral-50'}>
                    {title}
                </Heading>
            )}
        </VStack>
    </HStack>
);

// Subcomponents for composition pattern
Card.Header = ({ children }: { children: React.ReactNode }) => (
    <Box p="$4" bg="white" borderTopLeftRadius="$lg" borderTopRightRadius="$lg">
        {children}
    </Box>
);

Card.Content = ({ children }: { children: React.ReactNode }) => (
    <Box p="$4" bg="white">
        {children}
    </Box>
);

Card.Footer = ({ children }: { children: React.ReactNode }) => (
    <>
        <Divider />
        <Box className={'pl-2'}>
            {children}
        </Box>
    </>
);

Card.Image = ({ source, assetId, style }: { source?: ImageSourcePropType; assetId?: string; style?: StyleProp<ViewStyle> }) => (
    <Box style={[styles.imageContainer, style]}>
        {assetId ? (
            <ExpoImage
                style={styles.image}
                resizeMode="cover"
                assetId={assetId}
            />
        ) : (
            <ExpoImage
                style={styles.image}
                resizeMode="cover"
                // @ts-ignore
                source={source}
            />
        )}
    </Box>
);

const styles = StyleSheet.create({
    container: {
        backgroundColor: 'white',
        shadowColor: '#000',
        margin: 8,
        overflow: 'hidden',
    },
    pressed: {
        opacity: 0.9,
        transform: [{ scale: 0.98 }],
    },
    header: {
        padding: 16,
    },
    imageContainer: {
        height: 200,
        width: '100%',
    },
    image: {
        width: '100%',
        height: '100%',
    },
    content: {
        minHeight: 80,
    }
});

export default Card;
