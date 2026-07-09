import React, { memo, useCallback } from 'react';
import { Text as RNText, View, StyleSheet, FlatList, type ListRenderItem } from 'react-native';
import { useRouter } from 'expo-router';
import { PersonCard, PERSON_CARD_WIDTH, PERSON_CARD_HEIGHT } from '@/components/molecules/PersonCard';
import { SkeletonPulse, SkeletonBox } from '@/components/users/Skeleton';
import { SHEET } from '@/constants/sheetTokens';
import type { UserTypes } from '@/types/UserTypes';

interface SameSectorMembersProps {
  members: UserTypes[];
  /** Mostra o skeleton (título + cards) enquanto os membros são carregados. */
  loading?: boolean;
}

// Carrossel de carregamento: título + 4 cards no tamanho do PersonCard.
const MembersSkeleton = () => (
  <View style={styles.section}>
    <SkeletonPulse><SkeletonBox style={styles.skTitle} /></SkeletonPulse>
    <View style={styles.skRow}>
      {[0, 1, 2, 3].map((i) => (
        <SkeletonPulse key={i}><SkeletonBox style={styles.skCard} /></SkeletonPulse>
      ))}
    </View>
  </View>
);

/**
 * "MEMBROS DO MESMO SETOR" — carrossel horizontal de PersonCard (que já leva ao
 * perfil ao toque). Faz bleed até as bordas da tela (margem negativa + padding no
 * conteúdo) para não recortar os cards. Enquanto carrega, mostra um skeleton;
 * não renderiza nada quando a lista é vazia (e não carregando).
 */
export const SameSectorMembers = memo<SameSectorMembersProps>(({ members, loading }) => {
  const router = useRouter();
  // Navegação LATERAL entre perfis: `replace` troca a tela atual em vez de empilhar,
  // então percorrer N membros mantém a pilha em [lista, perfil] (memória constante).
  const openPeer = useCallback(
    (person: UserTypes) => router.replace(`/(tabs)/(home)/(profile)/${person.id}` as any),
    [router],
  );
  const renderItem = useCallback<ListRenderItem<UserTypes>>(
    ({ item }) => <PersonCard person={item} onPress={openPeer} />,
    [openPeer],
  );
  const keyExtractor = useCallback((item: UserTypes) => item.id, []);

  if (loading) return <MembersSkeleton />;
  if (!members.length) return null;

  return (
    <View style={styles.section}>
      <RNText style={styles.title}>
        MEMBROS DO MESMO SETOR{members.length > 0 ? ` · ${members.length}` : ''}
      </RNText>
      <FlatList
        horizontal
        data={members}
        renderItem={renderItem}
        keyExtractor={keyExtractor}
        showsHorizontalScrollIndicator={false}
        style={styles.list}
        contentContainerStyle={styles.listContent}
        ItemSeparatorComponent={Separator}
      />
    </View>
  );
});

SameSectorMembers.displayName = 'SameSectorMembers';

const Separator = () => <View style={styles.separator} />;

const styles = StyleSheet.create({
  section: { gap: 8 },
  title: {
    color: SHEET.textMuted,
    fontSize: 13,
    fontWeight: '600',
    marginLeft: 4,
  },
  // Bleed até as bordas: cancela o paddingHorizontal:16 do card da tela para que
  // os itens deslizem sob as margens sem serem recortados.
  list: { marginHorizontal: -16 },
  listContent: { paddingHorizontal: 16 },
  separator: { width: 4 },
  // skeleton
  skTitle: { width: 190, height: 13, borderRadius: 6, marginLeft: 4 },
  skRow: { flexDirection: 'row', gap: 4, marginLeft: 4 },
  skCard: { width: PERSON_CARD_WIDTH, height: PERSON_CARD_HEIGHT, borderRadius: 18 },
});
