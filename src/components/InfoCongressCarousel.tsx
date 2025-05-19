import React, { useCallback, memo, useContext, useEffect, useRef, useState } from 'react';
import {
    Dimensions,
    TouchableOpacity,
    View,
    StyleSheet,
    RefreshControl,
    ScrollView
} from 'react-native';
import { Link } from "expo-router";
import colors from "@/constants/colors";
import { LinearGradient } from 'expo-linear-gradient';
import { Feather } from "@expo/vector-icons";
import { Accelerometer } from 'expo-sensors';
import { getItems } from "@/services/items";
import Carousel from "react-native-snap-carousel";
import { CongressType } from "@/types/CongressType";
import CongressItemSkeletons from "@/components/Skeletons/CongressItemSkeletons";
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';
import AlertContext from "@/contexts/AlertContext";
import { Image } from '@/components/Image';
import { handleErrors } from "@/utils/directus";
import { Text } from "@/components/ui/text";
import { StatusBar } from 'expo-status-bar';
import {Heading} from "@/components/ui/heading";

const windowWidth = Dimensions.get('window').width;
const windowHeight = Dimensions.get('window').height;

// Componente de item memoizado com estilo Netflix
const CongressItem = memo(({ item, animatedStyle }: { item: CongressType; animatedStyle: any }) => {
    return (
        <TouchableOpacity activeOpacity={0.9} style={styles.itemContainer}>
            {/* Poster em tela cheia */}
            <Animated.View style={[styles.posterContainer, animatedStyle]}>
                <Image
                    style={styles.posterImage}
                    resizeMode="cover"
                    assetId={item.poster}
                />

                {/* Overlay para iOS compatível */}
                <View style={styles.overlayContainer}>
                    {/* Overlay geral */}
                    <View style={styles.generalOverlay}/>

                    {/* Gradiente superior - funciona em iOS e Android */}
                    <LinearGradient
                        colors={['rgba(0,0,0,0.7)', 'transparent']}
                        style={styles.topGradient}
                    />

                    {/* Gradiente inferior - funciona em iOS e Android */}
                    <LinearGradient
                        colors={['transparent', 'rgba(0,0,0,0.7)', 'rgba(0,0,0,0.9)']}
                        style={styles.bottomGradient}
                    />
                </View>
            </Animated.View>

            {/* Conteúdo centralizado - Estilo exato Netflix */}
            <View style={styles.contentContainer}>
                {/* Título grande e central */}
                <Heading size={'4xl'} className={'text-white font-extrabold'}>
                    {item.name}
                </Heading>

                {/* Tags */}
                <View style={styles.tagsContainer}>
                    <Text style={styles.tagText}>{item.theme}</Text>
                    <View style={styles.tagDot}/>
                    <Text style={styles.tagText}>Congresso</Text>
                    <View style={styles.tagDot}/>
                    <Text style={styles.tagText}>Adoração</Text>
                    <View style={styles.tagDot}/>
                    <Text style={styles.tagText}>BR</Text>
                </View>

                {/* Três botões na linha inferior */}
                <View style={styles.buttonsContainer}>
                    {/* Botão My List */}
                    <TouchableOpacity style={styles.sideButton}>
                        <Feather name="check" size={24} color="white"/>
                        <Text style={styles.buttonSmallText}>Confirmar</Text>
                    </TouchableOpacity>

                    {/* Botão Play */}
                    <Link href={`/(tabs)/(home)/(congresso)/${item.id}`} asChild>
                        <TouchableOpacity style={styles.playButton}>
                            <Feather name="play" size={20} color="black"/>
                            <Text style={styles.playButtonText}>Acessar</Text>
                        </TouchableOpacity>
                    </Link>

                    {/* Botão Info */}
                    <TouchableOpacity style={styles.sideButton}>
                        <Feather name="info" size={24} color="white"/>
                        <Text style={styles.buttonSmallText}>Informações</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </TouchableOpacity>
    );
});

// Animação suave do acelerômetro
// Animação aprimorada do acelerômetro com efeito Netflix
const useAccelerometerEffect = () => {
    // Valores para diferentes camadas de paralaxe
    const tiltX = useSharedValue(0);
    const tiltY = useSharedValue(0);
    const bgTiltX = useSharedValue(0);
    const bgTiltY = useSharedValue(0);
    const textTiltX = useSharedValue(0);
    const textTiltY = useSharedValue(0);

    useEffect(() => {
        // Reduzir o intervalo para maior fluidez
        Accelerometer.setUpdateInterval(100);

        const subscription = Accelerometer.addListener(({x, y}) => {
            // Aumentar amplitude do movimento principal (3x maior)
            tiltX.value = withSpring(x * 4.5, {damping: 15, stiffness: 70});
            tiltY.value = withSpring(y * 2.4, {damping: 15, stiffness: 70});

            // Movimento paralaxe do fundo (movimento oposto, mais sutil)
            bgTiltX.value = withSpring(-x * 3, {damping: 20, stiffness: 40});
            bgTiltY.value = withSpring(-y * 1.5, {damping: 20, stiffness: 40});

            // Movimento do texto (ligeiramente mais rápido que a imagem)
            textTiltX.value = withSpring(x * 2, {damping: 10, stiffness: 60});
            textTiltY.value = withSpring(y * 1, {damping: 10, stiffness: 60});
        });

        return () => subscription.remove();
    }, []);

    // Estilo animado para o poster principal
    const posterAnimatedStyle = useAnimatedStyle(() => {
        return {
            transform: [
                {translateX: tiltX.value * 12}, // Aumentado de 5 para 12
                {translateY: tiltY.value * 8},  // Aumentado de 3 para 8
                {rotateZ: `${tiltX.value * 0.5}deg`}, // Adicionando rotação suave
                {scale: 1.1}, // Escala ligeiramente maior para permitir movimento sem mostrar bordas
            ],
        };
    });

    // Estilo animado para o overlay/background
    const bgAnimatedStyle = useAnimatedStyle(() => {
        return {
            transform: [
                {translateX: bgTiltX.value * 3},
                {translateY: bgTiltY.value * 2},
                {scale: 1.05},
            ],
        };
    });

    // Estilo animado para o texto/conteúdo
    const textAnimatedStyle = useAnimatedStyle(() => {
        return {
            transform: [
                {translateX: textTiltX.value * 4},
                {translateY: textTiltY.value * 2},
            ],
        };
    });

    return {
        posterAnimatedStyle,
        bgAnimatedStyle,
        textAnimatedStyle
    };
};

export default function InfoCongressCarousel() {
    const [congress, setCongress] = useState<CongressType[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [refreshing, setRefreshing] = useState<boolean>(false);
    const [activeIndex, setActiveIndex] = useState<number>(0);
    const alert = useContext(AlertContext);
    const carouselRef = useRef<any>(null);
    const animatedStyle = useAccelerometerEffect();
    const scrollViewRef = useRef<ScrollView>(null);

    // Função para carregar os dados do congresso
    const loadCongress = useCallback(async () => {
        try {
            const response = await getItems<CongressType[]>('congresso', {
                sort: ['date_start']
            });

            if (response.length > 0) {
                setCongress(response);
                // Manter o índice atual se estiver fazendo refresh, ou usar o último item se for a primeira carga
                const newIndex = refreshing ?
                    (activeIndex < response.length ? activeIndex : response.length - 1) :
                    response.length - 1;
                setActiveIndex(newIndex);
            }
        } catch (error) {
            const message = error.errors ? handleErrors(error.errors) : "Erro ao carregar dados";
            alert.error(`Erro: ${message}`);
        } finally {
            setIsLoading(false);
            setRefreshing(false);
        }
    }, [refreshing, activeIndex, alert]);

    // Função para lidar com o gesto de "pull to refresh"
    const onRefresh = useCallback(() => {
        setRefreshing(true);
        loadCongress();
    }, [loadCongress]);

    // Carrega os dados na inicialização
    useEffect(() => {
        setIsLoading(true);
        loadCongress();
    }, []);

    // Controla o carousel
    useEffect(() => {
        if (carouselRef.current && congress.length > 0 && activeIndex !== undefined) {
            carouselRef.current.snapToItem(activeIndex, false, false);
        }
    }, [activeIndex, congress.length]);

    const renderCarouselItem = useCallback(({item}: { item: CongressType; index: number }) => {
        return <CongressItem item={item} animatedStyle={animatedStyle}/>;
    }, [animatedStyle]);

    const onItemChange = useCallback((index: number) => {
        setActiveIndex(index);
    }, []);

    return (
        <ScrollView
            style={styles.scrollContainer}
            contentContainerStyle={styles.scrollContentContainer}
            refreshControl={
                <RefreshControl
                    refreshing={refreshing}
                    onRefresh={onRefresh}
                    colors={[colors.primary, colors.accent]}
                    tintColor={colors.primary}
                    title="Atualizando..."
                    titleColor={colors.primary}
                />
            }
            ref={scrollViewRef}
        >
            <View style={styles.container}>
                <StatusBar style="light"/>

                {isLoading && !refreshing ? (
                    <CongressItemSkeletons windowWidth={windowWidth}/>
                ) : (
                    <Carousel<CongressType>
                        vertical={false}
                        ref={carouselRef}
                        data={congress}
                        renderItem={renderCarouselItem}
                        onSnapToItem={onItemChange}
                        sliderWidth={windowWidth}
                        firstItem={activeIndex}
                        itemWidth={windowWidth}
                        inactiveSlideOpacity={0.7}
                        inactiveSlideScale={1}
                        autoplay={false}
                        loop={true}
                        contentContainerCustomStyle={styles.carouselContainer}
                    />
                )}

                {/* Indicador de atualização personalizado (opcional) */}
                {refreshing && (
                    <View style={styles.refreshIndicator}>
                        <Text style={styles.refreshText}>Atualizando dados do congresso...</Text>
                    </View>
                )}
            </View>
        </ScrollView>
    );
}

// Usando StyleSheet em vez de Tailwind para garantir compatibilidade com iOS
const styles = StyleSheet.create({
    scrollContainer: {
        flex: 1,
    },
    scrollContentContainer: {
        flexGrow: 1,
    },
    container: {
        height: windowHeight * 0.70,
        width: windowWidth,
        position: 'relative',
    },
    carouselContainer: {
        alignItems: 'center',
    },
    itemContainer: {
        width: windowWidth,
        height: windowHeight * 0.85,
        position: 'relative',
    },
    posterContainer: {
        width: '100%',
        height: '100%',
        position: 'absolute',
    },
    posterImage: {
        width: '100%',
        height: '100%',
    },
    overlayContainer: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
    },
    generalOverlay: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0,0,0,0.2)',
    },
    topGradient: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        height: 100,
    },
    bottomGradient: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        height: 350,
    },
    contentContainer: {
        position: 'absolute',
        left: 0,
        right: 0,
        bottom: 144,
        alignItems: 'center',
        paddingHorizontal: 16,
    },
    tagsContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 32,
        flexWrap: 'wrap',
    },
    tagText: {
        color: 'white',
        fontSize: 14,
        opacity: 0.9,
    },
    tagDot: {
        width: 4,
        height: 4,
        backgroundColor: 'white',
        opacity: 0.6,
        borderRadius: 2,
        marginHorizontal: 8,
    },
    buttonsContainer: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        alignItems: 'center',
        width: '100%',
        marginTop: 16,
    },
    sideButton: {
        alignItems: 'center',
        width: 80,
    },
    playButton: {
        backgroundColor: 'white',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 24,
        paddingVertical: 8,
        borderRadius: 4,
    },
    playButtonText: {
        color: 'black',
        fontWeight: 'bold',
        marginLeft: 8,
    },
    buttonSmallText: {
        color: 'white',
        fontSize: 12,
        marginTop: 4,
    },
    refreshIndicator: {
        position: 'absolute',
        top: 100,
        alignSelf: 'center',
        backgroundColor: 'rgba(0,0,0,0.7)',
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 20,
    },
    refreshText: {
        color: 'white',
        fontSize: 14,
    },
});
