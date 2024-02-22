import React, {useEffect, useState} from 'react';
import Carousel from 'react-native-snap-carousel';
import {View, Image, Dimensions, TouchableOpacity, SafeAreaView, Animated} from 'react-native';
import {Text, Box, Heading,} from 'native-base';
import {Link} from "expo-router";
import colors from "@/constants/colors";
import {LinearGradient} from 'expo-linear-gradient';
import {Feather} from "@expo/vector-icons";
import {Accelerometer} from 'expo-sensors';

const windowWidth = Dimensions.get('window').width;

export default function InfoCongressCarousel() {
    const [activeIndex, setActiveIndex] = useState(1); // Mantém o índice do item ativo
    const tiltX = new Animated.Value(0);
    const tiltY = new Animated.Value(0);

    const events = [
        {
            name: 'UNAADEB 2020',
            posterUrl: 'https://scontent.fbsb3-1.fna.fbcdn.net/v/t1.6435-9/119518849_805134316888270_828829101745507751_n.jpg?_nc_cat=100&ccb=1-7&_nc_sid=810d5f&_nc_ohc=oQeveyjW8Q0AX_Cf7A7&_nc_ht=scontent.fbsb3-1.fna&oh=00_AfA6_PGrEAln6OwmVc4hVG5EU85VHVWX9Z2kRz2WDL70eA&oe=65FB0A12',
            gradientColors: ['#6b1506', '#270403'],
            theme: '#DeuseEu',
            description: 'Um congresso marcado pela Glória de Deus!'
        },
        {
            name: 'UNAADEB 2017',
            posterUrl: 'https://demadeb.com.br/images/Cartaz-2017-UNAADEB-final-M.jpg',
            gradientColors: ['#282810', '#0d0f17'],
            theme: '#ImpactadosPelaPalavra',
            description: 'Congresso realizado no Ginásio de esporte SESC'
        },
        {
            name: 'UNAADEB 2023',
            posterUrl: 'https://adeb.com.br/images/2023/06/08/Cartaz%20UMADEB%202023%20a3.jpg',
            gradientColors: ['#b76105', '#23180e'],
            theme: '#GeradosNoAltar',
            description: 'Realizado no Arena Hall Brasília'
        },
        {
            name: 'UNAADEB 2024',
            posterUrl: 'https://back-unaadeb.onrender.com/assets/01d23cd0-76e3-465f-84f8-93165821064c',
            gradientColors: ['#0e3054', '#0f4652'],
            theme: '#ChamadosParaReconstruir',
            description: 'Um congresso marcado pela Glória de Deus!'
        }
    ]


    const onItemChange = (index) => {
        setActiveIndex(index); // Atualiza o índice do item ativo
    };

    useEffect(() => {
        Accelerometer.setUpdateInterval(100);
        const subscription = Accelerometer.addListener(({x, y}) => {
            // Atualiza os valores animados com base na orientação do dispositivo
            Animated.spring(tiltX, {
                toValue: x,
                useNativeDriver: true,
                tension: 30,
                friction: 5,
            }).start();

            Animated.spring(tiltY, {
                toValue: y,
                useNativeDriver: true,
                tension: 30,
                friction: 5,
            }).start();
        });

        return () => subscription.remove();
    }, []);

// Interpolação para calcular a rotação com base em tiltX
    const rotateZ = tiltX.interpolate({
        inputRange: [-5, 5],
        outputRange: ['-30deg', '30deg'],
        extrapolate: 'extend',
    });

    const rotateX = tiltY.interpolate({
        inputRange: [-8, 8],
        outputRange: ['10deg', '-10deg'], // Invertido para que a inclinação pareça natural
        extrapolate: 'clamp',
    });

    const renderItem = ({item, index}) => {


        return (
            <Link href={'/congresso'} asChild>
                <TouchableOpacity activeOpacity={0.9}>
                    <View style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}>
                        <Box shadow={6} p={4}>
                            <Animated.View style={{
                                shadow: 6,
                                padding: 4,
                                transform: [{rotateZ}, {rotateX}] // Aplica a transformação de rotação
                            }}>
                                <Image
                                    borderRadius={10}
                                    source={{uri: item.posterUrl}}
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
            colors={events[activeIndex].gradientColors} // Usa as cores do evento ativo
            style={{flex: 1}}
        >

            <SafeAreaView>
                <Carousel
                    data={events}
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
                    snapToInterval={windowWidth * 0.8 + 10} // Largura do item + espaçamento
                />


                <Box alignItems={"center"}>
                    <Box alignItems={"center"} pb={4}>
                        <Heading color={colors.light} fontWeight={"extrabold"}>{events[activeIndex].theme}</Heading>
                        <Heading color={colors.light} fontSize={14}>{events[activeIndex].description}</Heading>
                    </Box>
                </Box>

            </SafeAreaView>

        </LinearGradient>
    );
};