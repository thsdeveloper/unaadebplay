import React, { memo, useCallback } from 'react';
import { View, Text, ScrollView, StyleSheet, Linking, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LogOut, Trash2, Moon, Info, Clock, CalendarCheck, Mail } from 'lucide-react-native';
import * as Application from 'expo-application';
import { ModalSheetHeader } from '@/components/molecules/ModalSheetHeader';
import { SheetGroup } from '@/components/molecules/SheetGroup';
import { SheetRow } from '@/components/molecules/SheetRow';
import { SheetProfileHeader } from '@/components/organisms/SheetProfileHeader';
import { useTheme } from '@/hooks/useTheme';
import { SHEET } from '@/constants/sheetTokens';

interface UserInfoTemplateProps {
  userId?: string | null;
  userAvatarID?: string;
  userName: string;
  userEmail: string;
  sector?: string;
  lastAccess?: string;
  memberSince?: string;
  onClose: () => void;
  onProfilePress?: () => void;
  onLogout: () => void;
  onDeleteAccount: () => void;
}

/**
 * Sheet "Minhas informações" — quick account sheet hardcoded ESCURO, coeso com a
 * home. GUARDRAIL: nunca usar o Text atom com color aqui (renderiza preto no tema
 * Claro); cor sempre via SHEET + hex.
 */
export const UserInfoTemplate = memo<UserInfoTemplateProps>(({
  userId,
  userAvatarID,
  userName,
  userEmail,
  sector,
  lastAccess,
  memberSince,
  onClose,
  onProfilePress,
  onLogout,
  onDeleteAccount,
}) => {
  const { mode, resolvedTheme, toggleTheme } = useTheme();
  const themeValue = mode === 'system' ? 'Sistema' : resolvedTheme === 'dark' ? 'Escuro' : 'Claro';
  const version = `${Application.nativeApplicationVersion ?? '—'} (${Application.nativeBuildVersion ?? '—'})`;
  const openSupport = useCallback(() => {
    Linking.openURL('mailto:ths.pereira@gmail.com').catch(() =>
      Alert.alert('Não foi possível abrir o e-mail', 'Envie para ths.pereira@gmail.com'),
    );
  }, []);

  return (
    <SafeAreaView style={st.safe} edges={['top', 'bottom']}>
      <ModalSheetHeader onClose={onClose} eyebrow="MINHA CONTA" />

      <ScrollView contentContainerStyle={st.content} showsVerticalScrollIndicator={false}>
        <SheetProfileHeader
          userId={userId}
          userAvatarID={userAvatarID}
          name={userName}
          email={userEmail}
          sector={sector}
          onProfilePress={onProfilePress}
        />

        <SheetGroup title="Preferências">
          <SheetRow
            icon={<Moon size={18} color={SHEET.gold} />}
            label="Aparência"
            description="Aplica-se às demais telas"
            value={themeValue}
            onPress={toggleTheme}
          />
        </SheetGroup>

        {(lastAccess || memberSince) && (
          <SheetGroup title="Conta">
            {!!lastAccess && (
              <SheetRow icon={<Clock size={18} color={SHEET.textMuted} />} label="Último acesso" value={lastAccess} />
            )}
            {!!memberSince && (
              <SheetRow icon={<CalendarCheck size={18} color={SHEET.gold} />} label="Membro desde" value={memberSince} />
            )}
          </SheetGroup>
        )}

        <SheetGroup title="Ações">
          <SheetRow
            icon={<LogOut size={18} color={SHEET.brand} />}
            label="Sair da aplicação"
            description="Encerrar sua sessão"
            tone="primary"
            onPress={onLogout}
          />
        </SheetGroup>

        <SheetRow
          standalone
          tone="danger"
          icon={<Trash2 size={18} color={SHEET.danger} />}
          label="Excluir conta"
          description="Remoção em até 24h"
          onPress={onDeleteAccount}
        />

        <SheetGroup title="Sobre">
          <SheetRow icon={<Info size={18} color={SHEET.textMuted} />} label="Versão" value={version} />
          <SheetRow
            icon={<Mail size={18} color={SHEET.textMuted} />}
            label="Suporte"
            description="ths.pereira@gmail.com"
            onPress={openSupport}
          />
        </SheetGroup>

        <Text style={st.credit}>Desenvolvido por NetCriativa · Thiago Pereira</Text>
        <View style={st.spacer} />
      </ScrollView>
    </SafeAreaView>
  );
});

UserInfoTemplate.displayName = 'UserInfoTemplate';

const st = StyleSheet.create({
  safe: { flex: 1, backgroundColor: SHEET.bg },
  content: { paddingHorizontal: 16, paddingBottom: 32, gap: 18 },
  credit: { color: SHEET.textFaint, fontSize: 12, textAlign: 'center', marginTop: 4 },
  spacer: { height: 16 },
});
