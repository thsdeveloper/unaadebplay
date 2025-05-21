import React, { useContext } from "react";
import ConfigContext from "@/contexts/ConfigContext";
import {
    Avatar as GluestackAvatar,
    AvatarBadge,
    AvatarFallbackText,
    AvatarImage,
} from "@/components/ui/avatar";
import {useAuth} from "@/contexts/AuthContext";

type AvatarProps = {
    userAvatarID?: string;
    width?: number | string;
    height?: number | string;
    name?: string;
    isOnline?: boolean;
    size?: "xs" | "sm" | "md" | "lg" | "xl" | "2xl";
    [key: string]: any;
};

export function Avatar({
                           userAvatarID,
                           width,
                           height,
                           name,
                           isOnline,
                           size = "md",
                           ...rest
                       }: AvatarProps) {
    // Usar ConfigContext para garantir que temos a URL correta
    const config = useContext(ConfigContext);
    const {user} = useAuth()

    // Construir a URL de forma mais robusta
    const avatarUrl = React.useMemo(() => {
        if (!userAvatarID || !config.url_api) return null;
        return `${config.url_api}/assets/${userAvatarID}?fit=cover&timestamp=${Date.now()}`;
    }, [userAvatarID, config.url_api]);

    return (
        <GluestackAvatar
            size={size}
            {...rest}
        >
            <AvatarFallbackText>
                {user?.first_name}
            </AvatarFallbackText>

            {avatarUrl && (
                <AvatarImage
                    source={{ uri: avatarUrl }}
                    alt={`${name || 'User'}'s avatar`}
                />
            )}

            {isOnline !== undefined && (
                <AvatarBadge
                    bgColor={isOnline ? "$green500" : "$gray400"}
                    borderColor="$white"
                    borderWidth={1}
                />
            )}
        </GluestackAvatar>
    );
}

// Reexportando o AvatarGroup
export { AvatarGroup } from "@/components/ui/avatar";
