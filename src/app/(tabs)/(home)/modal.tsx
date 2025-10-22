import React from "react";
import { UserInfoTemplate } from "@/components/templates";
import { useAuth } from "@/contexts/AuthContext";
import { useAccountActions } from "@/hooks/useAccountActions";
import { useRouter } from "expo-router";
import { relativeTime } from "@/utils/directus";

export default function ModalPage() {
    const { user } = useAuth();
    const { handleLogout, handleDeleteAccount } = useAccountActions();
    const router = useRouter();

    const handleProfilePress = () => {
        router.back();
        router.push('/(tabs)/(settings)');
    };

    // Format member since date if available
    const memberSince = user?.date_created
        ? new Date(user.date_created).toLocaleDateString('pt-BR', {
            day: '2-digit',
            month: 'long',
            year: 'numeric'
          })
        : undefined;

    return (
        <UserInfoTemplate
            userAvatarID={user?.avatar}
            userName={user?.first_name || 'Usuário'}
            userEmail={user?.email || ''}
            lastAccess={user?.last_access ? relativeTime(user.last_access) : undefined}
            memberSince={memberSince}
            onProfilePress={handleProfilePress}
            onLogout={handleLogout}
            onDeleteAccount={handleDeleteAccount}
        />
    );
};
