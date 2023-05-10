import { Image as NativeBaseImage, IImageProps, Skeleton } from 'native-base';
import { useEffect, useState } from 'react';
import { getImageData } from '../services/AssetsService';

type Props = IImageProps & {
    assetId: string | undefined;
    width: number;
    height: number;
};

export function Image({ assetId = undefined, width, height, ...rest }: Props) {
    const [image, setImage] = useState<string | undefined>(undefined);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function loadImage() {
            try {
                const base64data = await getImageData(`/assets/${assetId}`);
                setImage(base64data);
            } catch (e) {
                setImage('https://www.madeireiraestrela.com.br/images/joomlart/demo/default.jpg');
            } finally {
                setLoading(false);
            }
        }
        loadImage();
    }, []);

    return loading ? (
        <Skeleton width={width} height={height} />
    ) : (
        <NativeBaseImage width={width} height={height} source={{ uri: image }} {...rest} />
    );
}
