import React, {useEffect, useRef, useState} from "react";
import colors from "@/constants/colors";
import {getItemSingleton} from "@/services/items";
import * as Linking from 'expo-linking';
import { Entypo } from '@expo/vector-icons';
import {Center} from "@/components/ui/center";
import {VStack} from "@/components/ui/vstack";
import {Box} from "@/components/ui/box";
import {Heading} from "@/components/ui/heading";
import {Button} from "@/components/ui/button";
import {Text} from "@/components/ui/text";

const YoutubePage = () => {
    const animation = useRef(null);
    const [youtube, setYoutube] = useState();

    useEffect(() => {
        const loadInfoYoutube = async () => {
            const responseYoutube = await getItemSingleton('youtube');
            console.log('responseYoutube', responseYoutube)
            setYoutube(responseYoutube);
        };

        loadInfoYoutube();
    }, []);

    const openYoutube = () => {
        if (youtube?.url) {  // Substitua 'url' pela chave que contém a URL do seu canal do YouTube no objeto retornado por getItems('youtube')
            Linking.openURL(youtube.url);
        }
    }

    return (
        <Center flex={1} px="8" backgroundColor={colors.line}>
            <VStack space={4} alignItems="center" justifyContent="center">
                <Entypo name="youtube" size={200} color={colors.primary} />
                <Box alignItems="center" justifyContent="center">
                    <Heading fontSize={26} fontWeight={"bold"} textAlign={"center"}
                             color={colors.text}>{youtube?.title}</Heading>
                    <Text>{youtube?.description}</Text>
                </Box>
                <Box>
                    <Button colorScheme={"danger"} size={"lg"} onPress={openYoutube}>Acesse nosso canal do Youtube</Button>
                    <Text>O conteúdo das nossas
                        transmissões são protegidos por direitos autorais.</Text>
                </Box>
            </VStack>
        </Center>
    );
};
export default YoutubePage;
