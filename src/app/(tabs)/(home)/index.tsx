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
import SectionInfo from "@/components/SectionInfo";

export default function HomeTabs() {
    const [refreshing, setRefreshing] = useState(false);
    const {t} = useContext(TranslationContext);
    const navigation = useNavigation()
    const [scrollY, setScrollY] = useState(new Animated.Value(0));


    const headerBackgroundColor = scrollY.interpolate({
        inputRange: [0, 50],
        outputRange: ['transparent', '#0f4652'],
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
            {useNativeDriver: false} //
        )} scrollEventThrottle={16} bounces={false}>

            <Box flex={1} justifyContent="center">
                <Box>
                    <InfoCongressCarousel/>
                </Box>
            </Box>

            <Box>
                <Stack m={2} space={"sm"} direction={"row"} alignItems={"center"}>
                    <Text fontWeight={'bold'} fontSize={'lg'} color={colors.dark}>
                        {t('title_coordenation_geral')}
                    </Text>
                </Stack>
                <Box>
                    <BannerCarouselUsers refreshing={refreshing} setRefreshing={setRefreshing} idRole={'a4c63b39-f3e8-471a-9ef8-7550b09c950b'}/>
                </Box>
            </Box>
            <Box>
                <Stack m={2} space={"sm"} direction={"row"} alignItems={"center"}>
                    <Text fontWeight={'bold'} fontSize={'lg'} color={colors.dark}>
                        {t('text_section_diretoria')}
                    </Text>
                </Stack>
                <Box>
                    <BannerCarouselUsers refreshing={refreshing} setRefreshing={setRefreshing} idRole={'fb948a78-4c3e-408e-b712-327eec70ad54'}/>
                </Box>
            </Box>
            <Box pb={4}>
                <Stack space={"sm"} m={2} direction={"row"} alignItems={"center"}>
                    <Text fontWeight={'bold'} fontSize={'lg'} color={colors.dark}>
                        {t('text_section_banner')}
                    </Text>
                </Stack>
                <BannerCarousel refreshing={refreshing} setRefreshing={setRefreshing}/>
            </Box>
            <Box px={2} pb={2}>
                <SectionInfo to={'/contribua'}
                             title={'Contribua para a UNAADEB'}
                             description={'Faça sua doação em PIX para o congresso'}
                             icon={'award'}
                             bgColor={colors.secundary2}
                />
            </Box>

            <Box px={2} pb={2}>
                <SectionInfo to={'/youtube'}
                             title={'Acesse nosso canal no Youtube'}
                             description={'Todos os vídeos do congresso'}
                             icon={'youtube'}
                             bgColor={colors.accent}
                />
            </Box>


            <Box py={4} bgColor={colors.secundary2} borderTopWidth={4} borderColor={colors.darkRed}>
                <AvatarGroup/>
            </Box>
        </Animated.ScrollView>
    );
}