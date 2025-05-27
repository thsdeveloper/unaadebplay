import React from 'react';
import { Pressable } from '@/components/ui/pressable';
import { HStack } from '@/components/ui/hstack';
import { VStack } from '@/components/ui/vstack';
import { Text } from '@/components/ui/text';
import { Badge } from '@/components/ui/badge';
import { DirectusAvatar } from '@/components/DirectusImage';
import { ChevronRight, Shield, Users, Crown } from 'lucide-react-native';
import type { User } from '@/types/UserTypes';

interface UserItemProps {
  user: User;
  onPress: (user: User) => void;
  showDivider?: boolean;
}

const roleIcons = {
  admin: Shield,
  leader: Crown,
  member: Users,
};

const roleColors = {
  admin: 'bg-red-100 dark:bg-red-900/30',
  leader: 'bg-blue-100 dark:bg-blue-900/30',
  member: 'bg-gray-100 dark:bg-gray-800',
};

const roleTextColors = {
  admin: 'text-red-700 dark:text-red-300',
  leader: 'text-blue-700 dark:text-blue-300',
  member: 'text-gray-700 dark:text-gray-300',
};

export const UserItem = React.memo<UserItemProps>(({ 
  user, 
  onPress,
  showDivider = true 
}) => {
  const RoleIcon = user.role ? roleIcons[user.role as keyof typeof roleIcons] : null;
  const isActive = user.status === 'active';

  return (
    <Pressable 
      onPress={() => onPress(user)}
      className="active:opacity-80"
    >
      <HStack className="p-4 items-center space-x-3">
        {/* Avatar */}
        <DirectusAvatar
          fileId={user.avatar}
          size={56}
          fallbackText={user.first_name?.[0] || user.email?.[0] || '?'}
          className="border-2 border-gray-200 dark:border-gray-700"
        />

        {/* User Info */}
        <VStack className="flex-1 space-y-1">
          <HStack className="items-center space-x-2">
            <Text className="text-lg font-semibold text-gray-900 dark:text-gray-100">
              {user.first_name || user.email?.split('@')[0] || 'Usuário'}
            </Text>
            {!isActive && (
              <Badge className="bg-gray-200 dark:bg-gray-700">
                <Text className="text-xs text-gray-600 dark:text-gray-400">
                  Inativo
                </Text>
              </Badge>
            )}
          </HStack>

          <Text className="text-sm text-gray-500 dark:text-gray-400">
            {user.email}
          </Text>

          {/* Role and Sector */}
          <HStack className="items-center space-x-2 mt-1">
            {user.role && (
              <HStack className={`items-center space-x-1 px-2 py-1 rounded-full ${
                roleColors[user.role as keyof typeof roleColors] || roleColors.member
              }`}>
                {RoleIcon && (
                  <RoleIcon 
                    size={12} 
                    className={roleTextColors[user.role as keyof typeof roleTextColors] || roleTextColors.member}
                  />
                )}
                <Text className={`text-xs font-medium capitalize ${
                  roleTextColors[user.role as keyof typeof roleTextColors] || roleTextColors.member
                }`}>
                  {user.role}
                </Text>
              </HStack>
            )}

            {user.sector && (
              <Badge className="bg-gray-100 dark:bg-gray-800">
                <Text className="text-xs text-gray-600 dark:text-gray-400 capitalize">
                  {user.sector}
                </Text>
              </Badge>
            )}
          </HStack>
        </VStack>

        {/* Chevron */}
        <ChevronRight 
          size={20} 
          className="text-gray-400 dark:text-gray-600" 
        />
      </HStack>

      {showDivider && (
        <HStack className="px-4">
          <HStack className="flex-1 h-px bg-gray-200 dark:bg-gray-800" />
        </HStack>
      )}
    </Pressable>
  );
});

UserItem.displayName = 'UserItem';
