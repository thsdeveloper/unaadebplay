import React, {useContext, useEffect, useState} from "react";
import {RefreshControl, Alert, TouchableOpacity} from "react-native";
import {Box, Text, ScrollView, Stack, Image, VStack, HStack, Icon} from "native-base";
import BannerCarousel from "../../../components/BannerCarousel";
import TranslationContext from "../../../contexts/TranslationContext";
import colors from "../../../constants/colors";
import AlertContext from "../../../contexts/AlertContext";
import * as Updates from "expo-updates";
import BannerCarouselUsers from "../../../components/BannerCarouselUsers";
import ConfigContext from "../../../contexts/ConfigContext";
import { MaterialIcons } from '@expo/vector-icons';

export default function Dashboard({navigation}: { navigation: any }) {
    const [refreshing, setRefreshing] = useState(false);
    const {t} = useContext(TranslationContext);
    const alert = useContext(AlertContext);
    const config = useContext(ConfigContext);

    const checkForUpdate = async () => {
        if (__DEV__) {
            console.log('Cannot check for updates in development mode');
            return;
        }

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
            console.error(e); // log the error to console
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
            <Box>
                <Stack space={"sm"} mx={2} mt={2} direction={"row"} alignItems={"center"}>
                    <Text fontWeight={'bold'} fontSize={'lg'} color={colors.accent}>
                        Contribua no congresso
                    </Text>
                </Stack>
            </Box>

            <Box py={1} px={2}>
                <TouchableOpacity onPress={() => navigation.navigate('Contribua')}>
                    <Box backgroundColor={colors.secundary3} width={'100%'} height={'24'} borderRadius={4} justifyContent={"center"} alignItems={"center"}>
                       <HStack space={2} alignItems={"center"} justifyContent={"center"} px={4}>
                           <Box>
                               <Icon as={MaterialIcons} name="attach-money" size={"4xl"} color={colors.yellow} />
                               {/*<FontAwesome5 name="money-bill-wave" size={40} color={colors.yellow} />*/}
                           </Box>
                           <VStack>
                               <Text fontSize={20} fontWeight={"bold"} color={colors.text}>Seja um parceiro da UNAADEB</Text>
                               <Text color={colors.yellow}>Clique e contribua com o congresso 2023</Text>
                           </VStack>
                       </HStack>
                    </Box>
                </TouchableOpacity>
            </Box>
        </ScrollView>
    );
}