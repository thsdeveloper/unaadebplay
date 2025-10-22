import { useCallback, useContext } from 'react';
import { Alert } from 'react-native';
import { useAuth } from '@/contexts/AuthContext';
import AlertContext from '@/contexts/AlertContext';
import { updateUserMe } from '@/services/user';

/**
 * Hook for managing account actions (logout, delete account)
 * Separates business logic from UI components following SOLID principles
 */
export const useAccountActions = () => {
  const { logout } = useAuth();
  const alert = useContext(AlertContext);

  const handleLogout = useCallback(() => {
    Alert.alert(
      'Sair da aplicação',
      'Tem certeza que deseja sair?',
      [
        {
          text: 'Cancelar',
          style: 'cancel',
        },
        {
          text: 'Sair',
          onPress: logout,
          style: 'destructive',
        },
      ]
    );
  }, [logout]);

  const handleDeleteAccount = useCallback(async () => {
    Alert.alert(
      'Excluir conta',
      'Deseja realmente excluir a sua conta? Essa ação não poderá ser desfeita e sua conta será excluída em até 24h.',
      [
        {
          text: 'Cancelar',
          style: 'cancel',
        },
        {
          text: 'Excluir',
          style: 'destructive',
          onPress: async () => {
            try {
              const userData = {
                status: 'suspended'
              };
              await updateUserMe(userData);

              alert.success('Solicitação de exclusão enviada com sucesso!');
              logout();
            } catch (error) {
              console.error('Error deleting account:', error);
              alert.error('Erro ao solicitar exclusão da conta. Tente novamente.');
            }
          }
        },
      ]
    );
  }, [alert, logout]);

  return {
    handleLogout,
    handleDeleteAccount,
  };
};
