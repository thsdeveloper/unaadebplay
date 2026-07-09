import React, { useCallback } from 'react';
import { Pressable, View, Text as RNText, StyleSheet } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withTiming, interpolateColor } from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { MemberAvatar } from './MemberAvatar';
import { SHEET } from '@/constants/sheetTokens';
import type { User } from '@/types/UserTypes';

interface UserItemProps {
  user: User;
  onPress: (user: User) => void;
  /** Nome do setor já resolvido (o UUID `user.sector` vira rótulo legível — ver useSectorMap). */
  sectorName?: string | null;
}

/** Linha compacta estilo Instagram — altura FIXA habilita getItemLayout (escala p/ milhares). */
export const USER_ITEM_HEIGHT = 64;

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

/**
 * Linha do diretório de membros no padrão Instagram × SHEET (dark): avatar circular,
 * nome em negrito + subtítulo discreto, SEM card/chevron — borda-a-borda e limpa.
 * O toque acende um leve highlight (alpha do glass) + háptico, na UI thread, sem
 * nunca esconder a linha. Só dados não-PII (avatar, nome, título, status).
 */
export const UserItem = React.memo<UserItemProps>(({ user, onPress, sectorName }) => {
  const name = [user.first_name, user.last_name].filter(Boolean).join(' ').trim() || 'Membro';
  // "Tipo de atribuição (perfil) — Setor X" (o nome do setor já vem como "Setor N").
  const roleLabel = user.title || user.location || 'Membro UNAADEB';
  const subtitle = sectorName ? `${roleLabel} — ${sectorName}` : roleLabel;

  const press = useSharedValue(0);
  // Só o ALFA muda (255,255,255: 0 → 0.06) → highlight limpo, sem flash cinza no meio.
  const rowStyle = useAnimatedStyle(() => ({
    backgroundColor: interpolateColor(press.value, [0, 1], ['rgba(255,255,255,0)', SHEET.glass]),
  }));

  const onPressIn = useCallback(() => { press.value = withTiming(1, { duration: 80 }); }, [press]);
  const onPressOut = useCallback(() => { press.value = withTiming(0, { duration: 200 }); }, [press]);
  const handlePress = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onPress(user);
  }, [onPress, user]);

  return (
    <AnimatedPressable
      onPress={handlePress}
      onPressIn={onPressIn}
      onPressOut={onPressOut}
      // Array ESTÁTICO + estilo animado (a forma `({pressed})=>[...]` some com o layout sob NativeWind).
      style={[st.row, rowStyle]}
      accessibilityRole="button"
      accessibilityLabel={`Ver perfil de ${name}`}
    >
      <MemberAvatar
        userId={user.id}
        avatar={user.avatar}
        firstName={user.first_name}
        lastName={user.last_name}
        size={52}
      />

      <View style={st.info}>
        <RNText style={st.name} numberOfLines={1}>{name}</RNText>
        <RNText style={st.subtitle} numberOfLines={1}>{subtitle}</RNText>
      </View>
    </AnimatedPressable>
  );
});

UserItem.displayName = 'UserItem';

const st = StyleSheet.create({
  row: {
    height: USER_ITEM_HEIGHT,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 16,
  },
  info: { flex: 1, gap: 2 },
  name: { color: SHEET.textPrimary, fontSize: 15, fontWeight: '700' },
  subtitle: { color: SHEET.textMuted, fontSize: 13, fontWeight: '500' },
});
