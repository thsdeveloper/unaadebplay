import React, { memo } from 'react';
import { View, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { Pressable } from '@/components/ui/pressable';
import { Text } from '@/components/ui/text';
import { Avatar } from '@/components/Avatar';
import type { UserTypes } from '@/types/UserTypes';

export const PERSON_CARD_WIDTH = 116;

interface Props {
  person: UserTypes;
}

/** Card de pessoa (liderança/equipe): avatar circular + nome + cargo. */
export const PersonCard = memo<Props>(({ person }) => {
  const router = useRouter();

  return (
    <Pressable
      onPress={() => router.push(`/(tabs)/(home)/(profile)/${person.id}` as any)}
      style={styles.container}
      accessibilityRole="button"
      accessibilityLabel={`${person.first_name} ${person.last_name ?? ''}`.trim()}
    >
      <View style={styles.avatarWrap}>
        <Avatar userAvatarID={person.avatar} name={person.first_name} size={76} />
      </View>
      <Text style={styles.name} numberOfLines={1}>{person.first_name}</Text>
      {!!person.title && <Text style={styles.role} numberOfLines={1}>{person.title}</Text>}
    </Pressable>
  );
}, (a, b) => a.person.id === b.person.id);

PersonCard.displayName = 'PersonCard';

const styles = StyleSheet.create({
  container: { width: PERSON_CARD_WIDTH, alignItems: 'center' },
  avatarWrap: {
    padding: 3,
    borderRadius: 999,
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.10)',
    marginBottom: 8,
  },
  name: { color: '#F9FAFB', fontSize: 14, fontWeight: '700', textAlign: 'center' },
  role: { color: '#D1D5DB', fontSize: 12, textAlign: 'center', marginTop: 2 },
});
