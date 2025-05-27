import React, { memo } from 'react';
import { View } from 'react-native';
import { Text } from '@/components/ui/text';
import { EmptyStateProps } from '../types';
import { styles } from '../styles';

export const EmptyState = memo<EmptyStateProps>(({ 
  message = 'Nenhum congresso disponível' 
}) => {
  return (
    <View style={styles.emptyContainer}>
      <Text style={styles.emptyText}>{message}</Text>
    </View>
  );
});

EmptyState.displayName = 'EmptyState';