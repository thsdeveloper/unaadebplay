import React, {useContext, useEffect, useState} from "react";
import {RefreshControl} from "react-native";
import {
    Box,
    Text,
    Skeleton,
    FlatList,
    VStack, useToast
} from "native-base";
import {loadNews, NewsItem} from "../../../services/news";
import {Button} from "../../../components/Button";
import {CardNews} from "../../../components/CardNews";
import TranslationContext from "../../../contexts/TranslationContext";

interface NewsProps {
    navigation: any;
}

export default function News({navigation}: NewsProps) {
    const [news, setNews] = useState<NewsItem[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [refreshing, setRefreshing] = useState<boolean>(false);
    const [error, setError] = useState<string>('');
    const toast = useToast();
    const {t} = useContext(TranslationContext);


    const handleRefresh = async () => {
        setRefreshing(true);
        await loadNews(setNews, setIsLoading, setError);
        setRefreshing(false);
    };

    useEffect(() => {
        loadNews(setNews, setIsLoading, setError);
    }, []);

    useEffect(() => {
        if (error) {
            toast.show({ title: error, bgColor: 'red.500', duration: 5000, placement: 'top' });
        }
    }, [error]);

    if (isLoading) {
        return (
            <Box p={2}>
                <VStack w="100%" maxW="500" borderWidth="1" borderColor={'muted.300'} space={8} overflow="hidden" rounded="md">
                    <Skeleton h="1/3" startColor={'muted.300'}/>
                    <Skeleton.Text px="4" startColor={'muted.300'}/>
                    <Skeleton.Text px="4" startColor={'muted.300'}/>
                    <Skeleton px="4" my="4" rounded="md" startColor="muted.300"/>
                </VStack>
            </Box>
        );
    }

    if(news.length === 0){
        return (
            <Box p={4}>
                <Button title={'Buscar notícias'} onPress={handleRefresh} isLoading={isLoading} />
                <Text>
                    OPA
                </Text>
            </Box>
        )
    }


    return (
        <Box>
            <FlatList data={news} renderItem={({item}) =>
                <CardNews post={item}/>
            } keyExtractor={(item: NewsItem) => item.id.toString()} refreshControl={
                <RefreshControl
                    title={t('text_search')}
                    refreshing={refreshing}
                    onRefresh={handleRefresh}
                />
            }/>
        </Box>
    );
}
