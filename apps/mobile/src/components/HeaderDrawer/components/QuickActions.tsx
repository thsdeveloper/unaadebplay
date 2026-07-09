import React from 'react';
import { TouchableOpacity, View, ActivityIndicator } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { Text } from '@/components/ui/text';
import { Box } from '@/components/ui/box';

interface QuickActionsProps {
  onLogout: () => void;
  onDeleteAccount: () => void;
  isLoading?: boolean;
}

export const QuickActions: React.FC<QuickActionsProps> = ({ 
  onLogout, 
  onDeleteAccount, 
  isLoading 
}) => {
  return (
    <Box className="mt-auto px-4 pb-6">
      <View className="border-t border-outline-200 dark:border-outline-800 pt-6">
        <TouchableOpacity
          onPress={onLogout}
          disabled={isLoading}
          className="bg-background-100 dark:bg-background-800 rounded-xl p-4 mb-3 flex-row items-center justify-center border border-outline-200 dark:border-outline-700"
          activeOpacity={0.7}
        >
          <Feather name="log-out" size={20} color="#6B7280" />
          <Text className="ml-3 text-typography-700 dark:text-typography-300 font-medium">
            Sair da aplicação
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          onPress={onDeleteAccount}
          disabled={isLoading}
          className="bg-error-50 dark:bg-error-900/20 border border-error-200 dark:border-error-800 rounded-xl p-4 flex-row items-center justify-center"
          activeOpacity={0.7}
        >
          {isLoading ? (
            <ActivityIndicator size="small" color="#EF4444" />
          ) : (
            <>
              <Feather name="trash-2" size={20} color="#EF4444" />
              <Text className="ml-3 text-error-600 dark:text-error-400 font-medium">
                Excluir minha conta
              </Text>
            </>
          )}
        </TouchableOpacity>
      </View>
    </Box>
  );
};