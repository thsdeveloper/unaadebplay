import { memo } from 'react';
import { Text } from '@/components/atoms/Text';
import { View, TouchableOpacity } from 'react-native';
import { useThemedColors } from '@/hooks/useThemedColors';
import { cn } from '@/utils/cn';
import { Avatar } from '@/components/Avatar';
import { FontAwesome5 } from '@expo/vector-icons';

interface UserProfileCardProps {
  userAvatarID?: string;
  userName: string;
  userEmail: string;
  lastAccess?: string;
  onPress?: () => void;
  className?: string;
}

/**
 * UserProfileCard Molecule
 *
 * Displays user profile information in a card format
 * with full theme support
 */
export const UserProfileCard = memo<UserProfileCardProps>(({
  userAvatarID,
  userName,
  userEmail,
  lastAccess,
  onPress,
  className
}) => {
  const colors = useThemedColors();

  const CardContent = (
    <View className={cn(
      'flex-row items-center p-4 rounded-2xl border',
      'bg-gray-100 dark:bg-gray-800',
      'border-gray-300 dark:border-gray-700',
      onPress && 'active:bg-gray-200 dark:active:bg-gray-750',
      className
    )}>
      <View className="mr-4">
        <Avatar
          userAvatarID={userAvatarID}
          name={userName}
          height={60}
          width={60}
        />
      </View>

      <View className="flex-1">
        <Text
          variant="subheading"
          color="primary"
          className="mb-1"
        >
          {userName}
        </Text>
        <Text
          variant="caption"
          color="muted"
          className="mb-1"
        >
          {userEmail}
        </Text>
        {lastAccess && (
          <Text
            size="xs"
            color="muted"
          >
            Último acesso: {lastAccess}
          </Text>
        )}
      </View>

      {onPress && (
        <View className="ml-2">
          <FontAwesome5
            name="chevron-right"
            size={16}
            color={colors.textMuted}
          />
        </View>
      )}
    </View>
  );

  if (onPress) {
    return (
      <TouchableOpacity onPress={onPress} activeOpacity={0.7}>
        {CardContent}
      </TouchableOpacity>
    );
  }

  return CardContent;
});

UserProfileCard.displayName = 'UserProfileCard';
