import React, { memo } from 'react';
import type { StyleProp, ViewStyle } from 'react-native';
import { UserAvatar } from '@/components/atoms/UserAvatar';

type AvatarSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' | number;

type AvatarProps = {
    /** Asset do avatar no Storage (mapeado p/ UserAvatar.avatar). */
    userAvatarID?: string | null;
    /** Id do usuário — habilita a PRESENÇA real (bolinha só quando online agora). */
    userId?: string | null;
    /** Nome para o fallback de iniciais. */
    name?: string | null;
    /** @deprecated Override manual — por padrão a bolinha vem da presença em tempo real. */
    isOnline?: boolean;
    /** Exibe (ou não) o indicador de presença. Default true. */
    showPresence?: boolean;
    size?: AvatarSize;
    /** @deprecated Largura/altura legadas — usadas como tamanho quando `size` não vem. */
    width?: number | string;
    height?: number | string;
    style?: StyleProp<ViewStyle>;
    /** @deprecated Sem efeito — o Avatar global é sempre o mesmo (UserAvatar). */
    useDirectus?: boolean;
    /** Compat: props antigas ignoradas silenciosamente. */
    [key: string]: any;
};

const SIZE_MAP: Record<string, number> = { xs: 24, sm: 32, md: 48, lg: 64, xl: 80, '2xl': 96 };
const toPx = (v: unknown): number | undefined => {
    const n = typeof v === 'number' ? v : parseFloat(String(v));
    return Number.isFinite(n) ? n : undefined;
};
/** Tamanho em px: `size` numérico/string explícito vence; senão cai p/ width/height legados; senão 48. */
const resolveSize = (size?: AvatarSize, width?: number | string, height?: number | string): number => {
    if (typeof size === 'number') return size;
    if (typeof size === 'string') return SIZE_MAP[size] ?? 48;
    return toPx(width) ?? toPx(height) ?? 48;
};

/**
 * Adapter de compatibilidade: preserva a API antiga (`userAvatarID`, `size` string,
 * `isOnline`) mas renderiza o Avatar GLOBAL (`UserAvatar`), unificando foto de usuário
 * no app inteiro. A bolinha de presença só acende com `userId` (presença real) — ou com
 * `isOnline` como override manual. Sem `userId`, não há dot (evita marcar o usuário errado).
 */
export const Avatar = memo<AvatarProps>(({
    userAvatarID,
    userId,
    name,
    isOnline,
    showPresence,
    size,
    width,
    height,
    style,
}) => (
    <UserAvatar
        userId={userId}
        avatar={userAvatarID}
        name={name}
        size={resolveSize(size, width, height)}
        online={isOnline}
        showPresence={showPresence}
        style={style}
    />
));

Avatar.displayName = 'Avatar';

// Re-export para compatibilidade (mantém o AvatarGroup do Gluestack usado por consumidores).
export { AvatarGroup } from '@/components/ui/avatar';
