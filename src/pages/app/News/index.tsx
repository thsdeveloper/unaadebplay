import React, {useEffect, useState} from "react";
import {View, StyleSheet, Text, ActivityIndicator} from "react-native";
import {AspectRatio, Box, Center, Heading, HStack, Link, Stack, FlatList, Image} from "native-base";
import HTML from 'react-native-render-html';
import AsyncStorage from "@react-native-async-storage/async-storage";
import api from "../../../services/api";

export default function News({navigation}: { navigation: any }) {
    const [news, setNews] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        async function loadNews() {
            const {data: {data}} = await api.get('/items/blog')
            setNews(data)
            setIsLoading(false);
        }

        loadNews();
    }, [])

    useEffect(() => {
        console.log('news', news);
    }, [news]);

    const NewsList = () => {
        return <Box>
            <FlatList data={news} renderItem={({item}) =>
                <CardNews item={item} />
            } keyExtractor={item => item.id}/>
        </Box>;
    };


    const CardNews = ({item}: any) => {
        const [image, setImage] = useState(null);

        async function getImageData(url: string): Promise<string> {
            const response = await api.get(url, { responseType: 'blob' });
            const reader = new FileReader();
            reader.readAsDataURL(response.data);
            return new Promise((resolve, reject) => {
                reader.onloadend = () => {
                    const base64data = reader.result;
                    resolve(base64data as string);
                };
                reader.onerror = reject;
            });
        }
        useEffect(() => {
            async function loadImage() {
                const base64data = await getImageData(`/assets/${item.image}`);
                setImage(base64data)

                // const response = await api.get(`/assets/${item.image}`, {
                //     responseType: 'blob',
                // });
                // const reader = new FileReader();
                // reader.readAsDataURL(response.data);
                // reader.onloadend = () => {
                //     const base64data = reader.result;
                //     setImage(base64data);
                // };
            }

            loadImage();
        }, []);

        // if(image){
        //    return (
        //        <Image source={{uri: `${image}`}} alt="Alternate Text" size="xl" />
        //    )
        // }

        return (
            <Box pb={'4'} m={'2'}>
                <Box maxW="100%" rounded="lg" overflow="hidden" borderColor="coolGray.200" borderWidth="1" _dark={{
                    borderColor: "coolGray.600",
                    backgroundColor: "gray.700"
                }} _web={{
                    shadow: 2,
                    borderWidth: 0
                }} _light={{
                    backgroundColor: "gray.50"
                }}>
                    <Box>
                        <AspectRatio w="100%" ratio={16 / 9}>
                            <Image source={{uri: image}} alt="image"/>
                        </AspectRatio>

                        <Center bg="violet.500" _dark={{
                            bg: "violet.400"
                        }} _text={{
                            color: "warmGray.50",
                            fontWeight: "700",
                            fontSize: "xs"
                        }} position="absolute" bottom="0" px="3" py="1.5">
                            Notícias
                        </Center>
                    </Box>
                    <Stack p="4" space={3}>
                        <Stack space={2}>
                            <Heading size="md" ml="-1">
                                {item.title}ss
                            </Heading>
                            <Text fontSize="xs" _light={{
                                color: "violet.500"
                            }} _dark={{
                                color: "violet.400"
                            }} fontWeight="500" ml="-0.5" mt="-1">
                                The Silicon Valley of India.
                            </Text>
                        </Stack>
                            <HTML source={{ html: item.content }} />
                        <HStack alignItems="center" space={4} justifyContent="space-between">
                            <HStack alignItems="center">
                                <Text color="coolGray.600" _dark={{
                                    color: "warmGray.200"
                                }} fontWeight="400">
                                    6 mins ago
                                </Text>
                            </HStack>
                        </HStack>
                    </Stack>
                </Box>
            </Box>
        )
    };

    if (isLoading) {
        return (
            <View style={styles.center}>
                <ActivityIndicator size="large" color="#0000ff"/>
            </View>
        );
    }

    return (
        <View>
            <NewsList />
        </View>
    );
};

const styles = StyleSheet.create({
    center: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        textAlign: "center",
    },
});