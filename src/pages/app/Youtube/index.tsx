import React, {useCallback, useEffect, useRef, useState} from "react";
import YoutubeIframe from "react-native-youtube-iframe";
import {Text, Box, ScrollView, Button, Heading} from "native-base";
import LottieView from "lottie-react-native";
import colors from "../../../constants/colors";
import {ActivityIndicator} from "react-native";
import * as ScreenOrientation from "expo-screen-orientation"
import {getItem, getItems} from "../../../services/items";
import {RepertoriesTypes} from "../../../types/RepertoriesTypes";

const YoutubePage = () => {
    const animation = useRef(null);
    const [videoReady, setVideoReady] = useState(false);
    const [youtube, setYoutube] = useState();


    useEffect(() => {
        const loadInfoYoutube = async () => {
            const responseYoutube = await getItems('youtube');
            setYoutube(responseYoutube);
        };

        loadInfoYoutube();
    }, []);



    const onFullScreenChange = useCallback((isFullScreen: boolean) => {
        if(isFullScreen){
            ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.LANDSCAPE)
        }else{
            ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.PORTRAIT)
        }
        console.log(isFullScreen)
    }, [])


    return (
        <ScrollView backgroundColor={colors.line} flex={1} px={6}>

            <Box>
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
                    <Heading fontSize={26} fontWeight={"bold"} textAlign={"center"} color={colors.text}>{youtube?.title}</Heading>
                    <Text textAlign={"center"} color={colors.text}>{youtube?.description}</Text>
                </Box>
                <Box width={'100%'}>
                    <YoutubeIframe
                        videoId={youtube?.id_youtube}
                        height={250}
                        onReady={() => setVideoReady(true)}
                        onFullScreenChange={onFullScreenChange}
                    />
                    {!videoReady && <ActivityIndicator/>}
                </Box>
                <Box>
                    <Button>{youtube?.title}</Button>
                </Box>
            </Box>
        </ScrollView>
    );
};
export default YoutubePage;