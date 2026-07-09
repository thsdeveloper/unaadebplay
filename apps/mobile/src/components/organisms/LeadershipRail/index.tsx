import React from 'react';
import { MediaRail } from '@/components/organisms/MediaRail';
import { PersonCard, PERSON_CARD_WIDTH, PERSON_CARD_HEIGHT } from '@/components/molecules/PersonCard';
import type { Slice } from '@/hooks/useHomeFeed';
import type { UserTypes } from '@/types/UserTypes';

interface Props {
  slice: Slice<UserTypes[]>;
}

/**
 * Rail de liderança. Só aparece com >= 3 perfis — abaixo disso vira uma prateleira
 * rala, então some (o CTA "comunidade" do rodapé cobre o convite à equipe).
 */
export const LeadershipRail: React.FC<Props> = ({ slice }) => {
  const status = slice.status === 'ready' && slice.data.length < 3 ? 'empty' : slice.status;

  return (
    <MediaRail<UserTypes>
      title="Liderança"
      icon="award"
      data={slice.data}
      status={status}
      cardWidth={PERSON_CARD_WIDTH}
      cardHeight={PERSON_CARD_HEIGHT}
      gap={14}
      keyExtractor={(u) => u.id}
      renderCard={(u) => <PersonCard person={u} />}
      seeAllRoute="/(tabs)/(home)/users"
    />
  );
};
