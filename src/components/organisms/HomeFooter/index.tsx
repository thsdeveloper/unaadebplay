import React from 'react';
import { View } from 'react-native';
import SectionInfo from '@/components/SectionInfo';
import AvatarGroup from '@/components/AvatarGroup';

/** Rodapé da home: doação PIX + YouTube + CTA de comunidade. Sempre presente. */
export const HomeFooter: React.FC = () => (
  <View style={{ paddingHorizontal: 12, paddingTop: 8, paddingBottom: 36 }}>
    <SectionInfo
      to="/(tabs)/(home)/contribua"
      title="Contribua para a UNAADEB"
      description="Faça sua doação em PIX para o congresso"
      icon="gift"
      bgColor="#B8860B"
      variant="gradient"
      iconVariant="floating"
    />
    <SectionInfo
      to="/(tabs)/(home)/youtube"
      title="Nosso canal no YouTube"
      description="Todos os vídeos do congresso"
      icon="youtube"
      bgColor="#FF0000"
      variant="gradient"
      iconVariant="floating"
    />
    <View style={{ marginTop: 20 }}>
      <AvatarGroup />
    </View>
  </View>
);
