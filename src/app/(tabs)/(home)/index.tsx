import React, {useContext, useState, useEffect} from "react";
import {TouchableOpacity, Animated} from "react-native";
import {Box, Text, Stack, VStack, HStack} from "native-base";
import BannerCarousel from "@/components/BannerCarousel";
import TranslationContext from "@/contexts/TranslationContext";
import colors from "@/constants/colors";
import BannerCarouselUsers from "@/components/BannerCarouselUsers";
import {Feather} from '@expo/vector-icons';
import AvatarGroup from "@/components/AvatarGroup";
import InfoCongressCarousel from "@/components/InfoCongressCarousel";
// import GlobalAudioPlayer from "@/components/GlobalAudioPlayer";
import {Link} from "expo-router";
import {useNavigation} from "expo-router";
import {BlurView} from 'expo-blur';

export default function HomeTabs() {
    const [refreshing, setRefreshing] = useState(false);
    const {t} = useContext(TranslationContext);
    const navigation = useNavigation()
    const [scrollY, setScrollY] = useState(new Animated.Value(0));


    const headerBackgroundColor = scrollY.interpolate({
        inputRange: [0, 50],
        outputRange: ['transparent', '#0f4652'],
        extrapolate: 'clamp',
    });

    useEffect(() => {
        navigation.setOptions({
            headerStyle: {backgroundColor: headerBackgroundColor},
            headerBackground: () => (
                <BlurView
                    style={{flex: 1}}
                    intensity={20}
                    tint={'light'}
                />
            ),
        });
    }, [headerBackgroundColor]);

    return (
        <Animated.ScrollView onScroll={Animated.event(
            [{nativeEvent: {contentOffset: {y: scrollY}}}],
            {useNativeDriver: false} // useNativeDriver deve ser false para animar propriedades não numéricas como backgroundColor
        )} scrollEventThrottle={16} bounces={false}>

            <Box flex={1} justifyContent="center">
                <Box>
                    <InfoCongressCarousel/>
                </Box>
            </Box>

            <Box>
                <Stack m={2} space={"sm"} direction={"row"} alignItems={"center"}>
                    <Text fontWeight={'bold'} fontSize={'lg'} color={colors.dark}>
                        {t('text_section_diretoria')}
                    </Text>
                </Stack>
                <Box>
                    <BannerCarouselUsers refreshing={refreshing} setRefreshing={setRefreshing}/>
                </Box>
            </Box>
            <Box>
                <Stack space={"sm"} m={2} direction={"row"} alignItems={"center"}>
                    <Text fontWeight={'bold'} fontSize={'lg'} color={colors.dark}>
                        {t('text_section_banner')}
                    </Text>
                </Stack>
                <BannerCarousel refreshing={refreshing} setRefreshing={setRefreshing}/>
            </Box>

            <Box>
                <Link href={'/contribua'} asChild>
                    <TouchableOpacity activeOpacity={0.9}>
                        <Box backgroundColor={colors.secundary3} width={'100%'} height={'24'}
                             justifyContent={"center"} alignItems={"center"}>
                            <HStack space={4} alignItems={"center"} justifyContent={"center"} px={4}>
                                <Box>
                                    <Feather name="dollar-sign" size={40} color={colors.light}/>
                                </Box>
                                <VStack>
                                    <Text fontSize={20} fontWeight={"bold"} color={colors.text}>
                                        Seja um parceiro da UNAADEB
                                    </Text>
                                    <Text color={colors.yellow}>Clique e contribua com o Congresso 2023</Text>
                                </VStack>
                            </HStack>
                        </Box>
                    </TouchableOpacity>
                </Link>
            </Box>

            <Box>
                <Link href={'/youtube'} asChild>
                    <TouchableOpacity activeOpacity={0.9}>
                        <HStack background={'muted.900'} width={'full'} flex={1} alignItems={"center"} p={4}
                                space={4}>
                            <Box>
                                <Feather name="youtube" size={40} color={colors.light}/>
                            </Box>
                            <Box>
                                <Text fontWeight={'bold'} fontSize={'2xl'} color={'muted.50'}>
                                    Acesse nosso canal
                                </Text>
                                <Text color={'muted.50'}>
                                    Todos os vídeos do congresso
                                </Text>
                            </Box>
                        </HStack>
                    </TouchableOpacity>
                </Link>
            </Box>


            <Box py={4} bgColor={colors.secundary2} borderTopWidth={4} borderColor={colors.darkRed}>
                <AvatarGroup/>
            </Box>
        </Animated.ScrollView>
    );
}