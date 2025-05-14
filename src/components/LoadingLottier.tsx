import React, {useRef} from "react";
import LottieView from "lottie-react-native";
import {Center} from "@/components/ui/center";
import {Box} from "@/components/ui/box";

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
