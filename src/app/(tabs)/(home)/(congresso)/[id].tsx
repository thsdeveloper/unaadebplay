import React, {useContext, useEffect, useLayoutEffect, useState} from "react";
import {Link, useGlobalSearchParams, useNavigation} from "expo-router";
import {getItem, getItems} from "@/services/items";
import {BlurView} from "expo-blur";
import colors from "@/constants/colors";
import {Feather} from "@expo/vector-icons";
import CongressItemSkeletons from "@/components/Skeletons/CongressItemSkeletons";
import {CongressType} from "@/types/CongressType";
import {formatTime} from "@/utils/directus";
import {LinearGradient} from "expo-linear-gradient";
import CarouselItemRepertories from "@/components/CustomCarousel/CarouselItemRepertories";
import CarouselItemUsers from "@/components/CustomCarousel/CarouselItemUsers";
import CarouselItemCongress from "@/components/CustomCarousel/CarouselItemCongress";
import AlertContext from "@/contexts/AlertContext";
import {SubscribedHosTypes} from "@/types/SubscribedHosTypes";
import {useAuth} from "@/contexts/AuthContext";
import {ScrollView} from "react-native";
import {Pressable} from "@/components/ui/pressable";
import {Center} from "@/components/ui/center";
import {Box} from "@/components/ui/box";
import {HStack} from "@/components/ui/hstack";
import {Heading} from "@/components/ui/heading";
import {Button} from "@/components/ui/button";

export default function CongressoPage() {
    const [congress, setCongress] = useState<CongressType | null>(null);
    const [convidados, setConvidados] = useState<any[] | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const {id} = useGlobalSearchParams();
    const {user} = useAuth();
    const navigation = useNavigation()
    const alert = useContext(AlertContext);
    const [headerBackgroundColor, setHeaderBackgroundColor] = useState(colors.primary);
    const [isSubscribed, setIsSubscribed] = useState<boolean>(false);

    useEffect(() => {
        const checkSubscription = async () => {
            const subscribed = await isSubscribeHospedagem();
            setIsSubscribed(subscribed);
        };
        checkSubscription();
    }, [user?.id]);

    useEffect(() => {
        if (congress && congress.primary_color) {
            setHeaderBackgroundColor(congress.primary_color);
        } else {
            setHeaderBackgroundColor(colors.primary);
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
    }, []);


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
                        <Feather name="users" size={24} color={colors.white}/>
                    </Pressable>
                </Link>
            ),
        });
    }, [headerBackgroundColor, navigation]);

    const isSubscribeHospedagem = async (): Promise<boolean> => {
        try {
            const filter = {
                filter: {
                    member: {
                        _eq: user?.id, // Utiliza o operador _eq para buscar registros com user_id igual ao userId
                    },
                },
            };
            const existingRecords = await getItems<SubscribedHosTypes[]>('subscribed_hos', filter);
            return existingRecords?.length > 0;
        } catch (e) {
            alert.error(`Erro ao buscar itens: ${e}`)
            return false;
        }
    };
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
                                    finalizado
                                </Button>
                            </>
                        ) : (
                            <>
                                <Link
                                    href={`/(tabs)/(home)/(congresso)/${!isSubscribed ? 'hospedagem' : 'cartao-acesso'}`}
                                    asChild>
                                    <Button size={'lg'} colorScheme={!isSubscribed ? "danger" : "success"} leftIcon={
                                        <Feather name={!isSubscribed ? "check-circle" : "check-circle"} size={20}
                                                 color={colors.light}/>
                                    } color={colors.light} rounded={'full'} shadow={2}>
                                        {!isSubscribed ? 'Inscreva-se na Hospedagem' : 'Meu Cartão de acesso'}
                                    </Button>
                                </Link>
                            </>
                        )}
                    </Box>
                </Box>
                <Box>
                    <Box px={2} py={2} mt={2}>
                        <HStack alignItems={"center"} space={2}>
                            <Feather name="headphones" size={20} color={colors.light}/>
                            <Heading size={"md"} color={colors.light}>Ouça o
                                repertório {congress.name}</Heading>
                        </HStack>
                    </Box>
                    <CarouselItemRepertories idCongresso={congress.id}/>
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
            </ScrollView>
        </LinearGradient>
    );
};
