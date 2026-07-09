import React from 'react';
import { TouchableOpacity, View } from 'react-native';
import { Link } from 'expo-router';
import { Avatar } from '@/components/Avatar';
import { Text } from '@/components/ui/text';
import { Box } from '@/components/ui/box';
import { Badge } from '@/components/ui/badge';
import { relativeTime } from '@/utils/directus';
import { UserProfileData } from '../types';
import { Feather } from '@expo/vector-icons';
import { useAuth } from '@/contexts/AuthContext';
import { useIsOnline } from '@/contexts/PresenceContext';

interface UserProfileProps {
  profile: UserProfileData;
}

export const UserProfile: React.FC<UserProfileProps> = ({ profile }) => {
  const { user } = useAuth();
  const online = useIsOnline(user?.id); // presença REAL (não o isOnline estático)
  return (
    <Link href={'/(tabs)/(settings)'} asChild>
      <TouchableOpacity className="active:opacity-80">
        <Box className="bg-white dark:bg-background-800 rounded-xl p-5 mx-4 mb-6 shadow-soft-1 border border-outline-100 dark:border-outline-800">
          <View className="flex-row items-start">
            <View className="relative">
              {/* O UserAvatar já renderiza o dot de PRESENÇA real — sem overlay manual. */}
              <Avatar
                userId={user?.id}
                userAvatarID={profile.avatar}
                height={64}
                width={64}
              />
            </View>
            
            <View className="flex-1 ml-4">
              <View className="flex-row items-center gap-2">
                <Text className="text-lg font-bold text-typography-950 dark:text-typography-0">
                  {profile.firstName}
                </Text>
                {profile.isPremium && (
                  <Badge className="bg-warning-500/20 px-2 py-0.5">
                    <Feather name="star" size={12} color="#FFA500" />
                    <Text className="text-xs text-warning-600 ml-1">Premium</Text>
                  </Badge>
                )}
              </View>
              
              <Text className="text-sm text-typography-600 dark:text-typography-400 mt-1">
                {profile.email}
              </Text>
              
              <View className="flex-row items-center mt-2">
                {online && <View className="w-2 h-2 bg-success-500 rounded-full mr-2" />}
                <Text className="text-xs text-typography-500 dark:text-typography-500">
                  {online ? 'Online agora' : `Visto ${relativeTime(profile.lastAccess)}`}
                </Text>
              </View>
            </View>
            
            <Feather 
              name="chevron-right" 
              size={20} 
              color="#9CA3AF"
              style={{ marginTop: 20 }}
            />
          </View>
        </Box>
      </TouchableOpacity>
    </Link>
  );
};