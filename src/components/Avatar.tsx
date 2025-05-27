import React, { memo, useContext, useMemo } from "react";
import ConfigContext from "@/contexts/ConfigContext";
import { useAuth } from "@/contexts/AuthContext";
import { DirectusAvatar } from "./DirectusImage/DirectusAvatar";
import {
    Avatar as GluestackAvatar,
    AvatarBadge,
    AvatarFallbackText,
    AvatarImage,
} from "@/components/ui/avatar";

type AvatarProps = {
    /** ID do asset do avatar no Directus */
    userAvatarID?: string;
    /** Largura do avatar (deprecated - use size) */
    width?: number | string;
    /** Altura do avatar (deprecated - use size) */
    height?: number | string;
    /** Nome para fallback */
    name?: string;
    /** Indicador de status online */
    isOnline?: boolean;
    /** Tamanho do avatar */
    size?: "xs" | "sm" | "md" | "lg" | "xl" | "2xl" | number;
    /** Se deve usar o novo componente DirectusAvatar */
    useDirectus?: boolean;
    /** Props adicionais */
    [key: string]: any;
};

/**
 * Componente Avatar refatorado
 * Por padrão usa o sistema Gluestack, mas pode usar DirectusAvatar
 * Mantém compatibilidade com a API anterior
 */
export const Avatar = memo<AvatarProps>(({
    userAvatarID,
    width,
    height,
    name,
    isOnline,
    size = "md",
    useDirectus = false,
    ...rest
}) => {
    const config = useContext(ConfigContext);
    const { user } = useAuth();

    // Determinar nome final para fallback
    const finalName = useMemo(() => {
        return name || user?.first_name || 'User';
    }, [name, user?.first_name]);

    // Se especificamente solicitado, usar DirectusAvatar
    if (useDirectus) {
        // Converter size string para number se necessário
        const numericSize = useMemo(() => {
            if (typeof size === 'number') return size;
            
            const sizeMap = {
                'xs': 24,
                'sm': 32,
                'md': 48,
                'lg': 64,
                'xl': 80,
                '2xl': 96
            };
            
            return sizeMap[size] || 48;
        }, [size]);

        return (
            <DirectusAvatar
                assetId={userAvatarID}
                size={numericSize}
                name={finalName}
                isOnline={isOnline}
                {...rest}
            />
        );
    }

    // Comportamento original com Gluestack UI
    const avatarUrl = useMemo(() => {
        if (!userAvatarID || !config.url_api) return null;
        return `${config.url_api}/assets/${userAvatarID}?fit=cover&timestamp=${Date.now()}`;
    }, [userAvatarID, config.url_api]);

    return (
        <GluestackAvatar
            size={typeof size === 'number' ? 'md' : size}
            {...rest}
        >
            <AvatarFallbackText>
                {finalName}
            </AvatarFallbackText>

            {avatarUrl && (
                <AvatarImage
                    source={{ uri: avatarUrl }}
                    alt={`${finalName}'s avatar`}
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
});

Avatar.displayName = 'Avatar';

// Re-exportar AvatarGroup para compatibilidade
export { AvatarGroup } from "@/components/ui/avatar";