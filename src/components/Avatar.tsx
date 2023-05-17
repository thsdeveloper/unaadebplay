import {Avatar as NativeBaseAvatar, IAvatarProps, Skeleton} from 'native-base'
import {useContext, useEffect, useState} from "react";
import ConfigContext from "../contexts/ConfigContext";

type Props = IAvatarProps & {
    userAvatarID: string | undefined;
    width: number;
    height: number;
};

export function Avatar({ userAvatarID, width, height, ...rest }: Props) {
    const [URIImage, setUriImage] = useState<string | undefined>(undefined);
    const [loading, setLoading] = useState(true);
    const config = useContext(ConfigContext);

    useEffect(() => {
        async function loadImage() {
            try {
                const idAvatarDefault = await config.avatar_default;
                // Verifica se userID existem, caso contrário, usa o valor padrão idAvatarDefault
                const avatarId = await (userAvatarID) ? userAvatarID : idAvatarDefault;
                const url = `${config.url_api}/assets/${avatarId}`
                setUriImage(url)
            } catch (e) {
                setUriImage(undefined);
            } finally {
                setLoading(false);
            }
        }
        loadImage();
    }, [userAvatarID]);

    return loading ? (
        <Skeleton width={width} height={height} />
    ) : (
        <NativeBaseAvatar width={width} height={height} source={{ uri: URIImage }} {...rest} />
    );
}
