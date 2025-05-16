import {useContext, useEffect, useState} from "react";
import ConfigContext from "@/contexts/ConfigContext";
import {
    Avatar as ComponentAvatar,
    AvatarBadge,
    AvatarFallbackText,
    AvatarImage,
} from "@/components/ui/avatar";

type AvatarProps = {
    userAvatarID?: string;
    width?: number | string;
    height?: number | string;
    name?: string;
    isOnline?: boolean;
    [key: string]: any;
};

export function Avatar({
                           userAvatarID,
                           width = 40,
                           height = 40,
                           name = "",
                           isOnline = true,
                           ...rest
                       }: AvatarProps) {
    const {url_api, avatar_default} = useContext(ConfigContext);
    const defaultImage = `${url_api}/assets/${avatar_default}?fit=cover&timestamp=${new Date().getTime()}`;
    const [imageSrc, setImageSrc] = useState<string>(defaultImage);

    useEffect(() => {
        const userImage = userAvatarID
            ? `${url_api}/assets/${userAvatarID}?fit=cover&timestamp=${new Date().getTime()}`
            : defaultImage;
        setImageSrc(userImage);
    }, [userAvatarID, avatar_default, url_api]);

    return (
        <ComponentAvatar
            className={'bg-indigo-600'}
            size="xs"
            {...rest}
        >
            {/* Fallback text que aparece se a imagem falhar ao carregar */}
            <AvatarFallbackText className="text-white">{name}</AvatarFallbackText>
            <AvatarImage source={{uri: imageSrc}} />

            {/* Badge para indicar status online (opcional) */}
            {isOnline !== undefined && (
                <AvatarBadge className={isOnline ? "bg-green-500" : "bg-gray-400"}/>
            )}
        </ComponentAvatar>
    );
}
