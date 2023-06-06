import React, {useEffect, useRef, useState} from "react";
import {Text, Box, Button, Heading, VStack, Center} from "native-base";
import LottieView from "lottie-react-native";
import colors from "../../../constants/colors";
import {getItems} from "../../../services/items";
import * as Linking from 'expo-linking';

const YoutubePage = () => {
    const animation = useRef(null);
    const [youtube, setYoutube] = useState();

    useEffect(() => {
        const loadInfoYoutube = async () => {
            const responseYoutube = await getItems('youtube');
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

                <Box alignItems="center" justifyContent="center">
                    <LottieView
                        autoPlay
                        loop={false}
                        ref={animation}
                        style={{
                            width: '100%',
                            height: 150,
                            aspectRatio: 1,
                        }}
                        source={youtube?.icone}
                    />
                    <Heading fontSize={26} fontWeight={"bold"} textAlign={"center"}
                             color={colors.text}>{youtube?.title}</Heading>
                    <Text textAlign={"center"} color={colors.text}>{youtube?.description}</Text>
                </Box>
                <Box>
                    <Button colorScheme={"danger"} size={"lg"} onPress={openYoutube}>Acesse nosso canal do Youtube</Button>
                    <Text pt={2} fontSize={"xs"} textAlign={"center"} color={colors.text}>O conteúdo das nossas
                        transmissões são protegidos por direitos autorais.</Text>
                </Box>
            </VStack>
        </Center>
    );
};
export default YoutubePage;
