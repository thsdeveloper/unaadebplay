import React from "react";
import { StatusBar } from "expo-status-bar";
import { UserInfoTemplate } from "@/components/templates";
import { useAuth } from "@/contexts/AuthContext";
import { useAccountActions } from "@/hooks/useAccountActions";
import { useRouter } from "expo-router";
import { relativeTime } from "@/utils/directus";

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export default function ModalPage() {
    const { user } = useAuth();
    const { handleLogout, handleDeleteAccount } = useAccountActions();
    const router = useRouter();

    const handleProfilePress = () => {
        router.back();
        router.push('/(tabs)/(settings)');
    };

    // Membro desde (pt-BR) a partir da data de criação, se disponível.
    // Mês + ano (sem dia) para caber no valor da linha "Membro desde".
    const memberSince = user?.created_at
        ? new Date(user.created_at).toLocaleDateString('pt-BR', {
            month: 'long',
            year: 'numeric'
          })
        : undefined;

    // `sector` pode ser um nome ("Setor 12") ou um id/UUID de relação — só exibimos
    // o chip quando é um rótulo legível (evita renderizar um UUID cru).
    const sectorLabel =
        user?.sector && !UUID_RE.test(String(user.sector)) ? String(user.sector) : undefined;

    return (
        <>
            <StatusBar style="light" />
            <UserInfoTemplate
                userAvatarID={user?.avatar}
                userName={user?.first_name || 'Usuário'}
                userEmail={user?.email || ''}
                sector={sectorLabel}
                lastAccess={user?.last_access ? relativeTime(user.last_access) : undefined}
                memberSince={memberSince}
                onClose={() => router.back()}
                onProfilePress={handleProfilePress}
                onLogout={handleLogout}
                onDeleteAccount={handleDeleteAccount}
            />
        </>
    );
};
