import React, {useEffect, useState} from "react";
import {View, StyleSheet, useWindowDimensions, RefreshControl} from "react-native";
import {AspectRatio, Box, Text, Center, Heading, HStack, Skeleton, Pressable, Stack, FlatList, Image, VStack} from "native-base";
import { WebView } from 'react-native-webview';
import HTML from 'react-native-render-html';
import api from "../../../services/api";
import {formatTime, getImageData} from "../../../utils/directus";



export default function News({navigation}: { navigation: any }) {
    const [news, setNews] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    const { width: windowWidth } = useWindowDimensions();

    const handleRefresh = async () => {
       try {
           setNews([])
           setRefreshing(true);
           setIsLoading(true);
           const {data: {data}} = await api.get('/items/posts')
           setNews(data)
           setRefreshing(false);
           setIsLoading(false);
       }catch (e) {
           alert('erro')
           setRefreshing(false);
           setIsLoading(false);
       }
    };

    useEffect(() => {
        async function loadNews() {
            const {data: {data}} = await api.get('/items/posts')
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
            } keyExtractor={item => item.id} refreshControl={
                <RefreshControl
                    refreshing={refreshing}
                    onRefresh={handleRefresh}
                />
            }/>
        </Box>;
    };


    const CardNews = ({item}: any) => {
        const [image, setImage] = useState(null);

        useEffect(() => {
            async function loadImage() {
                const base64data = await getImageData(`/assets/${item.image}`);
                setImage(base64data)
            }

            loadImage();
        }, []);

        return (
            <Pressable>
                {({
                      isHovered,
                      isFocused,
                      isPressed
                  }) => {
                    return (
                        <Box pb={'2'} m={'2'}>
                            <Box maxW="100%" rounded="lg" overflow="hidden" borderColor="coolGray.400" borderWidth="1"  bg={isPressed ? 'coolGray.100' : isHovered ? 'coolGray.200' : 'coolGray.100'} style={{
                                transform: [{
                                    scale: isPressed ? 0.96 : 1,
                                }]
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
                                            {item.title}
                                        </Heading>
                                    </Stack>
                                    <Box>
                                        <Text textAlign={'justify'} lineHeight={'md'}>
                                            {item.description}
                                        </Text>
                                        {/*<HTML source={{ html: item.content }} contentWidth={windowWidth}/>*/}
                                    </Box>
                                    <HStack alignItems="center" space={4} justifyContent="space-between">
                                        <HStack alignItems="center">
                                            <Text color="coolGray.600" _dark={{
                                                color: "warmGray.200"
                                            }} fontWeight="400">
                                                Data: {formatTime(item.date_created)}
                                            </Text>
                                        </HStack>
                                    </HStack>
                                </Stack>
                            </Box>
                        </Box>
                    )
                }}
            </Pressable>
        )
    };

    if (isLoading) {
        return (
            <View style={styles.center}>
                <VStack w="90%" maxW="400" borderWidth="1" space={8} overflow="hidden" rounded="md" _dark={{
                    borderColor: "coolGray.500"
                }} _light={{
                    borderColor: "coolGray.200"
                }}>
                    <Skeleton h="40" />
                    <Skeleton.Text px="4" />
                    <Skeleton px="4" my="4" rounded="md" startColor="primary.100" />
                </VStack>
                <VStack w="90%" maxW="400" borderWidth="1" space={8} overflow="hidden" rounded="md" _dark={{
                    borderColor: "coolGray.500"
                }} _light={{
                    borderColor: "coolGray.200"
                }}>
                    <Skeleton h="40" />
                    <Skeleton.Text px="4" />
                    <Skeleton px="4" my="4" rounded="md" startColor="primary.100" />
                </VStack>
                <VStack w="90%" maxW="400" borderWidth="1" space={8} overflow="hidden" rounded="md" _dark={{
                    borderColor: "coolGray.500"
                }} _light={{
                    borderColor: "coolGray.200"
                }}>
                    <Skeleton h="40" />
                    <Skeleton.Text px="4" />
                    <Skeleton px="4" my="4" rounded="md" startColor="primary.100" />
                </VStack>
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