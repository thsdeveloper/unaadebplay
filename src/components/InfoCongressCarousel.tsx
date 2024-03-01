import React, {useEffect, useState} from 'react';
import {View, Image, Dimensions, TouchableOpacity, SafeAreaView, Animated, ActivityIndicator} from 'react-native';
import {Text, Box, Heading} from 'native-base';
import {Link} from "expo-router";
import colors from "@/constants/colors";
import {LinearGradient} from 'expo-linear-gradient';
import {Feather} from "@expo/vector-icons";
import {Accelerometer} from 'expo-sensors';
import {getItems} from "@/services/items";
import {EventsTypes} from "@/types/EventsTypes";
import Carousel from "react-native-snap-carousel";

const windowWidth = Dimensions.get('window').width;

export default function InfoCongressCarousel() {
    const [congress, setCongress] = useState<EventsTypes[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [activeIndex, setActiveIndex] = useState(0);
    const tiltX = new Animated.Value(0);
    const tiltY = new Animated.Value(0);

    useEffect(() => {
        const loadCongress = async () => {
            const response = await getItems<EventsTypes>('congresso');
            setIsLoading(false);
            setCongress(response);
        };

        loadCongress();
    }, []);

    useEffect(() => {
        Accelerometer.setUpdateInterval(100);
        const subscription = Accelerometer.addListener(({x, y}) => {
            Animated.spring(tiltX, {toValue: x, useNativeDriver: true, tension: 30, friction: 5}).start();
            Animated.spring(tiltY, {toValue: y, useNativeDriver: true, tension: 30, friction: 5}).start();
        });

        return () => subscription.remove();
    }, []);

    const onItemChange = (index: number) => setActiveIndex(index);

    const renderItem = ({item, index}: { item: EventsTypes; index: number }) => {
        // Aplica a animação apenas ao item ativo
        const animatedStyle = activeIndex === index ? {
            transform: [
                {
                    rotateZ: tiltX.interpolate({
                        inputRange: [-1, 1],
                        outputRange: ['-30deg', '30deg'],
                        extrapolate: 'clamp'
                    })
                },
                {
                    rotateX: tiltY.interpolate({
                        inputRange: [-1, 1],
                        outputRange: ['10deg', '-10deg'],
                        extrapolate: 'clamp'
                    })
                }
            ]
        } : {};

        return (
            <Link href={`/(tabs)/(home)/(congresso)/${item.id}`} asChild>
                <TouchableOpacity activeOpacity={0.9}>
                    <View style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}>
                        <Box shadow={6} p={4}>
                            <Animated.View style={[{shadow: 6, padding: 4}, animatedStyle]}>
                                <Image
                                    borderRadius={10}
                                    source={{uri: `https://back-unaadeb.onrender.com/assets/${item.poster}`}}
                                    style={{width: windowWidth * 0.8, height: windowWidth * 1.1}}
                                    resizeMode="cover"
                                />
                            </Animated.View>
                        </Box>
                        <Text color={colors.text}>{item.name}</Text>
                    </View>
                    <Box alignItems={"center"} p={0}>
                        <Feather name="chevron-down" size={30} color={colors.light}/>
                    </Box>
                </TouchableOpacity>
            </Link>
        );
    };

    return (

        <LinearGradient
            colors={isLoading ? ['#0b2a86', '#0d0f17'] : [`${congress[activeIndex]?.primary_color}`, `${congress[activeIndex]?.second_color}`]} // Usa as cores do evento ativo
            style={{flex: 1}}
        >
            <SafeAreaView>
                {isLoading ? (
                    // Placeholder ou indicador de carregamento
                    <Box alignItems={"center"} justifyContent={"center"} flex={1} py={4}>
                        <ActivityIndicator size="large" color={colors.light}/>
                        {/* Adicione aqui um componente de skeleton screen se desejar */}
                    </Box>
                ) : (
                    <>
                        <Carousel
                            data={congress}
                            renderItem={renderItem}
                            onSnapToItem={onItemChange}
                            sliderWidth={windowWidth}
                            itemWidth={windowWidth * 0.8}
                            loop={true} // Ativa o efeito de borda infinita
                            autoplay={false} // Opcional: move o carrossel automaticamente
                            autoplayDelay={500}
                            autoplayInterval={3000}
                            inactiveSlideOpacity={0.4}
                            inactiveSlideScale={0.9}
                            snapToAlignment={'start'}
                            snapToInterval={windowWidth * 0.8 + 10} // ssLargura do item + espaçamento
                        />
                        <Box alignItems={"center"}>
                            <Box alignItems={"center"} pb={4}>
                                <Heading color={colors.light}
                                         fontWeight={"extrabold"}>{congress[activeIndex]?.theme}</Heading>
                                <Heading color={colors.light}
                                         fontSize={14}>{congress[activeIndex]?.description}</Heading>
                            </Box>
                        </Box>
                    </>
                )}


            </SafeAreaView>

        </LinearGradient>
    );
};