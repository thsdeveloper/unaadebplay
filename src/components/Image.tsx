import { Image as NativeBaseImage, IImageProps, Skeleton } from 'native-base';
import {useContext, useEffect, useState} from 'react';
import ConfigContext from "../contexts/ConfigContext";

type Props = IImageProps & {
    assetId: string | undefined;
    width?: string | undefined;
    height?: string | undefined;
};

export function Image({ assetId = undefined, width = undefined, height = undefined, ...rest }: Props) {
    const [image, setImage] = useState<string | undefined>(undefined);
    const [loading, setLoading] = useState(true);
    const config = useContext(ConfigContext);

    useEffect(() => {
        if (!assetId) {
            setLoading(false);
            return;
        }

        async function loadImage() {
            try {
                setImage(`${config.url_api}/assets/${assetId}`);
            } catch (e) {
                setImage(`${config.url_api}/assets/${config.avatar_default}`);
            } finally {
                setLoading(false);
            }
        }

        loadImage();
    }, [assetId]);

    return loading ? (
        <Skeleton width={width} height={height} />
    ) : (
        <NativeBaseImage width={width} height={height} source={{ uri: image }} {...rest} />
    );
}
