import React, { memo, useCallback, useState } from 'react';
import { Text as RNText, Pressable, StyleSheet, View } from 'react-native';
import { useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { ChevronRight } from 'lucide-react-native';
import { UserAvatar } from '@/components/atoms';
import { SheetGroup } from '@/components/molecules/SheetGroup';
import { SkeletonPulse, SkeletonBox } from '@/components/users/Skeleton';
import { SHEET } from '@/constants/sheetTokens';
import type { UserTypes } from '@/types/UserTypes';

interface LeadershipRowProps {
  person: UserTypes;
  role: string;
}

// GUARDRAIL NativeWind: o Pressable usa array de estilo ESTÁTICO (a forma de
// função é descartada pelo cssInterop). O feedback de toque vem de state +
// onPressIn/onPressOut, como SheetRow/PersonCard. Ver [[nativewind-pressable-function-style]].
const LeadershipRow = memo<LeadershipRowProps>(({ person, role }) => {
  const router = useRouter();
  const [pressed, setPressed] = useState(false);

  const fullName =
    [person.first_name, person.last_name].filter(Boolean).join(' ').trim() || 'Membro';

  const handlePress = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    // `replace` (não `push`): navega LATERALMENTE entre perfis sem empilhar telas —
    // este componente só aparece DENTRO da tela de perfil. Ver [[dedupe-profile-stack]].
    router.replace(`/(tabs)/(home)/(profile)/${person.id}` as any);
  }, [router, person.id]);

  return (
    <Pressable
      onPress={handlePress}
      onPressIn={() => setPressed(true)}
      onPressOut={() => setPressed(false)}
      accessibilityRole="button"
      accessibilityLabel={`${fullName}, ${role}`}
      style={[styles.row, pressed && styles.pressed]}
    >
      {/* userId em toda foto → o ponto de presença REAL aparece quando online. */}
      <UserAvatar
        userId={person.id}
        avatar={person.avatar}
        firstName={person.first_name}
        lastName={person.last_name}
        size={44}
      />
      <View style={styles.body}>
        <RNText style={styles.name} numberOfLines={1}>{fullName}</RNText>
        <RNText style={styles.role} numberOfLines={1}>{role}</RNText>
      </View>
      <ChevronRight size={18} color={SHEET.textFaint} />
    </Pressable>
  );
});
LeadershipRow.displayName = 'LeadershipRow';

// Linha de carregamento — mesmo layout da LeadershipRow (avatar + 2 barras).
const LeadershipSkeletonRow = () => (
  <SkeletonPulse style={styles.row}>
    <SkeletonBox style={styles.skAvatar} />
    <View style={styles.body}>
      <SkeletonBox style={styles.skName} />
      <SkeletonBox style={styles.skRole} />
    </View>
  </SkeletonPulse>
);

interface SectorLeadershipProps {
  coordinator: UserTypes | null;
  leader: UserTypes | null;
  /** Mostra o skeleton enquanto os perfis de liderança são carregados. */
  loading?: boolean;
}

/**
 * "LIDERANÇA DO SETOR" — grupo escuro (look do SheetGroup) com até duas linhas
 * tocáveis: Pastor Coordenador Setorial e Líder Setorial. Enquanto carrega, mostra
 * duas linhas de skeleton; linhas com perfil nulo são ocultadas; se ambos forem
 * nulos (e não carregando), nada é renderizado.
 */
export const SectorLeadership = memo<SectorLeadershipProps>(({ coordinator, leader, loading }) => {
  if (loading) {
    return (
      <SheetGroup title="LIDERANÇA DO SETOR">
        <LeadershipSkeletonRow />
        <LeadershipSkeletonRow />
      </SheetGroup>
    );
  }

  if (!coordinator && !leader) return null;

  return (
    <SheetGroup title="LIDERANÇA DO SETOR">
      {coordinator && (
        <LeadershipRow person={coordinator} role="Pastor Coordenador Setorial" />
      )}
      {leader && <LeadershipRow person={leader} role="Líder Setorial" />}
    </SheetGroup>
  );
});

SectorLeadership.displayName = 'SectorLeadership';

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    minHeight: 64,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  pressed: { backgroundColor: SHEET.pressed },
  body: { flex: 1 },
  name: { color: SHEET.textPrimary, fontSize: 16, fontWeight: '700' },
  role: { color: SHEET.textMuted, fontSize: 13, marginTop: 2 },
  // skeleton
  skAvatar: { width: 44, height: 44, borderRadius: 22 },
  skName: { width: '55%', height: 15, borderRadius: 7 },
  skRole: { width: '38%', height: 11, borderRadius: 6, marginTop: 8 },
});
