import React, {useContext, useEffect, useState} from "react";
import {RefreshControl, Alert} from "react-native";
import {Box, Text, ScrollView, Stack, Image} from "native-base";
import BannerCarousel from "../../../components/BannerCarousel";
import TranslationContext from "../../../contexts/TranslationContext";
import colors from "../../../constants/colors";
import AlertContext from "../../../contexts/AlertContext";
import * as Updates from "expo-updates";
import BannerCarouselUsers from "../../../components/BannerCarouselUsers";
import ConfigContext from "../../../contexts/ConfigContext";
import ShareApp from "../../../components/ShareApp";

export default function Dashboard({navigation}: { navigation: any }) {
    const [refreshing, setRefreshing] = useState(false);
    const {t} = useContext(TranslationContext);
    const alert = useContext(AlertContext);
    const config = useContext(ConfigContext);

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
            <Box>
                <Stack m={2} space={"sm"} direction={"row"} alignItems={"center"}>
                    <Text fontWeight={'bold'} fontSize={'lg'} color={colors.accent}>
                        {t('text_section_diretoria')}
                    </Text>
                </Stack>
                <Box>
                    <BannerCarouselUsers navigation={navigation} refreshing={refreshing} setRefreshing={setRefreshing}/>
                </Box>
            </Box>
            <Box>
                <Stack space={"sm"} m={2} direction={"row"} alignItems={"center"}>
                    <Text fontWeight={'bold'} fontSize={'lg'} color={colors.accent}>
                        {t('text_section_banner')}
                    </Text>
                </Stack>
                <BannerCarousel navigation={navigation} refreshing={refreshing} setRefreshing={setRefreshing}/>
            </Box>
            <Box py={4} px={2}>
                <Image source={{uri: `${config.url_api}/assets/244f4c73-e676-4189-9424-7a555eb341f1`}}
                       borderRadius={10}
                       width={"full"}
                       height={'40'}/>
            </Box>
            <Box>
                <ShareApp/>
            </Box>

        </ScrollView>
    );
}