import React, {useContext, useEffect, useRef, useState} from 'react';
import {Dimensions, TouchableOpacity, SafeAreaView} from 'react-native';
import {Text, Box, Heading} from 'native-base';
import {Link, useNavigation} from "expo-router";
import colors from "@/constants/colors";
import {LinearGradient} from 'expo-linear-gradient';
import {Feather} from "@expo/vector-icons";
import {Accelerometer} from 'expo-sensors';
import {getItems} from "@/services/items";
import Carousel from "react-native-snap-carousel";
import {CongressType} from "@/types/CongressType";
import CongressItemSkeletons from "@/components/Skeletons/CongressItemSkeletons";
import Animated, {useAnimatedStyle, useSharedValue, withSpring} from 'react-native-reanimated';
import AlertContext from "@/contexts/AlertContext";
import {Image} from '@/components/Image'
import {handleErrors} from "@/utils/directus";

const windowWidth = Dimensions.get('window').width;

export default function InfoCongressCarousel() {
    const [congress, setCongress] = useState<CongressType[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const alert = useContext(AlertContext)
    const carouselRef = useRef<any>(null);
    const navigate = useNavigation()

    const [activeIndex, setActiveIndex] = useState<number>();

    const tiltX = useSharedValue(0);
    const tiltY = useSharedValue(0);

    useEffect(() => {
        if (carouselRef.current && congress.length > 0) {
            if (activeIndex != null) {
                carouselRef.current.snapToItem(activeIndex, false, false);
            }
        }
    }, [activeIndex, congress.length]);

    useEffect(() => {
        const loadCongress = async () => {
            setIsLoading(true);
            try {
                const response = await getItems<CongressType[]>('congresso', {
                    sort: ['date_start']
                });
                setCongress(response);
                setActiveIndex(response.length - 1);
            } catch (e) {
                const message = handleErrors(e.errors);
                alert.error(`Error: ${message}`)
            } finally {
                setIsLoading(false);
            }
        };
        loadCongress();
    }, []);

    useEffect(() => {
        Accelerometer.setUpdateInterval(100);
        const subscription = Accelerometer.addListener(({x, y}) => {
            tiltX.value = withSpring(x * 5);
            tiltY.value = withSpring(y * 2);
        });
        return () => subscription.remove();
    }, []);


    const animatedStyle = useAnimatedStyle(() => {
        return {
            transform: [
                {rotateZ: `${tiltX.value}deg`},
                {rotateX: `${tiltY.value}deg`},
            ],
        };
    });

    const onItemChange = (index: number) => setActiveIndex(index);

    const itemComponentCongress = ({ item, index }: { item: CongressType; index: number; }) => {
        return (
            <Link href={`/(tabs)/(home)/(congresso)/${item.id}`} asChild>
                <TouchableOpacity activeOpacity={0.9}>
                    <Box flex={1} justifyContent={"center"} alignItems={"center"}>
                        <Box shadow={6} p={4}>
                            <Animated.View style={animatedStyle}>
                                <Image
                                    borderRadius={10}
                                    width={windowWidth * 0.8}
                                    height={windowWidth * 1.1}
                                    resizeMode="cover"
                                    assetId={item.poster}
                                />
                            </Animated.View>
                        </Box>
                        <Text color={colors.text}>{item.name}</Text>
                    </Box>
                    <Box alignItems={"center"} p={0}>
                        <Feather name="chevron-down" size={30} color={colors.light}/>
                    </Box>
                    <Box alignItems={"center"} pb={4}>
                        <Box alignItems={"center"} pb={4}>
                            <Heading color={colors.light}
                                     fontWeight={"extrabold"}>{item?.theme}</Heading>
                            <Heading color={colors.light}
                                     fontSize={14}>{item?.description}</Heading>
                        </Box>
                    </Box>
                </TouchableOpacity>
            </Link>
        );
    };

    return (
        <LinearGradient
            colors={!isLoading && congress.length > 0 && activeIndex !== undefined ? [`${congress[activeIndex]?.primary_color}`, `${congress[activeIndex]?.second_color}`] : [colors.primary, colors.darkRed]}
            style={{flex: 1}}>
            <SafeAreaView>
                {isLoading ? (
                    <Box alignItems={"center"} justifyContent={"center"} flex={1} shadow={6} pt={2}>
                        <CongressItemSkeletons windowWidth={windowWidth} />
                    </Box>
                ) : (
                    <>
                        <Carousel<CongressType>
                            vertical={false}
                            ref={carouselRef}
                            data={congress}
                            renderItem={itemComponentCongress}
                            onSnapToItem={onItemChange}
                            sliderWidth={windowWidth}
                            firstItem={activeIndex}
                            itemWidth={windowWidth * 0.8}
                            autoplayDelay={500}
                            autoplayInterval={3000}
                            inactiveSlideOpacity={0.4}
                            inactiveSlideScale={0.9}
                        />
                    </>
                )}
            </SafeAreaView>
        </LinearGradient>
    );
};