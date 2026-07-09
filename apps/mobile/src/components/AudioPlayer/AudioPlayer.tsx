import React, { useState } from 'react';
import { Modal } from 'react-native';
import { usePlayerControls } from '@/contexts/AudioPlayerContext';
import CollapsedView from './CollapsedView';
import ExpandedView from './ExpandedView';

/**
 * Superfície de controle do player. NÃO é dona do player (a instância vive no
 * AudioPlayerProvider, na raiz do app). Aqui só renderizamos a barra compacta
 * (BottomAccessory nativo das tabs) e a tela cheia (modal) — o áudio continua
 * tocando independente desta UI.
 */
const AudioPlayer: React.FC = () => {
  const { track } = usePlayerControls();
  const [expanded, setExpanded] = useState(false);

  if (!track) return null;

  return (
    <>
      <CollapsedView onExpand={() => setExpanded(true)} />
      <Modal
        visible={expanded}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setExpanded(false)}
      >
        <ExpandedView onClose={() => setExpanded(false)} />
      </Modal>
    </>
  );
};

export default AudioPlayer;
