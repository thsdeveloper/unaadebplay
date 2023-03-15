import {Image as NativeBaseImage, IImageProps} from 'native-base'
import {useEffect, useState} from "react";
import {getImageData} from "../utils/directus";

type Props = IImageProps & {
    assetId?: string | undefined;
}

export function Image({assetId = undefined, ...rest}: Props) {
    const [image, setImage] = useState<string | undefined>(undefined);

    useEffect(() => {
        async function loadImage() {
           try {
               const base64data = await getImageData(`/assets/${assetId}`);
               setImage(base64data)
           }catch (e){
               setImage('https://www.madeireiraestrela.com.br/images/joomlart/demo/default.jpg')
           }
        }
        loadImage();
    }, []);

    return (
        <NativeBaseImage source={{uri: image}} {...rest} />
    )
}