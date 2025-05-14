import React, {useContext, useEffect, useState} from 'react';
import {Image as ImageRN, ImageProps} from "react-native";
import ConfigContext from "../contexts/ConfigContext";
import {Skeleton} from "@/components/ui/skeleton";
import {Box} from "@/components/ui/box";

type Props = Omit<ImageProps, 'source'> & {
    assetId: string | undefined;
    width?: string | number;
    height?: string | number;
    borderRadius?: number;
};

export function Image({assetId, width, height, borderRadius, ...props}: Props) {
    // Renomeando `defaultImage` para `avatarPadrao`
    const {url_api, avatar_default} = useContext(ConfigContext);
    const [loading, setLoading] = useState(true);
    const avatarPadrao = `${url_api}/assets/${avatar_default}?fit=cover&timestamp=${new Date().getTime()}`;
    const [imageSrc, setImageSrc] = useState<string>(avatarPadrao);

    useEffect(() => {
        const userImage = assetId
            ? `${url_api}/assets/${assetId}?fit=cover&timestamp=${new Date().getTime()}`
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
                rounded={borderRadius}
            />
        </Box>
    );

    return (
        <Box position={"relative"}>
            {loading && loadingSkeleton}
            <Box width={width} height={height} borderRadius={"md"}>
                <ImageRN
                    borderRadius={borderRadius}
                    source={{uri: imageSrc}}
                    style={{width: "100%", height: "100%"}}
                    resizeMode="cover"
                    onLoadEnd={handleImageLoaded}
                    {...props}
                />
            </Box>
        </Box>
    );
}
