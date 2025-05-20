import React, {useContext, useState, useEffect, useCallback} from "react";
import {Alert, Animated, RefreshControl, TouchableOpacity} from "react-native";
import BannerCarousel from "@/components/BannerCarousel";
import TranslationContext from "@/contexts/TranslationContext";
import colors from "@/constants/colors";
import BannerCarouselUsers from "@/components/BannerCarouselUsers";
import AvatarGroup from "@/components/AvatarGroup";
import InfoCongressCarousel from "@/components/InfoCongressCarousel";
import {useNavigation} from "expo-router";
import {BlurView} from 'expo-blur';
import SectionInfo from "@/components/SectionInfo";
import {Box} from "@/components/ui/box";
import {Text} from "@/components/ui/text";
import {useBiometricAuth} from "@/hooks/useBiometricAuth";

export default function HomeTabs() {
    const [refreshing, setRefreshing] = useState(false);
    const {t} = useContext(TranslationContext);
    const navigation = useNavigation()
    const [scrollY, setScrollY] = useState(new Animated.Value(0));
    const {
        isBiometricAvailable,
        isBiometricEnabled,
        biometricType,
        loading: biometricLoading,
        initialized: biometricInitialized,
        saveBiometricCredentials,
        authenticateWithBiometrics,
        checkBiometricAvailability
    } = useBiometricAuth();

    const headerBackgroundColor = scrollY.interpolate({
        inputRange: [0, 50, 100],
        outputRange: ['rgba(15, 70, 82, 0)', 'rgb(13,15,23)', 'rgb(13,15,23)'],
        extrapolate: 'clamp'
    });

    // Adicionar esta função
    const handleRefresh = useCallback(() => {
        setRefreshing(true);
        // Chamar funções de atualização necessárias
        // Atualizar setTimeout apenas para demonstração, substitua pela lógica real
        setTimeout(() => {
            setRefreshing(false);
        }, 2000);
    }, []);

    useEffect(() => {
        navigation.setOptions({
            headerTransparent: true,
            headerStyle: {
                backgroundColor: 'transparent',
            },
            headerBackground: () => (
                <Animated.View
                    style={{
                        backgroundColor: headerBackgroundColor,
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                    }}
                >
                    <BlurView
                        style={{flex: 1}}
                        intensity={30}
                        tint={'dark'}
                    />
                </Animated.View>
            ),
        });
    }, [headerBackgroundColor]);

    return (
        <Animated.ScrollView
            className={'bg-background-dark'}
            onScroll={Animated.event(
                [{nativeEvent: {contentOffset: {y: scrollY}}}],
                {useNativeDriver: false}
            )}
            scrollEventThrottle={20}
            bounces={true} // Mudar para true para permitir o bounce
            showsVerticalScrollIndicator={false}
            refreshControl={
                <RefreshControl
                    refreshing={refreshing}
                    onRefresh={handleRefresh}
                    colors={[colors.light, colors.light]}
                    tintColor={colors.primary}
                    title="Atualizando..."
                    titleColor={colors.primary}
                />
            }
        >
            <Box>
                <InfoCongressCarousel/>
            </Box>

            <Box className="mt-[-40px] bg-background-dark px-4">
                <Box>
                    <Text className={'font-extrabold text-2xl text-white p-4'}>
                        {t('text_section_banner')}
                    </Text>
                </Box>
                <BannerCarousel refreshing={refreshing} setRefreshing={setRefreshing}/>
                <Box>
                    <Box>
                        <Text>
                            {t('title_coordenation_geral')}
                        </Text>
                    </Box>
                    <Box>
                        <BannerCarouselUsers refreshing={refreshing} setRefreshing={setRefreshing}
                                             idRole={'a4c63b39-f3e8-471a-9ef8-7550b09c950b'}/>
                    </Box>
                </Box>

                <Box>
                    <Box>
                        <Text>
                            {t('text_section_diretoria')}
                        </Text>
                    </Box>
                    <Box>
                        <BannerCarouselUsers refreshing={refreshing} setRefreshing={setRefreshing}
                                             idRole={'fb948a78-4c3e-408e-b712-327eec70ad54'}/>
                    </Box>
                </Box>

                <Box pb={2}>
                    <Box m={2} space={"sm"} direction={"row"} alignItems={"center"}>
                        <Text fontWeight={'bold'} fontSize={'lg'} color={colors.dark}>
                            {t('text_pr_coodenadores')}
                        </Text>
                    </Box>
                    <Box>
                        <BannerCarouselUsers refreshing={refreshing} setRefreshing={setRefreshing}
                                             idRole={'d70cd26d-07cb-4cff-9524-df3276c4f9cc'}/>
                    </Box>
                </Box>
                <Box px={2} pb={2} pt={2}>
                    <SectionInfo to={'/youtube'}
                                 title={'Acesse nosso canal no Youtube'}
                                 description={'Todos os vídeos do congresso'}
                                 icon={'youtube'}
                                 bgColor={colors.accent}
                    />
                </Box>
                <Box px={2} pb={2} pt={2}>
                    <SectionInfo to={'/contribua'}
                                 title={'Contribua para a UNAADEB'}
                                 description={'Faça sua doação em PIX para o congresso'}
                                 icon={'award'}
                                 bgColor={colors.secundary2}
                    />
                </Box>
                <Box py={4} bgColor={colors.secundary2} borderTopWidth={4} borderColor={colors.darkRed}>
                    <AvatarGroup/>
                </Box>

                <TouchableOpacity
                    onLongPress={() => {
                        checkBiometricAvailability().then(() => {
                            Alert.alert(
                                "Status da Biometria",
                                `Disponível: ${isBiometricAvailable ? "Sim" : "Não"}\n` +
                                `Habilitada: ${isBiometricEnabled ? "Sim" : "Não"}\n` +
                                `Tipo: ${biometricType}\n` +
                                `Inicializada: ${biometricInitialized ? "Sim" : "Não"}`
                            );
                        });
                    }}
                    style={{position: 'absolute', bottom: 20, right: 20, width: 40, height: 40}}
                >
                    <Text>THIAGO</Text>

                </TouchableOpacity>
            </Box>


        </Animated.ScrollView>
    );
}
