import React, {useContext, useState, useEffect, useCallback, useMemo} from "react";
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
import TranslatedHeading from "@/components/Translated/TranslatedHeading";
import {VStack} from "@/components/ui/vstack";
import SectionContainer from "@/components/SectionContainer";

const HomeTabs = React.memo(() => {
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

    const headerBackgroundColor = useMemo(() => 
        scrollY.interpolate({
            inputRange: [0, 50, 100],
            outputRange: ['rgba(15, 70, 82, 0)', 'rgb(13,15,23)', 'rgb(13,15,23)'],
            extrapolate: 'clamp'
        })
    , [scrollY]);

    const handleRefresh = useCallback(() => {
        setRefreshing(true);
        // Aguarda um tempo mínimo para garantir feedback visual
        Promise.all([
            new Promise(resolve => setTimeout(resolve, 1000)),
            // Aqui você pode adicionar outras chamadas de API se necessário
        ]).then(() => {
            setRefreshing(false);
        });
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
            removeClippedSubviews={true}
            scrollEventThrottle={16}
            bounces={true}
            showsVerticalScrollIndicator={false}
            refreshControl={
                <RefreshControl
                    refreshing={refreshing}
                    onRefresh={handleRefresh}
                    colors={[colors.primary]}
                    tintColor={colors.primary}
                    progressBackgroundColor={colors.background}
                />
            }
        >
            <Box>
                <InfoCongressCarousel 
                    refreshing={refreshing}
                    onRefresh={handleRefresh}
                />
            </Box>

            <SectionContainer
                title="Seja parceiro dessa obra"
                seeAllRoute="/(tabs)/(events)"
                icon="home"
            >
                <Box className="mx-3">
                    <SectionInfo to={'/contribua'}
                                 title={'Contribua para a UNAADEB'}
                                 description={'Faça sua doação em PIX para o congresso'}
                                 icon={'award'}
                                 bgColor={colors.secundary2}
                                 iconVariant="floating"
                    />
                </Box>
            </SectionContainer>

            <SectionContainer
                title="Destaques no tempo"
                subtitle={'kjgkjhgj'}
                seeAllRoute="/(tabs)/(events)"
                icon="home"
            >
                <BannerCarousel
                    refreshing={refreshing}
                    setRefreshing={setRefreshing}
                />
            </SectionContainer>

            <SectionContainer
                title="Destaques no tempo"
                subtitle={'kjgkjhgj'}
                seeAllRoute="/(tabs)/(events)"
                icon="home"
            >
                <BannerCarouselUsers
                    refreshing={refreshing}
                    setRefreshing={setRefreshing}
                    idRole="862a4a56-6f34-4d1f-9ddd-3585d6a71ab8"
                    showNames={true}
                />
            </SectionContainer>

            <Box className="mt-[-40px] bg-background-dark px-3 py-3">
                {/*<Box>*/}
                {/*    <SectionInfo to={'/contribua'}*/}
                {/*                 title={'Contribua para a UNAADEB'}*/}
                {/*                 description={'Faça sua doação em PIX para o congresso'}*/}
                {/*                 icon={'award'}*/}
                {/*                 bgColor={colors.secundary2}*/}
                {/*                 iconVariant="floating"*/}
                {/*    />*/}
                {/*</Box>*/}
                <Box>
                    <Box>
                        <TranslatedHeading
                            translationKey="title_coordenation_geral"
                            size={'xl'}
                            animateUpdates={true}
                        />
                    </Box>
                    <Box>
                        <BannerCarouselUsers
                            refreshing={refreshing}
                            setRefreshing={setRefreshing}
                            idRole="862a4a56-6f34-4d1f-9ddd-3585d6a71ab8"
                            showNames={true}
                        />
                    </Box>
                </Box>
                <Box>
                    <Box>
                        <TranslatedHeading
                            translationKey="diretoria_unaadeb"
                            size={'xl'}
                            animateUpdates={true}
                        />
                    </Box>
                    <Box>
                        <BannerCarouselUsers refreshing={refreshing} setRefreshing={setRefreshing}
                                             idRole={'862a4a56-6f34-4d1f-9ddd-3585d6a71ab8'}/>
                    </Box>
                </Box>

                <Box>
                    <TranslatedHeading
                        translationKey="pr_coodenadores"
                        size={'xl'}
                        animateUpdates={true}
                    />
                    <Box>
                        <BannerCarouselUsers refreshing={refreshing} setRefreshing={setRefreshing}
                                             idRole={'862a4a56-6f34-4d1f-9ddd-3585d6a71ab8'}/>
                    </Box>
                </Box>
                <VStack space={'md'} className={'mt-4'}>
                    <SectionInfo to={'/youtube'}
                                 title={'Acesse nosso canal no Youtube'}
                                 description={'Todos os vídeos do congresso'}
                                 icon={'youtube'}
                                 bgColor="#FF0000"
                                 variant="gradient"
                                 iconVariant="floating"
                    />

                    <SectionInfo
                        to="/programacao"
                        title="Programação completa"
                        description="Cronograma diário de atividades"
                        icon="clock"
                        bgColor="#2980B9" // Azul
                        variant="gradient"
                        iconVariant="floating"
                    />
                    <SectionInfo
                        to="/alimentacao"
                        title="Onde comer"
                        description="Restaurantes e lanchonetes próximos"
                        icon="coffee"
                        bgColor="#C0392B" // Vermelho
                        variant="outline"
                        iconVariant="square"
                    />
                </VStack>
                <Box>
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
});

export default HomeTabs;
