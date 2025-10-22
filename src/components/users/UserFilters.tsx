import React, { useState, useEffect } from 'react';
import { 
  Users, 
  Building, 
  CheckCircle, 
  XCircle,
  ArrowUpDown,
  Calendar,
  User
} from 'lucide-react-native';
import { Actionsheet } from '@/components/ui/actionsheet';
import { VStack } from '@/components/ui/vstack';
import { HStack } from '@/components/ui/hstack';
import { Text } from '@/components/ui/text';
import { Button } from '@/components/Button';
import { Radio } from '@/components/Forms/Radio';
import { Switch } from '@/components/Forms/Switch';
import { Divider } from '@/components/ui/divider';
import { Pressable } from '@/components/ui/pressable';
import type { UserFilters } from '@/hooks/useUserList';

interface UserFiltersProps {
  isOpen: boolean;
  onClose: () => void;
  filters: UserFilters;
  onApplyFilters: (filters: UserFilters) => void;
  onClearFilters: () => void;
}

const SECTORS = [
  { value: 'all', label: 'Todos os Setores', icon: Users },
  { value: 'administration', label: 'Administração', icon: Building },
  { value: 'ministry', label: 'Ministério', icon: Users },
  { value: 'youth', label: 'Juventude', icon: Users },
  { value: 'worship', label: 'Louvor', icon: Users }
];

const ROLES = [
  { value: 'all', label: 'Todas as Funções' },
  { value: 'admin', label: 'Administrador' },
  { value: 'member', label: 'Membro' },
  { value: 'leader', label: 'Líder' },
  { value: 'pastor', label: 'Pastor' }
];

const SORT_OPTIONS = [
  { value: 'name', label: 'Nome', icon: User },
  { value: 'createdAt', label: 'Data de Cadastro', icon: Calendar },
  { value: 'updatedAt', label: 'Última Atualização', icon: ArrowUpDown }
];

export function UserFilters({
  isOpen,
  onClose,
  filters,
  onApplyFilters,
  onClearFilters
}: UserFiltersProps) {
  const [localFilters, setLocalFilters] = useState<UserFilters>(filters);

  useEffect(() => {
    setLocalFilters(filters);
  }, [filters]);

  const handleApply = () => {
    onApplyFilters(localFilters);
    onClose();
  };

  const handleClear = () => {
    const clearedFilters: UserFilters = {
      sortBy: 'name',
      sortOrder: 'asc'
    };
    setLocalFilters(clearedFilters);
    onClearFilters();
  };

  const activeCount = Object.values(localFilters).filter(
    value => value !== null && value !== undefined && value !== 'name' && value !== 'asc'
  ).length;

  return (
    <Actionsheet isOpen={isOpen} onClose={onClose}>
      <Actionsheet.Content className="px-4 pb-6">
        <Actionsheet.DragIndicator />
        
        <VStack className="w-full space-y-6">
          {/* Header */}
          <HStack className="justify-between items-center mt-4">
            <Text className="text-xl font-bold">Filtros</Text>
            {activeCount > 0 && (
              <Text className="text-sm text-gray-500">
                {activeCount} {activeCount === 1 ? 'ativo' : 'ativos'}
              </Text>
            )}
          </HStack>

          {/* Setor */}
          <VStack className="space-y-3">
            <Text className="text-base font-semibold">Setor</Text>
            <VStack className="space-y-2">
              {SECTORS.map((sector) => {
                const Icon = sector.icon;
                const isSelected = 
                  sector.value === 'all' 
                    ? !localFilters.sector 
                    : localFilters.sector === sector.value;

                return (
                  <Pressable
                    key={sector.value}
                    onPress={() => setLocalFilters(prev => ({
                      ...prev,
                      sector: sector.value === 'all' ? null : sector.value
                    }))}
                  >
                    <HStack className={`p-3 rounded-lg border ${
                      isSelected 
                        ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20' 
                        : 'border-gray-200 dark:border-gray-700'
                    }`}>
                      <Radio
                        value={sector.value}
                        isChecked={isSelected}
                        onChange={() => setLocalFilters(prev => ({
                          ...prev,
                          sector: sector.value === 'all' ? null : sector.value
                        }))}
                      />
                      <Icon 
                        size={20} 
                        className={`ml-3 ${
                          isSelected ? 'text-primary-500' : 'text-gray-500'
                        }`}
                      />
                      <Text className={`ml-2 ${
                        isSelected ? 'text-primary-500 font-medium' : ''
                      }`}>
                        {sector.label}
                      </Text>
                    </HStack>
                  </Pressable>
                );
              })}
            </VStack>
          </VStack>

          <Divider />

          {/* Função */}
          <VStack className="space-y-3">
            <Text className="text-base font-semibold">Função</Text>
            <VStack className="space-y-2">
              {ROLES.map((role) => {
                const isSelected = 
                  role.value === 'all' 
                    ? !localFilters.role 
                    : localFilters.role === role.value;

                return (
                  <Pressable
                    key={role.value}
                    onPress={() => setLocalFilters(prev => ({
                      ...prev,
                      role: role.value === 'all' ? null : role.value
                    }))}
                  >
                    <HStack className={`p-3 rounded-lg border ${
                      isSelected 
                        ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20' 
                        : 'border-gray-200 dark:border-gray-700'
                    }`}>
                      <Radio
                        value={role.value}
                        isChecked={isSelected}
                        onChange={() => setLocalFilters(prev => ({
                          ...prev,
                          role: role.value === 'all' ? null : role.value
                        }))}
                      />
                      <Text className={`ml-2 ${
                        isSelected ? 'text-primary-500 font-medium' : ''
                      }`}>
                        {role.label}
                      </Text>
                    </HStack>
                  </Pressable>
                );
              })}
            </VStack>
          </VStack>

          <Divider />

          {/* Status */}
          <HStack className="justify-between items-center">
            <HStack className="space-x-2 items-center">
              {localFilters.isActive ? (
                <CheckCircle size={20} className="text-green-500" />
              ) : (
                <XCircle size={20} className="text-gray-400" />
              )}
              <Text className="text-base font-medium">
                Apenas usuários ativos
              </Text>
            </HStack>
            <Switch
              value={localFilters.isActive || false}
              onValueChange={(value) => setLocalFilters(prev => ({
                ...prev,
                isActive: value ? true : null
              }))}
            />
          </HStack>

          <Divider />

          {/* Ordenação */}
          <VStack className="space-y-3">
            <Text className="text-base font-semibold">Ordenar por</Text>
            <VStack className="space-y-2">
              {SORT_OPTIONS.map((option) => {
                const Icon = option.icon;
                const isSelected = localFilters.sortBy === option.value;

                return (
                  <Pressable
                    key={option.value}
                    onPress={() => setLocalFilters(prev => ({
                      ...prev,
                      sortBy: option.value as any
                    }))}
                  >
                    <HStack className={`p-3 rounded-lg border ${
                      isSelected 
                        ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20' 
                        : 'border-gray-200 dark:border-gray-700'
                    }`}>
                      <Radio
                        value={option.value}
                        isChecked={isSelected}
                        onChange={() => setLocalFilters(prev => ({
                          ...prev,
                          sortBy: option.value as any
                        }))}
                      />
                      <Icon 
                        size={20} 
                        className={`ml-3 ${
                          isSelected ? 'text-primary-500' : 'text-gray-500'
                        }`}
                      />
                      <Text className={`ml-2 ${
                        isSelected ? 'text-primary-500 font-medium' : ''
                      }`}>
                        {option.label}
                      </Text>
                    </HStack>
                  </Pressable>
                );
              })}
            </VStack>

            {/* Ordem */}
            <HStack className="space-x-4 mt-2">
              <Pressable
                onPress={() => setLocalFilters(prev => ({ ...prev, sortOrder: 'asc' }))}
                className="flex-1"
              >
                <HStack className={`p-3 rounded-lg border justify-center ${
                  localFilters.sortOrder === 'asc'
                    ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20'
                    : 'border-gray-200 dark:border-gray-700'
                }`}>
                  <Text className={
                    localFilters.sortOrder === 'asc' 
                      ? 'text-primary-500 font-medium' 
                      : ''
                  }>
                    Crescente
                  </Text>
                </HStack>
              </Pressable>
              
              <Pressable
                onPress={() => setLocalFilters(prev => ({ ...prev, sortOrder: 'desc' }))}
                className="flex-1"
              >
                <HStack className={`p-3 rounded-lg border justify-center ${
                  localFilters.sortOrder === 'desc'
                    ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20'
                    : 'border-gray-200 dark:border-gray-700'
                }`}>
                  <Text className={
                    localFilters.sortOrder === 'desc' 
                      ? 'text-primary-500 font-medium' 
                      : ''
                  }>
                    Decrescente
                  </Text>
                </HStack>
              </Pressable>
            </HStack>
          </VStack>

          {/* Actions */}
          <VStack className="space-y-3 mt-6">
            <Button
              onPress={handleApply}
              className="w-full"
            >
              Aplicar Filtros
            </Button>
            
            <HStack className="space-x-3">
              <Button
                variant="secondary"
                onPress={handleClear}
                className="flex-1"
              >
                Limpar
              </Button>
              
              <Button
                variant="secondary"
                onPress={onClose}
                className="flex-1"
              >
                Cancelar
              </Button>
            </HStack>
          </VStack>
        </VStack>
      </Actionsheet.Content>
    </Actionsheet>
  );
}