import React, {useEffect, useState} from 'react';
import {Dimensions, StyleSheet} from 'react-native';
import {Box, FlatList, Pressable, Skeleton, Text} from 'native-base';
import {LinearGradient} from 'expo-linear-gradient';

import {BannerTypes} from '@/types/BannerTypes';
import {Image} from '@/components/Image';
import PaginationDots from "@/components/PaginationDots";
import {getItems} from "@/services/items";
import {Link} from "expo-router";


const {width: screenWidth} = Dimensions.get('window');

interface PropsBanners {
    refreshing: any,
    setRefreshing: any
}

export default function BannerCarousel({refreshing, setRefreshing}: PropsBanners) {
    const [loading, setLoading] = useState(true);
    const [activeIndex, setActiveIndex] = useState(0);
    const [banners, setBanners] = useState<BannerTypes[]>([]);

    useEffect(() => {
        const loadBanners = async () => {
            const response = await getItems<BannerTypes>('banners').finally(() => {
                setLoading(false)
            });
            setBanners(response);
            setRefreshing(false);
        }

        loadBanners()
    }, [refreshing]);

    const width = screenWidth * 0.8;
    const height = 120;

    //navigation.navigate(item.page_route, { screen: item.screen, params: { id: item.params_id }});

    const renderItem = ({item}: any) => (
        <Link href={`/(tabs)/(events)`} asChild>
            <Pressable ml={2}>
                <Box>
                    <Image
                        borderRadius={10}
                        assetId={item.image}
                        width={String(width)}
                        height={String(height)}
                        resizeMode="cover"
                    />
                    {item.title && item.description ? (
                        <LinearGradient
                            colors={['transparent', 'rgba(0, 0, 0, 1.8)']}
                            style={styles.textBackground}
                        />
                    ) : (
                        <></>
                    )}
                    <Box position={"absolute"} bottom={4} left={4} right={4}>
                        <Text style={styles.bannerTitle}>{item.title}</Text>
                        <Text style={styles.bannerDescription}>{item.description}</Text>
                    </Box>

                </Box>
            </Pressable>
        </Link>
    );

    const renderLoader = () => (
        <Box m={4}>
            <Skeleton width={width} height={height}/>
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
                    <PaginationDots data={banners} activeIndex={activeIndex}/>
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
        height: '90%',
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
