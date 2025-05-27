import { useState, useCallback, useMemo } from 'react';
import { Alert, Vibration } from 'react-native';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'expo-router';
import { updateUserMe } from '@/services/user';
import { MenuItem } from '../types';
import { MENU_ITEMS } from '../constants';

export const useHeaderDrawer = () => {
  const { logout, user } = useAuth();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const handleMenuItemPress = useCallback((item: MenuItem) => {
    Vibration.vibrate(10);
    router.push(item.route);
  }, [router]);

  const handleDeleteAccount = useCallback(async () => {
    Alert.alert(
      "Excluir Conta",
      "Essa ação não poderá ser desfeita. Sua conta será excluída em até 24h. Deseja continuar?",
      [
        {
          text: "Cancelar",
          style: "cancel"
        },
        {
          text: "Excluir",
          style: "destructive",
          onPress: async () => {
            try {
              setIsLoading(true);
              await updateUserMe({ status: 'suspended' });
              Alert.alert('Sucesso', 'Solicitação enviada com sucesso!');
              logout();
            } catch (error) {
              Alert.alert('Erro', 'Não foi possível processar sua solicitação.');
            } finally {
              setIsLoading(false);
            }
          }
        }
      ]
    );
  }, [logout]);

  const handleLogout = useCallback(() => {
    Vibration.vibrate(10);
    Alert.alert(
      "Sair",
      "Você tem certeza que deseja sair?",
      [
        { text: "Cancelar", style: "cancel" },
        { 
          text: "Sair", 
          style: "destructive",
          onPress: logout 
        }
      ]
    );
  }, [logout]);

  const userProfile = useMemo(() => ({
    avatar: user?.avatar,
    firstName: user?.first_name,
    lastName: user?.last_name,
    email: user?.email,
    lastAccess: user?.last_access,
    role: user?.role,
    isOnline: true,
    isPremium: user?.premium || false,
  }), [user]);

  return {
    menuItems: MENU_ITEMS,
    handleMenuItemPress,
    handleDeleteAccount,
    handleLogout,
    userProfile,
    isLoading,
  };
};