import React, {useContext, useEffect, useState} from "react";
import {View, StyleSheet, RefreshControl} from "react-native";
import {Box, Button, Heading, Text, FlatList, HStack, Avatar, VStack, Spacer, ScrollView} from "native-base";
import BannerCarousel from "../../../components/BannerCarousel";
import {getItems} from "../../../services/items";
import {BannerTypes} from "../../../types/BannerTypes";
import TranslationContext from "../../../contexts/TranslationContext";

const styles = StyleSheet.create({
    container: {flex: 1, justifyContent: 'center'}
})

export default function Dashboard({navigation}: { navigation: any }) {
    const [refreshing, setRefreshing] = useState(false);
    const [banners, setBanners] = useState<BannerTypes[]>([]);
    const {t} = useContext(TranslationContext);


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
        <ScrollView refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} title={t('text_search')} />}>
            <Box p={2}>
                <Text fontWeight={'medium'} fontSize={'lg'}>
                    Descubra o que está rolando!
                </Text>
            </Box>
            <Box>
                <BannerCarousel banners={banners} />
            </Box>
        </ScrollView>
    );
}