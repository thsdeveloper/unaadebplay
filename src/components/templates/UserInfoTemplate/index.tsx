import { memo } from 'react';
import { ScrollView, View } from 'react-native';
import { UserProfileSection } from '@/components/organisms/UserProfileSection';
import { PreferencesSection } from '@/components/organisms/PreferencesSection';
import { AccountActionsSection } from '@/components/organisms/AccountActionsSection';
import { AppInfoSection } from '@/components/organisms/AppInfoSection';
import { SafeAreaView } from 'react-native-safe-area-context';
import { cn } from '@/utils/cn';

interface UserInfoTemplateProps {
  userAvatarID?: string;
  userName: string;
  userEmail: string;
  lastAccess?: string;
  memberSince?: string;
  onProfilePress?: () => void;
  onLogout: () => void;
  onDeleteAccount: () => void;
  className?: string;
}

/**
 * Template for User Information modal
 *
 * Follows Atomic Design principles with proper composition
 * Separates layout from business logic following SRP
 *
 * Features:
 * - Full theme support (light/dark)
 * - Responsive layout
 * - Smooth scrolling
 * - Proper spacing and accessibility
 */
export const UserInfoTemplate = memo<UserInfoTemplateProps>(({
  userAvatarID,
  userName,
  userEmail,
  lastAccess,
  memberSince,
  onProfilePress,
  onLogout,
  onDeleteAccount,
  className
}) => {
  return (
    <SafeAreaView className="flex-1 bg-white dark:bg-gray-900" edges={['bottom']}>
      <ScrollView
        className={cn('flex-1', className)}
        contentContainerClassName="p-6"
        showsVerticalScrollIndicator={false}
      >
        <UserProfileSection
          userAvatarID={userAvatarID}
          userName={userName}
          userEmail={userEmail}
          lastAccess={lastAccess}
          memberSince={memberSince}
          onProfilePress={onProfilePress}
        />

        <PreferencesSection />

        <AccountActionsSection
          onLogout={onLogout}
          onDeleteAccount={onDeleteAccount}
        />

        <AppInfoSection />

        {/* Bottom spacing for better scrolling experience */}
        <View className="h-8" />
      </ScrollView>
    </SafeAreaView>
  );
});

UserInfoTemplate.displayName = 'UserInfoTemplate';
