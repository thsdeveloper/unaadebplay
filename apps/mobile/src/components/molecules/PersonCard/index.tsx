import React, { memo, useCallback } from 'react';
import { Text as RNText, Pressable, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';
import { MemberAvatar } from '@/components/users/MemberAvatar';
import { SHEET } from '@/constants/sheetTokens';
import type { UserTypes } from '@/types/UserTypes';

export const PERSON_CARD_WIDTH = 116;
export const PERSON_CARD_HEIGHT = 140;

interface Props {
  person: UserTypes;
  /**
   * Sobrescreve a navegação padrão (push → perfil). Ex.: dentro da própria tela de
   * perfil usamos `replace` para navegar lateralmente entre membros SEM empilhar telas.
   */
  onPress?: (person: UserTypes) => void;
}

/**
 * Card de liderança — "borderless cast row" (estilo Apple TV / Apple Music):
 * o AVATAR é o objeto (84px, protagonista) flutuando direto sobre o fundo da home,
 * com o primeiro nome calmo e o cargo como micro-label maiúsculo discreto. Sem tile,
 * sem borda, sem anel gradiente, sem pílula dourada — monocromático; a única cor é o
 * ponto verde de "ativo" (sinal semântico) e o tint das iniciais quando não há foto.
 * Toque com mola + háptico (feedback só na interação; o card fica sempre visível).
 */
export const PersonCard = memo<Props>(({ person, onPress }) => {
  const router = useRouter();
  const press = useSharedValue(0);

  const animStyle = useAnimatedStyle(() => ({
    transform: [{ scale: 1 - press.value * 0.04 }],
    opacity: 1 - press.value * 0.14,
  }));

  const onPressIn = useCallback(() => { press.value = withTiming(1, { duration: 90 }); }, [press]);
  const onPressOut = useCallback(() => { press.value = withTiming(0, { duration: 160 }); }, [press]);
  const handlePress = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (onPress) onPress(person);
    else router.push(`/(tabs)/(home)/(profile)/${person.id}` as any);
  }, [onPress, router, person]);

  const first = person.first_name || 'Membro';

  return (
    <Animated.View style={animStyle}>
      <Pressable
        onPress={handlePress}
        onPressIn={onPressIn}
        onPressOut={onPressOut}
        style={styles.card}
        accessibilityRole="button"
        accessibilityLabel={`${first} ${person.last_name ?? ''}`.trim()}
      >
        {/* Avatar protagonista — sem ringColor/ringWidth: herda o hairline nativo do
            UserAvatar (0.5px em SHEET.border), que define o círculo sobre o fundo
            escuro. A bolinha verde é PRESENÇA real (só aparece se online agora). */}
        <MemberAvatar
          userId={person.id}
          avatar={person.avatar}
          firstName={person.first_name}
          lastName={person.last_name}
          size={84}
        />

        <RNText style={styles.name} numberOfLines={1}>{first}</RNText>

        {!!person.title && (
          <RNText style={styles.role} numberOfLines={1}>{person.title}</RNText>
        )}
      </Pressable>
    </Animated.View>
  );
}, (a, b) => a.person.id === b.person.id && a.person.avatar === b.person.avatar && a.onPress === b.onPress);

PersonCard.displayName = 'PersonCard';

const styles = StyleSheet.create({
  card: {
    width: PERSON_CARD_WIDTH,
    height: PERSON_CARD_HEIGHT,
    alignItems: 'center',
    justifyContent: 'flex-start',
    paddingTop: 4,
    backgroundColor: 'transparent', // borderless: sem tile, sem borda, sem radius
  },
  name: {
    marginTop: 12,
    maxWidth: PERSON_CARD_WIDTH,
    color: SHEET.textPrimary, // #F9FAFB
    fontSize: 14,
    fontWeight: '600', // calmo/premium (era 800)
    letterSpacing: -0.1,
    lineHeight: 17,
    textAlign: 'center',
  },
  role: {
    marginTop: 3,
    maxWidth: PERSON_CARD_WIDTH,
    color: SHEET.textMuted, // #9CA3AF
    fontSize: 10.5,
    fontWeight: '600',
    letterSpacing: 0.8,
    lineHeight: 13,
    textTransform: 'uppercase',
    textAlign: 'center',
  },
});
