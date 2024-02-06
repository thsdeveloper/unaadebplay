import { Avatar as NativeBaseAvatar, IAvatarProps, Center, Spinner, Box, Skeleton } from 'native-base';
import { useContext, useEffect, useState } from "react";
import { Image } from "react-native";
import ConfigContext from "../contexts/ConfigContext";

type Props = IAvatarProps & {
    userAvatarID?: string;
    width: number | string;  // Permitindo que width e height sejam strings também, para compatibilidade com estilos do NativeBase
    height: number | string;
};

export function Avatar({ userAvatarID, width, height, ...rest }: Props) {
    const { url_api, avatar_default } = useContext(ConfigContext);
    const [loading, setLoading] = useState(true); // Estado para controlar a exibição do Spinner
    const defaultImage = `${url_api}/assets/${avatar_default}?fit=cover`;
    const [imageSrc, setImageSrc] = useState<string>(defaultImage);

    useEffect(() => {
        const userImage = userAvatarID ? `${url_api}/assets/${userAvatarID}?fit=cover` : defaultImage;
        setImageSrc(userImage);
    }, [userAvatarID, avatar_default, url_api]);

    const handleImageLoaded = () => {
        setLoading(false); // Desativa o loading quando a imagem é carregada
    };

    return (
            <NativeBaseAvatar width={width} height={height} {...rest}>
                {loading && (
                    <Box zIndex={1000} position={"absolute"}>
                        <Skeleton borderWidth={2} borderColor="coolGray.400" endColor="text.400" size={width} rounded="full" speed={2} />
                    </Box>
                )}
                <Image
                    source={{ uri: imageSrc }}
                    style={{ width: '100%', height: '100%', borderRadius: 100 }}
                    resizeMode="cover"
                    onLoadEnd={handleImageLoaded}  // Utiliza o evento onLoadEnd para desativar o loading
                />
            </NativeBaseAvatar>
    );
}
