import { useContext, useEffect, useState } from "react";
import ConfigContext from "@/contexts/ConfigContext";
import { Box } from "@/components/ui/box";
import { Skeleton } from "@/components/ui/skeleton";
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
                           isOnline,
                           ...rest
                       }: AvatarProps) {
    const { url_api, avatar_default } = useContext(ConfigContext);
    const [loading, setLoading] = useState(true);
    const defaultImage = `${url_api}/assets/${avatar_default}?fit=cover&timestamp=${new Date().getTime()}`;
    const [imageSrc, setImageSrc] = useState<string>(defaultImage);

    useEffect(() => {
        const userImage = userAvatarID
            ? `${url_api}/assets/${userAvatarID}?fit=cover&timestamp=${new Date().getTime()}`
            : defaultImage;
        setImageSrc(userImage);
    }, [userAvatarID, avatar_default, url_api]);

    // Função para gerar iniciais do nome (para o fallback)
    const getInitials = (name: string) => {
        return name
            .split(' ')
            .map(part => part[0])
            .join('')
            .toUpperCase()
            .substring(0, 2);
    };

    return (
        <ComponentAvatar
            size={typeof width === 'number' ? `${width}px` : width}
            {...rest}
        >
            {loading && (
                <Box className="z-10 absolute">
                    <Skeleton
                        className="rounded-full border-2 border-gray-400"
                        width={width}
                        height={height}
                        startColor="gray.200"
                        endColor="gray.400"
                    />
                </Box>
            )}

            <AvatarImage
                source={{ uri: imageSrc }}
                onLoadStart={() => setLoading(true)}
                onLoad={() => setLoading(false)}
                alt={name || "User avatar"}
            />

            {/* Fallback text que aparece se a imagem falhar ao carregar */}
            <AvatarFallbackText>{getInitials(name)}</AvatarFallbackText>

            {/* Badge para indicar status online (opcional) */}
            {isOnline !== undefined && (
                <AvatarBadge className={isOnline ? "bg-green-500" : "bg-gray-400"} />
            )}
        </ComponentAvatar>
    );
}
