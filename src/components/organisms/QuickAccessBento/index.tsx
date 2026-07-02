import React from 'react';
import { View } from 'react-native';
import SectionContainer from '@/components/SectionContainer';
import { ActionTile } from '@/components/molecules/ActionTile';
import { QUICK_ACCESS_TILES } from '@/config/quickAccess';

const FEATURE = QUICK_ACCESS_TILES.filter((t) => t.variant === 'feature');
const COMPACT = QUICK_ACCESS_TILES.filter((t) => t.variant === 'compact');

// Pré-agrupa os tiles compactos em linhas de 2 (referência estável, nível de módulo).
const COMPACT_ROWS: (typeof COMPACT)[] = [];
for (let i = 0; i < COMPACT.length; i += 2) COMPACT_ROWS.push(COMPACT.slice(i, i + 2));

/**
 * Âncora sempre presente da home: 1 tile de destaque + grid 2x2. Independe de
 * dados — pinta instantâneo no cold start, mantendo a tela cheia mesmo com rails
 * vazios/carregando. Views planas (NUNCA lista aninhada -> sem warning de VirtualizedList).
 */
export const QuickAccessBento: React.FC = () => (
  <SectionContainer title="Acesso rápido" icon="grid" animateOnMount={false}>
    <View style={{ paddingHorizontal: 12, gap: 12 }}>
      {FEATURE.map((t) => (
        <ActionTile key={t.id} {...t} />
      ))}
      {COMPACT_ROWS.map((row, i) => (
        <View key={i} style={{ flexDirection: 'row', gap: 12 }}>
          {row.map((t) => (
            <View key={t.id} style={{ flex: 1 }}>
              <ActionTile {...t} />
            </View>
          ))}
          {row.length === 1 && <View style={{ flex: 1 }} />}
        </View>
      ))}
    </View>
  </SectionContainer>
);
