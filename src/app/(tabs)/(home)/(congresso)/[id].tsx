import React, {useEffect, useLayoutEffect, useState} from "react";
import {Animated, Text, TouchableOpacity} from "react-native";
import MercadoPago from "@/components/MercadoPago";
import {ScrollView} from "native-base";
import {Link, useGlobalSearchParams, useNavigation} from "expo-router";
import {UserTypes} from "@/types/UserTypes";
import {getItem} from "@/services/items";
import {BlurView} from "expo-blur";
import colors from "@/constants/colors";
import {Image} from "@/components/Image";
import {Feather} from "@expo/vector-icons";

export default function CongressoPage() {
    const [congress, setCongress] = useState<any>(null);
    const {id} = useGlobalSearchParams();
    const navigation = useNavigation()
    const [scrollY, setScrollY] = useState(new Animated.Value(0));


    useEffect(() => {
        const fetchCongresso = async () => {
            const response = await getItem<UserTypes>('congresso', id);
            setCongress(response);
        };

        fetchCongresso();
    }, [id]);


    const headerBackgroundColor = scrollY.interpolate({
        inputRange: [0, 50], // Ajuste conforme necessário
        outputRange: ['transparent', '#0f4652'], // Substitua '#desiredColor' pela cor desejada
        extrapolate: 'clamp',
    });


    useLayoutEffect(() => {
        navigation.setOptions({
            headerBackTitle: 'Voltar',
            title: `${congress?.name}`,
            headerTintColor: colors.white,
            headerStyle: {backgroundColor: `${congress?.primary_color}`},
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

    return (
        <ScrollView>
            <Text>Página do Congresso {id}</Text>
            <Text>Em breve mais informações sobre o congresso geral da UNAADEB 2024</Text>
            <Link href={'/repertories'}>
                Repertories {congress?.name}
            </Link>


            <Image assetId={congress?.poster} width={'20'} height={'20'}/>
            <MercadoPago/>
        </ScrollView>
    );
};