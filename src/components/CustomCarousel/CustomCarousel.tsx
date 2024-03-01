import React from 'react';
import { Dimensions } from 'react-native';
import Carousel from 'react-native-snap-carousel';

// Obtenha a largura da tela para definir a largura do item do carrossel
const { width: screenWidth } = Dimensions.get('window');

interface PropsCustomCarousel{
    data: any[],
    renderItem: any,
    sliderWidth: number
}

export default function CustomCarousel({ data, renderItem, ...props }: PropsCustomCarousel) {
    return (
        <Carousel
            data={data}
            renderItem={renderItem}
            sliderWidth={screenWidth}
            {...props} // Permite que propriedades adicionais sejam passadas ao carrossel
        />
    );
};