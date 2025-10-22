import { memo } from 'react';
import { View } from 'react-native';
import { SectionHeader } from '@/components/atoms/SectionHeader';
import { ActionMenuItem } from '@/components/molecules/ActionMenuItem';
import { cn } from '@/utils/cn';

interface AccountActionsSectionProps {
  onLogout: () => void;
  onDeleteAccount: () => void;
  className?: string;
}

export const AccountActionsSection = memo<AccountActionsSectionProps>(({
  onLogout,
  onDeleteAccount,
  className
}) => {
  return (
    <View className={cn('mb-6', className)}>
      <SectionHeader
        title="Ações da conta"
        subtitle="Gerenciar sua conta"
      />

      <ActionMenuItem
        icon="sign-out-alt"
        label="Sair da aplicação"
        description="Fazer logout da sua conta"
        onPress={onLogout}
      />

      <ActionMenuItem
        icon="trash-alt"
        label="Excluir minha conta"
        description="Sua conta será excluída em até 24h"
        variant="danger"
        onPress={onDeleteAccount}
      />
    </View>
  );
});

AccountActionsSection.displayName = 'AccountActionsSection';
