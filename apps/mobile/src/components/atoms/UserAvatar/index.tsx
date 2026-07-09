import React, { memo, useEffect, useMemo, useState } from 'react';
import { View, Text as RNText, StyleSheet, type StyleProp, type ViewStyle } from 'react-native';
import { Image } from 'expo-image';
import { getStorageUrl } from '@/services/storage';
import { useIsOnline } from '@/contexts/PresenceContext';
import { SHEET } from '@/constants/sheetTokens';

export interface UserAvatarProps {
  /** Id do usuário — habilita o indicador de presença REAL (ver PresenceContext). */
  userId?: string | null;
  avatar?: string | null;
  firstName?: string | null;
  lastName?: string | null;
  /** Nome completo alternativo (quando não há first/last) — usado só p/ iniciais. */
  name?: string | null;
  size?: number;
  /** Anel ao redor (útil p/ pilhas sobrepostas). Passe a cor do fundo atrás do avatar. */
  ringColor?: string;
  ringWidth?: number;
  /** Exibe a bolinha de presença quando o usuário está online. Default: true. */
  showPresence?: boolean;
  /** Override manual do estado online (raro; por padrão vem da presença em tempo real). */
  online?: boolean;
  /** @deprecated Antigo dot por status da conta — IGNORADO. A bolinha agora é presença real. */
  active?: boolean;
  style?: StyleProp<ViewStyle>;
}

// Paleta determinística p/ o fallback de iniciais — dá cor e vida quando não há foto.
const FALLBACK_COLORS = ['#E51C44', '#F59E0B', '#10B981', '#06B6D4', '#A855F7', '#38BDF8', '#EC4899'];

function pickColor(seed: string): string {
  let sum = 0;
  for (let i = 0; i < seed.length; i++) sum += seed.charCodeAt(i);
  return FALLBACK_COLORS[sum % FALLBACK_COLORS.length];
}

function deriveInitials(firstName?: string | null, lastName?: string | null, name?: string | null): string {
  if (firstName || lastName) {
    return ((firstName?.trim()?.[0] ?? '') + (lastName?.trim()?.[0] ?? '')).toUpperCase() || '?';
  }
  const parts = (name ?? '').trim().split(/\s+/).filter(Boolean);
  if (!parts.length) return '?';
  return ((parts[0][0] ?? '') + (parts.length > 1 ? parts[parts.length - 1][0] : '')).toUpperCase() || '?';
}

/**
 * Avatar de usuário GLOBAL (padrão SHEET dark) — a ÚNICA fonte de foto de usuário no app.
 * Foto via Supabase Storage com fallback de iniciais colorido e determinístico, anel
 * opcional (pilhas), e — o ponto central — um indicador de PRESENÇA REAL: a bolinha
 * verde só aparece quando o usuário está de fato online agora (Supabase Realtime Presence).
 * Se estiver offline, a bolinha NÃO é exibida (nada de cinza/enganoso).
 */
export const UserAvatar = memo<UserAvatarProps>(({
  userId,
  avatar,
  firstName,
  lastName,
  name,
  size = 44,
  ringColor,
  ringWidth = 2,
  showPresence = true,
  online,
  style,
}) => {
  const [failed, setFailed] = useState(false);
  const uri = useMemo(() => getStorageUrl(avatar, 'avatars'), [avatar]);
  // Zera o flag de erro quando a foto muda (senão um erro anterior prende o avatar no
  // fallback de iniciais mesmo após um upload bem-sucedido, em instâncias que não remontam).
  useEffect(() => { setFailed(false); }, [uri]);
  const initials = useMemo(() => deriveInitials(firstName, lastName, name), [firstName, lastName, name]);
  const bg = useMemo(() => pickColor(`${firstName ?? ''}${lastName ?? ''}${name ?? ''}` || '?'), [firstName, lastName, name]);

  // Presença REAL: online explícito (override) ou o conjunto de presença em tempo real.
  const presenceOnline = useIsOnline(userId);
  const isOnlineNow = online ?? presenceOnline;
  const showDot = showPresence && isOnlineNow;

  const ring = ringColor
    ? { borderWidth: ringWidth, borderColor: ringColor }
    : { borderWidth: StyleSheet.hairlineWidth, borderColor: SHEET.border };

  const dim = { width: size, height: size, borderRadius: size / 2 };
  const showImage = !!uri && !failed;

  return (
    <View style={[dim, style]}>
      {showImage ? (
        <Image
          source={{ uri: uri! }}
          style={[dim, ring]}
          contentFit="cover"
          transition={200}
          onError={() => setFailed(true)}
        />
      ) : (
        <View style={[dim, ring, styles.fallback, { backgroundColor: bg }]}>
          <RNText style={[styles.initials, { fontSize: size * 0.38 }]}>{initials}</RNText>
        </View>
      )}

      {showDot && (
        <View
          style={[
            styles.dot,
            {
              width: size * 0.28,
              height: size * 0.28,
              borderRadius: size * 0.14,
              borderWidth: Math.max(1.5, size * 0.05),
            },
          ]}
        />
      )}
    </View>
  );
});

UserAvatar.displayName = 'UserAvatar';

const styles = StyleSheet.create({
  fallback: { alignItems: 'center', justifyContent: 'center' },
  initials: { color: '#FFFFFF', fontWeight: '800', includeFontPadding: false },
  dot: {
    position: 'absolute',
    right: -1,
    bottom: -1,
    backgroundColor: SHEET.success,
    borderColor: SHEET.bg,
  },
});
