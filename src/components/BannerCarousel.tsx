import React, { useEffect, useState, useRef, useCallback, memo } from 'react';
import {
    Dimensions,
    FlatList,
    TouchableOpacity,
    View,
    Animated,
    Platform
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { BannerTypes } from '@/types/BannerTypes';
import { Image } from '@/components/Image';
import { getItems } from "@/services/items";
import { useRouter } from "expo-router";
import { Box } from "@/components/ui/box";
import { Skeleton } from "@/components/ui/skeleton";
import { Text } from "@/components/ui/text";
import { Feather } from '@expo/vector-icons';
import { Motion } from "@legendapp/motion";
import {cn} from "@gluestack-ui/nativewind-utils/cn";

const { width: screenWidth } = Dimensions.get('window');

interface PropsBanners {
    refreshing: boolean;
    setRefreshing: (refreshing: boolean) => void;
    autoPlay?: boolean;
    autoPlayInterval?: number;
    cardWidth?: number;
    cardHeight?: number;
    showArrows?: boolean;
    className?: string;
}

// Item renderizado separado e memoizado para performance
const BannerItem = memo(({
                             item,
                             width,
                             height,
                             activeIndex,
                             index,
                             scrollX,
                         }: {
    item: BannerTypes;
    width: number;
    height: number;
    activeIndex: number;
    index: number;
    scrollX: Animated.Value;
}) => {
    const router = useRouter();
    const inputRange = [
        (index - 1) * width,
        index * width,
        (index + 1) * width
    ];

    // Animação de escala para o efeito de zoom no slide ativo
    const scale = scrollX.interpolate({
        inputRange,
        outputRange: [0.9, 1, 0.9],
        extrapolate: 'clamp'
    });

    // Animação de opacidade para o efeito de fade nos slides inativos
    const opacity = scrollX.interpolate({
        inputRange,
        outputRange: [0.7, 1, 0.7],
        extrapolate: 'clamp'
    });

    const handlePress = () => {
        if (item.page_route) {
            router.push(item.page_route);
        } else {
            router.push('/(tabs)/(events)');
        }
    };

    return (
        <Animated.View
            style={{
                width,
                transform: [{ scale }],
                opacity,
                alignItems: 'center',
                justifyContent: 'center'
            }}
        >
            <TouchableOpacity
                activeOpacity={0.9}
                onPress={handlePress}
                className="rounded-2xl shadow-md shadow-black/10"
            >
                <Box className="relative rounded-2xl overflow-hidden bg-neutral-800/30" style={{ height }}>
                    <Image
                        borderRadius={16}
                        assetId={item.image}
                        width={String(width - 16)} // Margin compensation
                        height={String(height)}
                        resizeMode="cover"
                        className="absolute inset-0"
                    />

                    {/* Gradiente para melhorar a legibilidade do texto */}
                    <LinearGradient
                        colors={['transparent', 'rgba(0,0,0,0.3)', 'rgba(0,0,0,0.8)']}
                        locations={[0.4, 0.7, 1]}
                        className="absolute bottom-0 left-0 right-0 h-[70%] rounded-b-2xl z-[1]"
                    />

                    {/* Conteúdo do Banner */}
                    <Box className="absolute bottom-0 left-0 right-0 p-4 z-[2]">
                        {item.title && (
                            <Text
                                className="text-white text-lg font-bold shadow-sm shadow-black/50 mb-1"
                                numberOfLines={2}
                            >
                                {item.title}
                            </Text>
                        )}

                        {item.description && (
                            <Text
                                className="text-white text-sm shadow-sm shadow-black/50 opacity-90"
                                numberOfLines={3}
                            >
                                {item.description}
                            </Text>
                        )}

                        {/* Botão "Saiba mais" optativo */}
                        {(item.action_label || item.page_route) && (
                            <View className="flex-row items-center self-start bg-white/20 py-1.5 px-3 rounded-full mt-2.5">
                                <Text className="text-white text-xs font-medium">
                                    {item.action_label || "Saiba mais"}
                                </Text>
                                <Feather name="chevron-right" size={14} color="#FFF" className="ml-1" />
                            </View>
                        )}
                    </Box>
                </Box>
            </TouchableOpacity>
        </Animated.View>
    );
});

// Componente de renderização da paginação
const PaginationDot = memo(({
                                index,
                                scrollX,
                                cardWidth,
                                onPress
                            }: {
    index: number;
    scrollX: Animated.Value;
    cardWidth: number;
    onPress: () => void;
}) => {
    const inputRange = [
        (index - 1) * cardWidth,
        index * cardWidth,
        (index + 1) * cardWidth
    ];

    // Usando transformScaleX ao invés de width para animação com nativeDriver
    const scaleX = scrollX.interpolate({
        inputRange,
        outputRange: [1, 3, 1],
        extrapolate: 'clamp'
    });

    const opacity = scrollX.interpolate({
        inputRange,
        outputRange: [0.4, 1, 0.4],
        extrapolate: 'clamp'
    });

    return (
        <TouchableOpacity
            onPress={onPress}
            className="p-1.5"
        >
            <Animated.View
                style={{
                    height: 8,
                    width: 8,
                    borderRadius: 4,
                    backgroundColor: 'white',
                    marginHorizontal: 4,
                    opacity,
                    transform: [{ scaleX }]
                }}
            />
        </TouchableOpacity>
    );
});

// Componente principal do carrossel
const BannerCarousel = ({
                            refreshing,
                            setRefreshing,
                            autoPlay = true,
                            autoPlayInterval = 5000,
                            cardWidth = screenWidth * 0.85,
                            cardHeight = 180,
                            showArrows = true,
                            className
                        }: PropsBanners) => {
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [activeIndex, setActiveIndex] = useState(0);
    const [banners, setBanners] = useState<BannerTypes[]>([]);
    const [paused, setPaused] = useState(false);

    // Referências
    const flatListRef = useRef<FlatList>(null);
    const scrollX = useRef(new Animated.Value(0)).current;
    const autoplayTimerRef = useRef<NodeJS.Timeout | null>(null);

    // Carrega os banners da API
    useEffect(() => {
        const loadBanners = async () => {
            try {
                setLoading(true);
                setError(null);

                const response = await getItems<BannerTypes>('banners');
                setBanners(response);
            } catch (err) {
                console.error('Erro ao carregar banners:', err);
                setError('Não foi possível carregar os banners');
            } finally {
                setLoading(false);
                setRefreshing(false);
            }
        };

        loadBanners();
    }, [refreshing]);

    // Gerenciamento do autoplay
    useEffect(() => {
        if (autoPlay && banners.length > 1 && !paused) {
            startAutoplay();
        }

        return () => {
            if (autoplayTimerRef.current) {
                clearInterval(autoplayTimerRef.current);
            }
        };
    }, [banners, autoPlay, paused, activeIndex]);

    const startAutoplay = () => {
        if (autoplayTimerRef.current) {
            clearInterval(autoplayTimerRef.current);
        }

        autoplayTimerRef.current = setInterval(() => {
            if (banners.length > 0) {
                const nextIndex = (activeIndex + 1) % banners.length;
                scrollToIndex(nextIndex);
            }
        }, autoPlayInterval);
    };

    const scrollToIndex = useCallback((index: number) => {
        if (flatListRef.current && banners.length > 0) {
            flatListRef.current.scrollToIndex({
                index,
                animated: true,
                viewPosition: 0.5
            });
            setActiveIndex(index);
        }
    }, [banners.length]);

    const handleScroll = Animated.event(
        [{ nativeEvent: { contentOffset: { x: scrollX } } }],
        {
            useNativeDriver: true,
            listener: (event: any) => {
                const offsetX = event.nativeEvent.contentOffset.x;
                const newIndex = Math.round(offsetX / cardWidth);

                if (newIndex !== activeIndex && newIndex >= 0 && newIndex < banners.length) {
                    setActiveIndex(newIndex);
                }
            }
        }
    );

    const navigateToNext = () => {
        if (activeIndex < banners.length - 1) {
            scrollToIndex(activeIndex + 1);
        } else {
            scrollToIndex(0);
        }
    };

    const navigateToPrev = () => {
        if (activeIndex > 0) {
            scrollToIndex(activeIndex - 1);
        } else {
            scrollToIndex(banners.length - 1);
        }
    };

    // Renderiza os skeletons durante o carregamento
    const renderLoader = () => (
        <Box className="items-center justify-center mt-2.5 mb-5">
            <Skeleton width={cardWidth} height={cardHeight} borderRadius={16} className="shadow-sm shadow-black/5" />
            <View className="flex-row justify-center mt-3">
                {[...Array(3)].map((_, i) => (
                    <View
                        key={i}
                        className={cn(
                            "h-2 rounded mx-1 bg-white/30",
                            i === 1 ? "w-5 bg-white/50" : "w-2"
                        )}
                    />
                ))}
            </View>
        </Box>
    );

    // Renderiza mensagem de erro se ocorrer
    const renderError = () => (
        <View className="items-center justify-center p-5 mx-5 rounded-2xl bg-white/10 h-[180px]">
            <Feather name="alert-circle" size={36} color="rgba(255,255,255,0.7)" />
            <Text className="text-white/70 mt-2.5 text-center">{error}</Text>
            <TouchableOpacity
                className="mt-4 py-2 px-4 rounded-full bg-white/20"
                onPress={() => setRefreshing(true)}
            >
                <Text className="text-white font-medium">Tentar novamente</Text>
            </TouchableOpacity>
        </View>
    );

    // Componente de paginação customizado
    const renderPagination = () => {
        return (
            <View className="flex-row justify-center items-center mt-2.5">
                {banners.map((_, index) => (
                    <PaginationDot
                        key={`dot-${index}`}
                        index={index}
                        scrollX={scrollX}
                        cardWidth={cardWidth}
                        onPress={() => scrollToIndex(index)}
                    />
                ))}
            </View>
        );
    };

    // Renderiza os botões de navegação (setas)
    const renderNavigationArrows = () => {
        if (!showArrows || banners.length <= 1) return null;

        return (
            <>
                <TouchableOpacity
                    className="absolute top-1/2 left-4 -mt-5 w-10 h-10 rounded-full bg-black/30 justify-center items-center z-10"
                    onPress={navigateToPrev}
                    activeOpacity={0.7}
                >
                    <Feather name="chevron-left" size={22} color="#FFF" />
                </TouchableOpacity>

                <TouchableOpacity
                    className="absolute top-1/2 right-4 -mt-5 w-10 h-10 rounded-full bg-black/30 justify-center items-center z-10"
                    onPress={navigateToNext}
                    activeOpacity={0.7}
                >
                    <Feather name="chevron-right" size={22} color="#FFF" />
                </TouchableOpacity>
            </>
        );
    };

    // Função de renderização principal
    const renderItem = useCallback(({ item, index }: { item: BannerTypes; index: number }) => {
        return (
            <BannerItem
                item={item}
                width={cardWidth}
                height={cardHeight}
                activeIndex={activeIndex}
                index={index}
                scrollX={scrollX}
            />
        );
    }, [cardWidth, cardHeight, activeIndex]);

    // Se não houver banners e não estiver carregando
    const renderEmpty = () => (
        <View className="items-center justify-center p-5 mx-5 rounded-2xl bg-white/10 h-[180px]">
            <Feather name="image" size={36} color="rgba(255,255,255,0.7)" />
            <Text className="text-white/70 mt-2.5 text-center">Nenhum banner disponível</Text>
        </View>
    );

    // Usando Motion do @legendapp para animações de entrada
    return (
        <Motion.View
            className={cn("mb-5", className)}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
                type: "spring",
                damping: 18,
                stiffness: 100
            }}
        >
            {loading ? (
                renderLoader()
            ) : error ? (
                renderError()
            ) : banners.length === 0 ? (
                renderEmpty()
            ) : (
                <View>
                    <Animated.FlatList
                        ref={flatListRef}
                        horizontal
                        data={banners}
                        renderItem={renderItem}
                        keyExtractor={(item: BannerTypes) => item.id}
                        showsHorizontalScrollIndicator={false}
                        snapToInterval={cardWidth}
                        snapToAlignment="center"
                        decelerationRate="fast"
                        contentContainerStyle={{ paddingVertical: 15, paddingHorizontal: 10 }}
                        onScroll={handleScroll}
                        scrollEventThrottle={16}
                        onTouchStart={() => setPaused(true)}
                        onTouchEnd={() => setPaused(false)}
                        onMomentumScrollEnd={() => setPaused(false)}
                        initialNumToRender={3}
                        maxToRenderPerBatch={3}
                        windowSize={3}
                        removeClippedSubviews={Platform.OS !== 'web'}
                    />

                    {renderPagination()}
                    {renderNavigationArrows()}
                </View>
            )}
        </Motion.View>
    );
};

export default BannerCarousel;
