import React, {useContext, useEffect, useLayoutEffect, useState} from "react";
import {Box, Button, Center, Heading, HStack, Icon, IconButton, Pressable, ScrollView, Text} from "native-base";
import {Link, useGlobalSearchParams, useNavigation} from "expo-router";
import {getItem, getItems} from "@/services/items";
import {BlurView} from "expo-blur";
import colors from "@/constants/colors";
import {Entypo, Feather} from "@expo/vector-icons";
import CongressItemSkeletons from "@/components/Skeletons/CongressItemSkeletons";
import {CongressType} from "@/types/CongressType";
import {formatTime} from "@/utils/directus";
import {LinearGradient} from "expo-linear-gradient";
import GlobalAudioPlayer from "@/components/GlobalAudioPlayer";
import CarouselItemRepertories from "@/components/CustomCarousel/CarouselItemRepertories";
import {GlobalQueryParams} from "@/types/GlobalQueryParamsTypes";
import CarouselItemUsers from "@/components/CustomCarousel/CarouselItemUsers";
import CarouselItemCongress from "@/components/CustomCarousel/CarouselItemCongress";
import AlertContext from "@/contexts/AlertContext";
import {Animated} from "react-native";
import LikedIcon from "@/components/LikedIcon";
import {SafeAreaView} from 'react-native-safe-area-context';

export default function CongressoPage() {
    const [congress, setCongress] = useState<CongressType | null>(null);
    const [convidados, setConvidados] = useState<any[] | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const {id} = useGlobalSearchParams();
    const navigation = useNavigation()
    const alert = useContext(AlertContext);
    const [headerBackgroundColor, setHeaderBackgroundColor] = useState(colors.primary);

    useEffect(() => {
        if (congress && congress.primary_color) {
            setHeaderBackgroundColor(congress.primary_color);
        } else {
            setHeaderBackgroundColor(colors.primary); // Substitua 'cor_padrão' pela cor de fundo padrão do cabeçalho
        }
    }, [congress]);

    useEffect(() => {
        const fetchCongresso = async () => {
            setLoading(true);
            try {
                const response = await getItem<CongressType>('congresso', id, {
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
    }, [id]);


    useLayoutEffect(() => {
        navigation.setOptions({
            headerBackTitle: 'Voltar',
            title: congress && congress.name ? congress?.name : 'Carregando...',
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
                    <Pressable opacity={0.7} hitSlop={{top: 10, bottom: 10, left: 10, right: 10}}>
                        <Feather name="share-2" size={24} color={colors.white}/>
                    </Pressable>
                </Link>
            ),
        });
    }, [headerBackgroundColor, navigation]);

    if (loading) {
        return (
            <Center alignItems={"center"} flex={1}>
                <CongressItemSkeletons windowWidth={40}/>
            </Center>
        );
    }

    if (!congress) {
        return (
            <Center alignItems={"center"} flex={1}>
                <Text>Não foi possível carregar os dados do congresso.</Text>
            </Center>
        );
    }

    return (
        <LinearGradient colors={[`${congress?.primary_color}`, `${congress?.second_color}`]} style={{flex: 1}}>
            <ScrollView>
                <Box px={4} py={4}>
                    <Heading textAlign={"center"} color={colors.text}>{congress.theme}</Heading>
                    <Text textAlign={"center"}
                          color={colors.text}>De {formatTime(congress.date_start, 'D [de] MMMM [de] YYYY')} a {formatTime(congress.date_end, 'D [de] MMMM [de] YYYY')}</Text>

                    <Box alignItems={"center"}>
                        <Feather name="chevron-down" size={40} color={colors.light}/>
                    </Box>

                    <Box>
                        {!congress.status_hospedagem ? (
                            <>
                                <Button size={'lg'} colorScheme={'coolGray'} leftIcon={
                                    <Feather name={'lock'} size={20} color={colors.light}/>
                                } color={colors.light} rounded={'full'} shadow={2}
                                        onPress={() => alert.error('As inscrições para este período de congresso foi finalizada, por favor selecione o congresso atual')}>
                                    Inscrições Encerradas
                                </Button>
                            </>

                        ) : (
                            <>
                                <Link href={'/(tabs)/(home)/(congresso)/hospedagem'} asChild>
                                    <Button size={'lg'} colorScheme={'danger'} leftIcon={
                                        <Feather name={'plus-circle'} size={20} color={colors.light}/>
                                    } color={colors.light} rounded={'full'} shadow={2}
                                            disabled={!congress.status_hospedagem}>
                                        {!congress.status_hospedagem ? 'Inscrições Encerradas' : 'Inscreva-se para a hospedagem'}
                                    </Button>
                                </Link>

                                <Link href={'/(tabs)/(home)/(congresso)/pagamento-hospedagem'} asChild>
                                    <Button size={'lg'} colorScheme={'danger'} leftIcon={
                                        <Feather name={'plus-circle'} size={20} color={colors.light}/>
                                    } color={colors.light} rounded={'full'} shadow={2}
                                            disabled={!congress.status_hospedagem}>
                                        {!congress.status_hospedagem ? 'Inscrições Encerradas' : 'Pagamento Hospedagem'}
                                    </Button>
                                </Link>
                            </>
                        )}
                    </Box>
                </Box>

                <Box px={4} mt={4}>
                    <HStack>
                        <HStack flex={1} space={2} justifyContent={'center'} alignItems={"center"}
                                alignContent={"center"}>
                            <LikedIcon color={colors.light}/>
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
                    <Box px={2} py={2} mt={2}>
                        <HStack alignItems={"center"} space={2}>
                            <Feather name="headphones" size={20} color={colors.light}/>
                            <Heading size={"md"} color={colors.light}>Ouça o
                                repertório {congress.name}</Heading>
                        </HStack>
                    </Box>
                    <CarouselItemRepertories id={id}/>
                </Box>

                <Box>
                    <Box px={2} py={2}>
                        <HStack alignItems={"center"} space={2}>
                            <Feather name="package" size={20} color={colors.light}/>
                            <Heading size={"md"} color={colors.light}>Mais {congress.theme}</Heading>
                        </HStack>
                        <CarouselItemCongress/>
                    </Box>
                </Box>

                <Box mb={8}>
                    <Box px={2}>
                        <HStack alignItems={"center"} space={2}>
                            <Feather name="users" size={20} color={colors.light}/>
                            <Heading size={"md"} color={colors.light}>Cantores e preletores</Heading>
                        </HStack>
                    </Box>
                    <CarouselItemUsers convidados={convidados}/>
                </Box>


                {/*<Box backgroundColor={"blue.900"}>*/}
                {/*    <Text color={colors.light}>*/}
                {/*        {JSON.stringify(congress, null, 2)}*/}
                {/*    </Text>*/}
                {/*</Box>*/}
                {/*<GlobalAudioPlayer/>*/}
            </ScrollView>
        </LinearGradient>
    );
};