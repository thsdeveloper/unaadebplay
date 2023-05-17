import React, {useContext, useEffect, useState} from "react";
import {RefreshControl, Alert} from "react-native";
import {Box, Text, ScrollView, Stack} from "native-base";
import BannerCarousel from "../../../components/BannerCarousel";
import TranslationContext from "../../../contexts/TranslationContext";
import {Ionicons, FontAwesome5} from "@expo/vector-icons";
import colors from "../../../constants/colors";
import AlertContext from "../../../contexts/AlertContext";
import * as Updates from "expo-updates";
import BannerCarouselUsers from "../../../components/BannerCarouselUsers";

export default function Dashboard({navigation}: { navigation: any }) {
    const [refreshing, setRefreshing] = useState(false);
    const {t} = useContext(TranslationContext);
    const alert = useContext(AlertContext);

    const checkForUpdate = async () => {
        try {
            const update = await Updates.checkForUpdateAsync();
            if (update.isAvailable) {
                Alert.alert(
                    "Nova atualização disponível",
                    "Deseja atualizar o aplicativo UNAADEB Play agora?",
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

    const onRefresh = async () => {
        setRefreshing(true);
    };


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
                <BannerCarousel navigation={navigation} refreshing={refreshing} setRefreshing={setRefreshing}/>
            </Box>
            <Box>
                <Stack p={2} space={"sm"} direction={"row"} alignItems={"center"}>
                    <FontAwesome5
                        name={'users'}
                        size={20}
                        color={colors.secundary}
                    />
                    <Text fontWeight={'medium'} fontSize={'lg'}>
                        {t('text_section_diretoria')}
                    </Text>
                </Stack>
                <Box>
                    <BannerCarouselUsers navigation={navigation} refreshing={refreshing} setRefreshing={setRefreshing}/>
                </Box>
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
        </ScrollView>
    );
}