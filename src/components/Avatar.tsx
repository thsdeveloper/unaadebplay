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

    // Usar um objeto de estilo customizado se width/height forem fornecidos
    const customStyle = React.useMemo(() => {
        if (!width && !height) return null;
        return {
            width: width,
            height: height || width, // Se apenas width for fornecido, use-o para height também
        };
    }, [width, height]);

    return (
        <GluestackAvatar
            size={size}
            bgColor="$indigo600"
            {...rest}
            style={[rest.style, customStyle]}
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
