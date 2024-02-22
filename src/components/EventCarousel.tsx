import React from 'react';
import Carousel from 'react-native-snap-carousel';
import {View, Image, Dimensions, TouchableOpacity} from 'react-native';
import {Text, Box,} from 'native-base';
import {useNavigation} from "@react-navigation/native";
import {Link} from "expo-router";

const windowWidth = Dimensions.get('window').width;

const EventCarousel = ({events, onActiveColorChange}) => {
    // Função de renderização para cada item do carrossel
    const navigation = useNavigation();


    const renderItem = ({item, index}) => {
        return (
            <Link href={'/congresso'} asChild>
                <TouchableOpacity activeOpacity={0.9}>
                    <View style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}>
                        <Box shadow={6} p={4}>
                            <Image
                                source={{uri: item.posterUrl}}
                                style={{width: windowWidth * 0.8, height: windowWidth * 1.1}}
                                resizeMode="cover"
                            />
                        </Box>
                        <Text>{item.name}</Text>
                    </View>
                </TouchableOpacity>
            </Link>
        );
    };

    const onItemChange = (index) => {
        const activeItemColor = events[index].color; // Assumindo que cada item em `event` tem uma propriedade `color`
        onActiveColorChange(activeItemColor); // Chama a função de callback com a cor do item ativo
    };

    return (
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
    );
};

export default EventCarousel;
