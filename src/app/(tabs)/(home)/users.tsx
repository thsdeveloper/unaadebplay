import React, { useState, useCallback, useMemo } from 'react';
import { FlatList, RefreshControl, View } from 'react-native';
import { useRouter } from 'expo-router';
import { Filter, Users } from 'lucide-react-native';
import { Box } from '@/components/ui/box';
import { VStack } from '@/components/ui/vstack';
import { HStack } from '@/components/ui/hstack';
import { Text } from '@/components/ui/text';
import { Button } from '@/components/Button';
import { Badge } from '@/components/ui/badge';
import { Center } from '@/components/ui/center';
import { UserItem, UserSearchBar, UserFilters } from '@/components/users';
import UserListSkeletons from '@/components/Skeletons/UserListSkeletons';
import { useUserList } from '@/hooks/useUserList';
import type { User } from '@/types/UserTypes';
import Lottie from 'lottie-react-native';

const EmptyState = ({ hasSearch }: { hasSearch: boolean }) => (
  <Center className="flex-1 px-8">
    <VStack className="items-center space-y-4">
      <Lottie
        source={require('@/assets/empty-notifications.json')}
        autoPlay
        loop
        style={{ width: 200, height: 200 }}
      />
      <Text className="text-xl font-semibold text-gray-800 dark:text-gray-200">
        {hasSearch ? 'Nenhum usuário encontrado' : 'Nenhum usuário cadastrado'}
      </Text>
      <Text className="text-center text-gray-500 dark:text-gray-400">
        {hasSearch 
          ? 'Tente ajustar os filtros ou termo de busca' 
          : 'Novos usuários aparecerão aqui'}
      </Text>
    </VStack>
  </Center>
);

const UserListPage = () => {
  const router = useRouter();
  const [showFilters, setShowFilters] = useState(false);
  
  const {
    users,
    isLoading,
    isRefreshing,
    isLoadingMore,
    error,
    hasMore,
    searchQuery,
    filters,
    loadMore,
    refresh,
    search,
    updateFilters,
    clearFilters,
    activeFiltersCount
  } = useUserList();

  const handleUserPress = useCallback((user: User) => {
    router.push(`/(tabs)/(home)/(profile)/${user.id}`);
  }, [router]);

  const renderItem = useCallback(({ item, index }: { item: User; index: number }) => (
    <UserItem 
      user={item} 
      onPress={handleUserPress}
      showDivider={index < users.length - 1}
    />
  ), [handleUserPress, users.length]);

  const keyExtractor = useCallback((item: User) => item.id.toString(), []);

  const ListFooterComponent = useMemo(() => {
    if (!isLoadingMore) return null;
    
    return (
      <Center className="py-4">
        <Text className="text-sm text-gray-500">Carregando mais...</Text>
      </Center>
    );
  }, [isLoadingMore]);

  const ListHeaderComponent = useMemo(() => (
    <VStack className="px-4 pt-4 pb-2 space-y-4 bg-white dark:bg-gray-900">
      {/* Search Bar */}
      <UserSearchBar
        value={searchQuery}
        onChangeText={search}
        placeholder="Buscar por nome ou email..."
      />

      {/* Filter Button */}
      <HStack className="justify-between items-center">
        <HStack className="items-center space-x-2">
          <Users size={20} className="text-gray-600 dark:text-gray-400" />
          <Text className="text-sm font-medium text-gray-600 dark:text-gray-400">
            {users.length} {users.length === 1 ? 'usuário' : 'usuários'}
          </Text>
        </HStack>

        <Button
          variant="secondary"
          onPress={() => setShowFilters(true)}
          className="flex-row items-center space-x-2 px-3 py-2"
        >
          <Filter size={16} />
          <Text className="text-sm font-medium">Filtros</Text>
          {activeFiltersCount > 0 && (
            <Badge className="ml-1 bg-primary-500">
              <Text className="text-xs text-white font-bold">
                {activeFiltersCount}
              </Text>
            </Badge>
          )}
        </Button>
      </HStack>

      {/* Active Filters Tags */}
      {activeFiltersCount > 0 && (
        <HStack className="flex-wrap gap-2">
          {filters.sector && (
            <Badge className="bg-blue-100 dark:bg-blue-900/30">
              <Text className="text-xs text-blue-700 dark:text-blue-300">
                Setor: {filters.sector}
              </Text>
            </Badge>
          )}
          {filters.role && (
            <Badge className="bg-purple-100 dark:bg-purple-900/30">
              <Text className="text-xs text-purple-700 dark:text-purple-300">
                Função: {filters.role}
              </Text>
            </Badge>
          )}
          {filters.isActive && (
            <Badge className="bg-green-100 dark:bg-green-900/30">
              <Text className="text-xs text-green-700 dark:text-green-300">
                Apenas ativos
              </Text>
            </Badge>
          )}
        </HStack>
      )}
    </VStack>
  ), [searchQuery, search, users.length, activeFiltersCount, filters]);

  if (isLoading && users.length === 0) {
    return <UserListSkeletons />;
  }

  if (error && users.length === 0) {
    return (
      <Center className="flex-1">
        <VStack className="items-center space-y-4">
          <Text className="text-lg text-red-500">Erro ao carregar usuários</Text>
          <Button onPress={refresh}>
            Tentar novamente
          </Button>
        </VStack>
      </Center>
    );
  }

  return (
    <Box className="flex-1 bg-gray-50 dark:bg-gray-950">
      <FlatList
        data={users}
        renderItem={renderItem}
        keyExtractor={keyExtractor}
        ListHeaderComponent={ListHeaderComponent}
        ListFooterComponent={ListFooterComponent}
        ListEmptyComponent={
          <EmptyState hasSearch={!!searchQuery || activeFiltersCount > 0} />
        }
        onEndReached={loadMore}
        onEndReachedThreshold={0.3}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={refresh}
            colors={['#3b82f6']}
            tintColor="#3b82f6"
          />
        }
        contentContainerStyle={users.length === 0 ? { flex: 1 } : undefined}
        showsVerticalScrollIndicator={false}
        removeClippedSubviews={true}
        maxToRenderPerBatch={10}
        windowSize={10}
        initialNumToRender={10}
      />

      <UserFilters
        isOpen={showFilters}
        onClose={() => setShowFilters(false)}
        filters={filters}
        onApplyFilters={updateFilters}
        onClearFilters={clearFilters}
      />
    </Box>
  );
};

export default UserListPage;
