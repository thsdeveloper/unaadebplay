import React, {useContext, useState, useLayoutEffect} from "react";
import {RefreshControl, TouchableOpacity, SafeAreaView, Platform} from "react-native";
import {Box, Text, ScrollView, Stack, VStack, HStack, Icon, Heading, Divider, Button, Pressable} from "native-base";
import BannerCarousel from "@/components/BannerCarousel";
import TranslationContext from "@/contexts/TranslationContext";
import colors from "@/constants/colors";
import AlertContext from "@/contexts/AlertContext";
import BannerCarouselUsers from "@/components/BannerCarouselUsers";
import {FontAwesome5, MaterialIcons, FontAwesome, Entypo, Feather} from '@expo/vector-icons';
import AvatarGroup from "@/components/AvatarGroup";
import AppUpdateManager from "@/components/AppUpdateManager";
import EventCarousel from "@/components/EventCarousel";
import GlobalAudioPlayer from "@/components/GlobalAudioPlayer";
import {Link} from "expo-router";
import {useNavigation, useRouter} from "expo-router";
import {Avatar} from "@/components/Avatar";
import {useAuth} from "@/contexts/AuthContext";

export default function HomeTabs() {
    const [refreshing, setRefreshing] = useState(false);
    const {t} = useContext(TranslationContext);
    const alert = useContext(AlertContext);
    const navigation = useNavigation();
    const {user} = useAuth()
    const router = useRouter();

    // Estado para armazenar a cor de fundo atual
    const [backgroundColor, setBackgroundColor] = useState('corInicial');

    // Função chamada quando um item do carrossel é selecionado
    const onCarouselItemSelect = (itemColor: React.SetStateAction<string>) => {
        // Atualiza o estado da cor de fundo com a cor do item selecionado
        setBackgroundColor(itemColor);
    };

    const [activeColor, setActiveColor] = useState('#FFFFFF'); // Cor padrão

    const onRefresh = async () => {
        setRefreshing(true);
        alert.success('Atualizado!')
    };

    const events = [
        {
            name: 'UNAADEB 2020',
            posterUrl: 'https://scontent.fbsb3-1.fna.fbcdn.net/v/t1.6435-9/119518849_805134316888270_828829101745507751_n.jpg?_nc_cat=100&ccb=1-7&_nc_sid=810d5f&_nc_ohc=oQeveyjW8Q0AX_Cf7A7&_nc_ht=scontent.fbsb3-1.fna&oh=00_AfA6_PGrEAln6OwmVc4hVG5EU85VHVWX9Z2kRz2WDL70eA&oe=65FB0A12',
            color: 'blueGray.700',
        },
        {
            name: 'UNAADEB 2022',
            posterUrl: 'https://demadeb.com.br/images/Cartaz-2017-UNAADEB-final-M.jpg',
            color: 'blueGray.700',
        },
        {
            name: 'UNAADEB 2023',
            posterUrl: 'https://adeb.com.br/images/2023/06/08/Cartaz%20UMADEB%202023%20a3.jpg',
            color: 'amber.700',
        },
        {
            name: 'UNAADEB 2024',
            posterUrl: 'https://adeb.com.br/images/2023/06/08/Cartaz%20UMADEB%202023%20a3.jpg',
            color: 'amber.700',
        }
    ]

    return (
        <SafeAreaView style={{flex: 1}}>
            <ScrollView
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh}
                                                title={t('text_search')}/>} contentContainerStyle={{flexGrow: 1}}>
                <Box flex={1} backgroundColor={backgroundColor} justifyContent="center">
                    <Box>
                        <EventCarousel events={events} onActiveColorChange={onCarouselItemSelect}/>
                    </Box>

                    <Box alignItems={"center"} pt={4}>
                        <Box alignItems={"center"} pb={4}>
                            <Heading color={colors.light} fontWeight={"extrabold"}>#ChamadosParaReconstruir</Heading>
                            <Heading color={colors.light} fontSize={14}>CONGRESSO GERAL DA UNAADEB 2024</Heading>
                        </Box>
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

                <Box>
                    <GlobalAudioPlayer/>
                </Box>
            </ScrollView>
        </SafeAreaView>
    );
}
<Link href={'/youtube'}>
    <Text fontWeight={'bold'} fontSize={'lg'} color={colors.dark}>
        Youtube
    </Text>
</Link>