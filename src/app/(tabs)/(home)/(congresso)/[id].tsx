import React, {useEffect, useLayoutEffect, useState} from "react";
import {Animated, SafeAreaView, TouchableOpacity} from "react-native";
import MercadoPago from "@/components/MercadoPago";
import {Box, Button, Heading, HStack, Pressable, ScrollView, Text} from "native-base";
import {Link, useGlobalSearchParams, useNavigation} from "expo-router";
import {getItem, getItems} from "@/services/items";
import {BlurView} from "expo-blur";
import colors from "@/constants/colors";
import {Feather} from "@expo/vector-icons";
import CongressItemSkeletons from "@/components/Skeletons/CongressItemSkeletons";
import {CongressType} from "@/types/CongressType";
import {formatTime} from "@/utils/directus";
import {LinearGradient} from "expo-linear-gradient";
import GlobalAudioPlayer from "@/components/GlobalAudioPlayer";
import CarouselItemRepertories from "@/components/CustomCarousel/CarouselItemRepertories";
import {GlobalQueryParams} from "@/types/GlobalQueryParamsTypes";
import CarouselItemUsers from "@/components/CustomCarousel/CarouselItemUsers";

export default function CongressoPage() {
    const [congress, setCongress] = useState<CongressType | null>(null);
    const [convidados, setConvidados] = useState<any[] | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const {id} = useGlobalSearchParams();
    const navigation = useNavigation()
    const [scrollY, setScrollY] = useState(new Animated.Value(0));

    useEffect(() => {
        const fetchCongresso = async () => {
            setLoading(true);
            try {
                const response = await getItem<CongressType>('congresso', id,{
                    fields: ['*', 'convidados.*'],
                });
                setConvidados(response.convidados)
                setCongress(response);
            } catch (error) {
                console.error(error);
            } finally {
                setLoading(false);
            }
        };
        fetchCongresso();
    }, []);


    const headerBackgroundColor = scrollY.interpolate({
        inputRange: [0, 50], // Ajuste conforme necessário
        outputRange: ['transparent', '#ff1e00'], // Substitua '#desiredColor' pela cor desejada
        extrapolate: 'clamp',
    });


    useLayoutEffect(() => {
        navigation.setOptions({
            headerBackTitle: 'Voltar',
            title: `${congress?.name}`,
            headerTintColor: colors.white,
            headerStyle: {backgroundColor: headerBackgroundColor},
            headerBackground: () => (
                <BlurView
                    style={{flex: 1}}
                    intensity={20}
                    tint={'light'}
                />
            ),
            headerRight: () => (
                <Link href={'/users'} asChild>
                    <TouchableOpacity activeOpacity={0.7} hitSlop={{top: 10, bottom: 10, left: 10, right: 10}}>
                        <Feather name="share-2" size={24} color={colors.white}/>
                    </TouchableOpacity>
                </Link>
            ),
        });
    }, [headerBackgroundColor]);

    if (loading) {
        return <CongressItemSkeletons/>;
    }

    if (!congress) {
        return <Text>Não foi possível carregar os dados do congresso.</Text>;
    }


    return (
        <Animated.ScrollView onScroll={Animated.event(
            [{nativeEvent: {contentOffset: {y: scrollY}}}],
            {useNativeDriver: false} // useNativeDriver deve ser false para animar propriedades não numéricas como backgroundColor
        )} scrollEventThrottle={16} bounces={false}>
            <LinearGradient
                colors={[`${congress?.primary_color}`, `${congress?.second_color}`]} // Usa as cores do evento ativo
                style={{flex: 1}}
            >
                <SafeAreaView>
                    <Box>
                        <Box px={4} py={4}>
                            <Heading textAlign={"center"} color={colors.text}>{congress.theme}</Heading>
                            <Text textAlign={"center"}
                                  color={colors.text}>De {formatTime(congress.date_start, 'D [de] MMMM [de] YYYY')} a {formatTime(congress.date_end, 'D [de] MMMM [de] YYYY')}</Text>

                            <Box alignItems={"center"}>
                                <Feather name="chevron-down" size={40} color={colors.light}/>
                            </Box>

                            <Box>
                                <Button rounded={'full'} backgroundColor={'red.800'} fontWeight={'bold'} width={'full'}
                                        onPress={() => console.log('hospedagem')}>Inscreva-se para a hospedagem</Button>
                            </Box>
                        </Box>



                        <Box px={4} mt={4}>
                            <HStack>
                                <HStack flex={1} space={2} justifyContent={'center'} alignItems={"center"}
                                        alignContent={"center"}>
                                    <Pressable onPress={() => console.log('Curtir')} alignItems={"center"}>
                                        <Feather name="heart" size={30} color={colors.light}/>
                                        <Text color={colors.light}>Curtir</Text>
                                    </Pressable>
                                </HStack>
                                <HStack flex={1} space={2} justifyContent={'center'} alignItems={"center"}
                                        justifyItems={"center"}>
                                    <Pressable onPress={() => console.log('Curtir')} alignItems={"center"}>
                                        <Feather name="share-2" size={30} color={colors.light}/>
                                        <Text color={colors.light}>Compartilhar</Text>
                                    </Pressable>
                                </HStack>
                                <HStack flex={1} space={2} justifyContent={'center'}>
                                    <Pressable onPress={() => console.log('Curtir')} alignItems={"center"}>
                                        <Feather name="youtube" size={30} color={colors.light}/>
                                        <Text color={colors.light}>Youtube</Text>
                                    </Pressable>
                                </HStack>
                            </HStack>
                        </Box>

                       <Box>
                           <Box px={2} py={2} mt={4}>
                               <HStack alignItems={"center"} space={2}>
                                   <Feather name="headphones" size={20} color={colors.light}/>
                                   <Heading size={"md"} color={colors.light}>Ouça o repertório {congress.name}</Heading>
                               </HStack>
                           </Box>
                           <CarouselItemRepertories id={id}/>
                       </Box>

                       <Box>
                           <Box px={2} py={2} mt={4}>
                               <HStack alignItems={"center"} space={2}>
                                   <Feather name="users" size={20} color={colors.light}/>
                                   <Heading size={"md"} color={colors.light}>Cantores e preletores</Heading>
                               </HStack>
                           </Box>
                           <CarouselItemUsers convidados={convidados} />
                       </Box>


                        <Box mt={4}>
                            <HStack alignItems={"center"} space={2}>
                                <Feather name="package" size={20} color={colors.light}/>
                                <Heading size={"md"} color={colors.light}>Mais {congress.theme}</Heading>
                            </HStack>
                        </Box>

                        <Link href={'/repertories'} asChild>
                            <Button>
                                Repertório
                            </Button>
                        </Link>
                        <Text textAlign={"center"} color={colors.text}>{congress.description}</Text>

                        <MercadoPago/>
                       {/*<Box backgroundColor={"blue.900"}>*/}
                       {/*    <Text color={colors.light}>*/}
                       {/*        {JSON.stringify(congress, null, 2)}*/}
                       {/*    </Text>*/}
                       {/*</Box>*/}
                       {/* <GlobalAudioPlayer/>*/}
                    </Box>
                </SafeAreaView>
            </LinearGradient>
        </Animated.ScrollView>
    );
};