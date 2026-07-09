import React, { useEffect, useState } from 'react';
import { View, Text as RNText, Pressable, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { useAnimatedStyle, useSharedValue, withSpring, withRepeat, withTiming, Easing } from 'react-native-reanimated';
import { ArrowRight, Sparkles } from 'lucide-react-native';
import { getUsers } from '@/services/user';
import type { UserTypes } from '@/types/UserTypes';
import { MemberAvatar } from '@/components/users/MemberAvatar';
import { SHEET } from '@/constants/sheetTokens';

const STACK_MAX = 4;
const AV_SIZE = 42;
const OVERLAP = 14; // quanto cada avatar sobrepõe o anterior

/**
 * CTA de comunidade no rodapé da Home. Mostra uma pilha viva de avatares reais
 * (diretório seguro) + headline e leva ao diretório de membros. Padrão SHEET (dark),
 * com brilho de marca, animação de entrada e feedback de toque (mola).
 */
const CommunityCTA = () => {
  const router = useRouter();
  const [users, setUsers] = useState<UserTypes[]>([]);
  const [loading, setLoading] = useState(true);

  const scale = useSharedValue(1);
  const shine = useSharedValue(0);

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const list = await getUsers({ limit: 8 } as any);
        if (alive) setUsers(list ?? []);
      } catch (e) {
        console.error('CommunityCTA: erro ao carregar membros', e);
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => { alive = false; };
  }, []);

  // Brilho pulsante sutil no ícone de faísca.
  useEffect(() => {
    shine.value = withRepeat(withTiming(1, { duration: 2200, easing: Easing.inOut(Easing.ease) }), -1, true);
  }, [shine]);

  const cardStyle = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));
  const sparkStyle = useAnimatedStyle(() => ({ opacity: 0.6 + shine.value * 0.4, transform: [{ scale: 0.92 + shine.value * 0.16 }] }));

  const onPressIn = () => { scale.value = withSpring(0.97, { damping: 18, stiffness: 260 }); };
  const onPressOut = () => { scale.value = withSpring(1, { damping: 14, stiffness: 220 }); };
  const go = () => router.push('/(tabs)/(home)/users');

  const shown = users.slice(0, STACK_MAX);
  const extra = Math.max(0, users.length - shown.length);

  // Largura explícita da pilha (filhos são absolutos → não contribuem p/ o layout).
  const slotCount = loading && users.length === 0 ? STACK_MAX : shown.length + (extra > 0 ? 1 : 0);
  const stackWidth = slotCount > 0 ? (slotCount - 1) * (AV_SIZE - OVERLAP) + AV_SIZE : 0;

  return (
    <Animated.View style={cardStyle}>
      <Pressable
        onPress={go}
        onPressIn={onPressIn}
        onPressOut={onPressOut}
        accessibilityRole="button"
        accessibilityLabel="Ver a comunidade de membros"
        style={st.card}
      >
        <LinearGradient
          colors={['rgba(229,28,68,0.22)', 'rgba(56,189,248,0.10)', 'rgba(17,24,39,0)']}
          locations={[0, 0.5, 1]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={StyleSheet.absoluteFill}
          pointerEvents="none"
        />

        <View style={st.eyebrowRow}>
          <Animated.View style={sparkStyle}>
            <Sparkles size={13} color={SHEET.gold} />
          </Animated.View>
          <RNText style={st.eyebrow}>COMUNIDADE UNAADEB</RNText>
        </View>

        <RNText style={st.headline}>Junte-se a milhares de adolescentes com propósito</RNText>

        <View style={st.bottomRow}>
          {/* Pilha de avatares */}
          <View style={[st.stack, { width: stackWidth }]}>
            {loading && users.length === 0
              ? Array.from({ length: STACK_MAX }).map((_, i) => (
                  <View
                    key={`sk-${i}`}
                    style={[st.avatarSlot, { left: i * (AV_SIZE - OVERLAP), zIndex: STACK_MAX - i }]}
                  >
                    <View style={[st.skeleton, { width: AV_SIZE, height: AV_SIZE, borderRadius: AV_SIZE / 2 }]} />
                  </View>
                ))
              : shown.map((u, i) => (
                  <View
                    key={u.id ?? i}
                    style={[st.avatarSlot, { left: i * (AV_SIZE - OVERLAP), zIndex: STACK_MAX - i }]}
                  >
                    <MemberAvatar
                      avatar={u.avatar}
                      firstName={u.first_name}
                      lastName={u.last_name}
                      size={AV_SIZE}
                      ringColor={SHEET.surface}
                      ringWidth={2.5}
                      showPresence={false}
                    />
                  </View>
                ))}

            {extra > 0 && (
              <View
                style={[
                  st.avatarSlot,
                  st.moreBubble,
                  { left: shown.length * (AV_SIZE - OVERLAP), width: AV_SIZE, height: AV_SIZE, borderRadius: AV_SIZE / 2 },
                ]}
              >
                <RNText style={st.moreText}>+{extra}</RNText>
              </View>
            )}
          </View>

          {/* Pill de ação */}
          <View style={st.pill}>
            <RNText style={st.pillText}>Ver todos</RNText>
            <ArrowRight size={16} color={SHEET.textPrimary} />
          </View>
        </View>
      </Pressable>
    </Animated.View>
  );
};

export default CommunityCTA;

const st = StyleSheet.create({
  card: {
    borderRadius: 24,
    overflow: 'hidden',
    backgroundColor: SHEET.surface,
    borderWidth: 1,
    borderColor: SHEET.border,
    padding: 18,
  },
  eyebrowRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 8 },
  eyebrow: { color: SHEET.gold, fontSize: 11, fontWeight: '800', letterSpacing: 1.2 },
  headline: { color: SHEET.textPrimary, fontSize: 18, fontWeight: '800', lineHeight: 24, maxWidth: '92%' },
  bottomRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 18 },
  stack: { height: AV_SIZE, flexDirection: 'row', alignItems: 'center' },
  avatarSlot: { position: 'absolute', top: 0 },
  moreBubble: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: SHEET.glass,
    borderWidth: 2.5,
    borderColor: SHEET.surface,
  },
  moreText: { color: SHEET.textSecondary, fontSize: 13, fontWeight: '800' },
  skeleton: { backgroundColor: SHEET.glass, borderWidth: 2.5, borderColor: SHEET.surface },
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 14,
    height: 40,
    borderRadius: 999,
    backgroundColor: SHEET.brandTint,
    borderWidth: 1,
    borderColor: SHEET.brandRing,
  },
  pillText: { color: SHEET.textPrimary, fontSize: 14, fontWeight: '700' },
});
