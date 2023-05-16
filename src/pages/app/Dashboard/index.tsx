import React, {useContext, useEffect, useState} from "react";
import {RefreshControl, Alert} from "react-native";
import {Box, Text, ScrollView, Stack} from "native-base";
import BannerCarousel from "../../../components/BannerCarousel";
import {getItems} from "../../../services/items";
import {BannerTypes} from "../../../types/BannerTypes";
import TranslationContext from "../../../contexts/TranslationContext";
import {Ionicons, FontAwesome5} from "@expo/vector-icons";
import colors from "../../../constants/colors";
import AlertContext from "../../../contexts/AlertContext";
import * as Updates from "expo-updates";

export default function Dashboard({navigation}: { navigation: any }) {
    const [refreshing, setRefreshing] = useState(false);
    const [banners, setBanners] = useState<BannerTypes[]>([]);
    const {t} = useContext(TranslationContext);
    const alert = useContext(AlertContext);

    const checkForUpdate = async () => {
        try {
            const update = await Updates.checkForUpdateAsync();
            if (update.isAvailable) {
                Alert.alert(
                    "Nova atualização disponível",
                    "Deseja atualizar o aplicativo agora?",
                    [
                        {
                            text: "Sim",
                            onPress: async () => {
                                await Updates.fetchUpdateAsync();
                                // ... atualiza o aplicativo ...
                                await Updates.reloadAsync();
                            }
                        },
                        {
                            text: "Não",
                        }
                    ]
                );
            }
        } catch (e) {
            // tratar erro
        }
    };
    useEffect(() => {
        checkForUpdate()
    }, []);

    useEffect(() => {
        loadBanners()
    }, []);

    const onRefresh = async () => {
        setRefreshing(true);
        await loadBanners();
        setRefreshing(false);
    };

    const loadBanners = async () => {
        const response = await getItems<BannerTypes>('banners');
        setBanners(response);
    }


    return (
        <ScrollView
            refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} title={t('text_search')}/>}>
            <Stack space={"sm"} p={2} direction={"row"} alignItems={"center"}>
                <Ionicons
                    name={'notifications'}
                    size={20}
                    color={colors.secundary}
                />
                <Text fontWeight={'medium'} fontSize={'lg'}>
                    {t('text_section_banner')}
                </Text>
            </Stack>
            <Box>
                <BannerCarousel banners={banners} navigation={navigation}/>
            </Box>
            <Stack space={"sm"} p={2} direction={"row"} alignItems={"center"}>
                <FontAwesome5
                    name={'users'}
                    size={20}
                    color={colors.secundary}
                />
                <Text fontWeight={'medium'} fontSize={'lg'}>
                    {t('text_section_diretoria')}
                </Text>
            </Stack>
            <Stack space={"sm"} p={2} direction={"row"} alignItems={"center"}>
                <FontAwesome5
                    name={'users'}
                    size={20}
                    color={colors.secundary}
                />
                <Text fontWeight={'medium'} fontSize={'lg'}>
                    {t('text_section_diretoria')}
                </Text>
            </Stack>
        </ScrollView>
    );
}