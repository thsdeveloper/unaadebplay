import {Avatar as NativeBaseAvatar, IAvatarProps} from 'native-base'
import {useEffect, useState} from "react";
import {getImageData} from "../utils/directus";

type Props = IAvatarProps & {
    assetId?: string | undefined;
}

export function Avatar({assetId = undefined, ...rest}: Props) {
    const [image, setImage] = useState<string | undefined>(undefined);

    useEffect(() => {
        if(assetId){
            async function loadImage() {
                try {
                    const base64data = await getImageData(`/assets/${assetId}`);
                    setImage(base64data)
                }catch (e){

                }
            }
            loadImage();
        }

    }, []);

    return (
        <NativeBaseAvatar source={{uri: image}} {...rest}>
            TH
        </NativeBaseAvatar>
    )
}