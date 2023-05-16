import React, {useEffect, useState} from 'react';
import { Dimensions, StyleSheet } from 'react-native';
import { Box, FlatList, Pressable, Skeleton, Text } from 'native-base';
import { LinearGradient } from 'expo-linear-gradient';

import { BannerTypes } from '../types/BannerTypes';
import { Image } from './Image';
import PaginationDots from "./PaginationDots";
import { NavigationProp, ParamListBase } from '@react-navigation/native';


const { width: screenWidth } = Dimensions.get('window');

interface PropsBanners {
    banners: BannerTypes[],
    navigation: NavigationProp<ParamListBase>;
}

const BannerCarousel = ({banners, navigation}: PropsBanners) => {
    const [loading, setLoading] = useState(true);
    const [activeIndex, setActiveIndex] = useState(0);


    useEffect(() => {
      if(banners){
          setLoading(false)
      }
    }, []);

    const handleBannerPress = (item: BannerTypes) => {
        // Adicione a lógica de navegação aqui para redirecionar o usuário para uma tela específica
        navigation.navigate(item.page_route, { id: item.id_route });
    };



    const width = screenWidth * 0.8;
    const height = 120;


    const renderItem = ({item}: any) => (
        <Pressable onPress={() => handleBannerPress(item)} ml={2}>
            <Box>
                <Image
                    borderRadius={10}
                    assetId={item.image}
                    width={String(width)}
                    height={String(height)}
                    resizeMode="cover"
                />
                <LinearGradient
                    colors={['transparent', 'rgba(0, 0, 0, 0.8)']}
                    style={styles.textBackground}
                />
                <Box position={"absolute"} bottom={4} left={4} right={4}>
                    <Text style={styles.bannerTitle}>{item.title}</Text>
                    <Text style={styles.bannerDescription}>{item.description}</Text>
                </Box>
            </Box>
        </Pressable>
    );

    const renderLoader = () => (
        <Box m={4}>
            <Skeleton width={width} height={height} />
        </Box>
    );

    return (
        <Box>
            {loading ? (
                renderLoader()
            ) : (
               <>
                   <FlatList
                       horizontal
                       data={banners}
                       renderItem={renderItem}
                       snapToInterval={screenWidth * 0.8}
                       decelerationRate="fast"
                       keyExtractor={(item: BannerTypes) => item.id}
                       contentContainerStyle={styles.flatListContainer}
                       showsHorizontalScrollIndicator={false}
                       onScroll={(event) => {
                           const newIndex = Math.round(event.nativeEvent.contentOffset.x / width);
                           if (newIndex !== activeIndex) {
                               setActiveIndex(newIndex);
                           }
                       }}
                       scrollEventThrottle={16}
                   />
                   <PaginationDots data={banners} activeIndex={activeIndex} />
               </>
            )}
        </Box>
    );
};

const styles = StyleSheet.create({
    flatListContainer: {
        flexGrow: 1,
    },
    textBackground: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        width: '100%',
        height: '30%',
        borderBottomLeftRadius: 10,
        borderBottomRightRadius: 10,
    },
    bannerTitle: {
        color: 'white',
        fontSize: 18,
        fontWeight: 'bold',
    },
    bannerDescription: {
        color: 'white',
        fontSize: 14,
    },
    dots: {
        alignSelf: 'center',
        marginTop: 8,
    },
});

export default BannerCarousel;

