import {IImageProps, Skeleton, Box} from 'native-base';
import React, {useContext, useEffect, useState} from 'react';
import {Image as ImageRN} from "react-native";
import ConfigContext from "../contexts/ConfigContext";

type Props = IImageProps & {
    assetId: string | undefined;
    width?: string | undefined;
    height?: string | undefined;
};

export function Image({assetId, width, height}: Props) {
    const {url_api, avatar_default} = useContext(ConfigContext);
    const [loading, setLoading] = useState(true);
    const avatarPadrao = `${url_api}/assets/${avatar_default}?fit=cover`;
    const [imageSrc, setImageSrc] = useState<string>(avatarPadrao);

    useEffect(() => {
        const userImage = assetId
            ? `${url_api}/assets/${assetId}?fit=cover`
            : avatarPadrao;
        setImageSrc(userImage);
    }, [assetId, avatar_default, url_api]);

    const handleImageLoaded = () => {
        setLoading(false);
    };

    // Extraindo o componente Skeleton como uma variável
    const loadingSkeleton = (
        <Box position={"absolute"} zIndex={9998} width={"100%"} height={height}>
            <Skeleton
                borderColor="coolGray.400"
                endColor="text.400"
                width={width}
                height={height}
                speed={2}
            />
        </Box>
    );

    return (
        <Box position={"relative"}>
            {loading && loadingSkeleton}
            <Box width={width} height={height} borderRadius={"md"}>
                <ImageRN
                    source={{uri: imageSrc}}
                    style={{width: "100%", height: "100%"}}
                    resizeMode="cover"
                    onLoadEnd={handleImageLoaded}
                />
            </Box>
        </Box>
    );
}
