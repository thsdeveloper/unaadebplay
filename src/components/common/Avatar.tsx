import React, {useContext} from 'react';
import {
    Avatar as GlueAvatar,
    AvatarBadge,
    AvatarFallbackText,
    AvatarImage,
    AvatarGroup,
} from "@/components/ui/avatar";
import { Box } from "@/components/ui/box";
import { Spinner } from "@/components/ui/spinner";
import ConfigContext from "@/contexts/ConfigContext"; // Configure seu arquivo de configuração com variáveis de ambiente

type AvatarSize = "xs" | "sm" | "md" | "lg" | "xl" | "2xl" | number;

export type CommonAvatarProps = {
    // Fonte da imagem
    uri?: string;
    userAvatarID?: string; // ID do avatar no sistema
    src?: string; // URL direta da imagem
    name?: string; // Nome para fallback

    // Estilo e tamanho
    size?: AvatarSize;
    width?: number;
    height?: number;
    borderRadius?: AvatarSize;
    bgColor?: string;

    // Estado
    isLoading?: boolean;

    // Badge
    badgeProps?: {
        borderColor?: string;
        bg?: string;
        placement?: "top-right" | "top-left" | "bottom-right" | "bottom-left";
        boxSize?: number;
        content?: React.ReactNode;
    };

    // Grupo
    groupProps?: {
        avatars: Array<Omit<CommonAvatarProps, "groupProps">>;
        max?: number;
    };

    // Estilos e comportamento
    borderWidth?: number;
    borderColor?: string;
    opacity?: number;
    testID?: string;
    accessibilityLabel?: string;
};

const sizeMap = {
    "xs": 24,
    "sm": 32,
    "md": 40,
    "lg": 48,
    "xl": 56,
    "2xl": 64,
};

export const CommonAvatar: React.FC<CommonAvatarProps> = ({
                                                              // Fonte da imagem
                                                              uri,
                                                              userAvatarID,
                                                              src,
                                                              name,

                                                              // Estilo e tamanho
                                                              size = "md",
                                                              width,
                                                              height,
                                                              borderRadius,
                                                              bgColor = "$backgroundLight200",

                                                              // Estado
                                                              isLoading = false,

                                                              // Badge
                                                              badgeProps,

                                                              // Grupo
                                                              groupProps,

                                                              // Estilos e comportamento
                                                              borderWidth,
                                                              borderColor,
                                                              opacity = 1,
                                                              testID,
                                                              accessibilityLabel,
                                                          }) => {
    const config = useContext(ConfigContext);

    // Calcular dimensões baseadas no tamanho
    const computedSize = typeof size === 'number' ? size : sizeMap[size] || sizeMap.md;
    const finalWidth = width || computedSize;
    const finalHeight = height || computedSize;

    // Determinar a fonte da imagem
    const imageSource = React.useMemo(() => {
        if (src) return { uri: src };
        if (uri) return { uri };
        if (userAvatarID) {
            return { uri: `${config.url_api}/assets/${userAvatarID}` };
        }
        return null;
    }, [src, uri, userAvatarID]);

    console.log('imageSource', imageSource)

    // Gerar texto de fallback a partir do nome
    const getFallbackText = () => {
        if (!name) return "U";

        const nameParts = name.split(' ').filter(Boolean);
        if (nameParts.length === 0) return "U";
        if (nameParts.length === 1) return nameParts[0].charAt(0).toUpperCase();

        return (nameParts[0].charAt(0) + nameParts[nameParts.length - 1].charAt(0)).toUpperCase();
    };

    // Se for um grupo de avatares
    if (groupProps) {
        return (
            <AvatarGroup max={groupProps.max || 3}>
                {groupProps.avatars.map((avatarProps, index) => (
                    <CommonAvatar key={`group-avatar-${index}`} {...avatarProps} />
                ))}
            </AvatarGroup>
        );
    }

    // Avatar único
    return (
        <GlueAvatar
            size={size}
            borderRadius={borderRadius || size}
            bg={bgColor}
            borderWidth={borderWidth}
            borderColor={borderColor}
            opacity={opacity}
            testID={testID}
            accessibilityLabel={accessibilityLabel || `Avatar de ${name || 'usuário'}`}
            style={{ width: finalWidth, height: finalHeight }}
        >
            {isLoading ? (
                <Box
                    justifyContent="center"
                    alignItems="center"
                    width="100%"
                    height="100%"
                    bg={bgColor}
                >
                    <Spinner size="sm" color="$primary500" />
                </Box>
            ) : imageSource ? (
                <AvatarImage
                    source={imageSource}
                    width="100%"
                    height="100%"
                    fallbackSource={{ uri: 'https://via.placeholder.com/150' }}
                />
            ) : (
                <AvatarFallbackText>{getFallbackText()}</AvatarFallbackText>
            )}

            {badgeProps && (
                <AvatarBadge
                    bg={badgeProps.bg || "$success500"}
                    borderColor={badgeProps.borderColor || "$white"}
                    placement={badgeProps.placement || "bottom-right"}
                    boxSize={badgeProps.boxSize || 12}
                >
                    {badgeProps.content}
                </AvatarBadge>
            )}
        </GlueAvatar>
    );
};

// Re-exportar componentes para uso quando necessário
export { AvatarBadge, AvatarFallbackText, AvatarGroup, AvatarImage };

// Exportar o componente como padrão
export default CommonAvatar;
