import React, { useEffect } from 'react';
import { Redirect } from 'expo-router';
import { useAuth } from '@/contexts/AuthContext';
import { View, ActivityIndicator } from 'react-native';
import { Center } from '@/components/ui/center';
import { Text } from '@/components/ui/text';

export default function Index() {
  const { signed, loading, user } = useAuth();

  // Mostrar loading enquanto verifica autenticação
  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#3b82f6" />
        <Text className="mt-4 text-gray-600">Carregando...</Text>
      </View>
    );
  }

  // Se não estiver autenticado, redirecionar para login
  if (!signed || !user) {
    return <Redirect href="/(auth)/sign-in" />;
  }

  // Se estiver autenticado, redirecionar para home
  return <Redirect href="/(tabs)/(home)" />;
}