import {Box, Center} from 'native-base'
import React, {useRef} from "react";
import LottieView from "lottie-react-native";

export function LoadingLottier(){
    const animation = useRef(null);
    return (
        <Center flex={1} backgroundColor={"white"}>
            <Box alignItems="center" justifyContent="center">
                <LottieView
                    autoPlay
                    ref={animation}
                    style={{
                        width: '100%',
                        height: 400,
                        aspectRatio: 1,
                    }}
                    source={require('../../src/assets/99297-loading-files.json')}
                />
            </Box>
        </Center>
    )
}