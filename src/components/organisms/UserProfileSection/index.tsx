import { memo } from 'react';
import { View } from 'react-native';
import { SectionHeader } from '@/components/atoms/SectionHeader';
import { UserProfileCard } from '@/components/molecules/UserProfileCard';
import { InfoRow } from '@/components/atoms/InfoRow';
import { FontAwesome5 } from '@expo/vector-icons';
import { useThemedColors } from '@/hooks/useThemedColors';
import { cn } from '@/utils/cn';

interface UserProfileSectionProps {
  userAvatarID?: string;
  userName: string;
  userEmail: string;
  lastAccess?: string;
  memberSince?: string;
  onProfilePress?: () => void;
  className?: string;
}

/**
 * UserProfileSection Organism
 *
 * Displays user profile information with theme support
 */
export const UserProfileSection = memo<UserProfileSectionProps>(({
  userAvatarID,
  userName,
  userEmail,
  lastAccess,
  memberSince,
  onProfilePress,
  className
}) => {
  const colors = useThemedColors();

  return (
    <View className={cn('mb-6', className)}>
      <SectionHeader
        title="Perfil"
        subtitle="Informações da sua conta"
      />

      <UserProfileCard
        userAvatarID={userAvatarID}
        userName={userName}
        userEmail={userEmail}
        lastAccess={lastAccess}
        onPress={onProfilePress}
      />

      {memberSince && (
        <View className="mt-4 px-2">
          <InfoRow
            icon={
              <FontAwesome5
                name="calendar-check"
                size={20}
                color={colors.info}
              />
            }
            label="Membro desde"
            value={memberSince}
          />
        </View>
      )}
    </View>
  );
});

UserProfileSection.displayName = 'UserProfileSection';
