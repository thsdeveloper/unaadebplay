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

export default function ConvidadoPage() {
    const [congress, setCongress] = useState<CongressType | null>(null);
    const [convidados, setConvidados] = useState<any[] | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const {id} = useGlobalSearchParams();
    const navigation = useNavigation()
    const [scrollY, setScrollY] = useState(new Animated.Value(0));


    // useEffect(() => {
    //     const fetchCongresso = async () => {
    //         setLoading(true);
    //         try {
    //             const response = await getItem<CongressType>('congresso', id,{
    //                 fields: ['*', 'convidados.*'],
    //             });
    //             setConvidados(response.convidados)
    //             setCongress(response);
    //         } catch (error) {
    //             console.error(error);
    //         } finally {
    //             setLoading(false);
    //         }
    //     };
    //     fetchCongresso();
    // }, [id]);

    //
    // const headerBackgroundColor = scrollY.interpolate({
    //     inputRange: [0, 50], // Ajuste conforme necessário
    //     outputRange: ['transparent', '#ff1e00'], // Substitua '#desiredColor' pela cor desejada
    //     extrapolate: 'clamp',
    // });
    //
    //
    // useLayoutEffect(() => {
    //     navigation.setOptions({
    //         headerBackTitle: 'Voltar',
    //         title: `${congress?.name}`,
    //         headerTintColor: colors.white,
    //         headerStyle: {backgroundColor: headerBackgroundColor},
    //         headerBackground: () => (
    //             <BlurView
    //                 style={{flex: 1}}
    //                 intensity={20}
    //                 tint={'light'}
    //             />
    //         ),
    //         headerRight: () => (
    //             <Link href={'/users'} asChild>
    //                 <TouchableOpacity activeOpacity={0.7} hitSlop={{top: 10, bottom: 10, left: 10, right: 10}}>
    //                     <Feather name="share-2" size={24} color={colors.white}/>
    //                 </TouchableOpacity>
    //             </Link>
    //         ),
    //     });
    // }, [headerBackgroundColor]);
    //
    // if (loading) {
    //     return <CongressItemSkeletons/>;
    // }
    //
    // if (!congress) {
    //     return <Text>Não foi possível carregar os dados do congresso.</Text>;
    // }


    return (
        <Box>
            Olá Brasil
        </Box>
    );
};