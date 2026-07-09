import React, { useCallback } from 'react';
import { View, Text as RNText, ScrollView, Pressable, StyleSheet } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import * as Application from 'expo-application';
import { User, Bell, ChevronRight, Info, LogOut, Trash2, Share2, FileText, ShieldCheck } from 'lucide-react-native';
import { SheetGroup } from '@/components/molecules/SheetGroup';
import { SheetRow } from '@/components/molecules/SheetRow';
import { useAccountActions } from '@/hooks/useAccountActions';
import { SHEET } from '@/constants/sheetTokens';

/**
 * Hub de CONFIGURAÇÕES do app (só ajustes). A identidade (avatar/nome/e-mail/título)
 * NÃO aparece aqui — vive na tela ./profile, aberta pela opção "Meu perfil".
 * "Excluir conta" existe, mas fica DELIBERADAMENTE discreto no rodapé (não incentivar).
 */
export default function SettingsScreen() {
  const { handleLogout, handleDeleteAccount } = useAccountActions();

  const goProfile = useCallback(() => router.push('/(tabs)/(settings)/profile'), []);
  const goNotif = useCallback(() => router.push('/(tabs)/(settings)/notification-settings'), []);
  const goSocial = useCallback(() => router.push('/(tabs)/(settings)/social-links'), []);
  const goTerms = useCallback(() => router.push('/(tabs)/(settings)/terms'), []);
  const goPrivacy = useCallback(() => router.push('/(tabs)/(settings)/privacy'), []);

  const version = `${Application.nativeApplicationVersion ?? '—'} (${Application.nativeBuildVersion ?? '—'})`;

  return (
    <SafeAreaView style={s.safe} edges={['top']}>
      <StatusBar style="light" />
      <View style={s.header}>
        <RNText style={s.eyebrow}>AJUSTES</RNText>
        <RNText style={s.title}>Configurações</RNText>
      </View>

      <ScrollView contentContainerStyle={s.content} showsVerticalScrollIndicator={false}>
        <SheetGroup title="CONTA">
          <SheetRow tone="primary" icon={<User size={18} color={SHEET.brand} />} label="Meu perfil" description="Nome, foto, localização e sobre você" onPress={goProfile} />
          <SheetRow icon={<Bell size={18} color={SHEET.gold} />} label="Notificações" description="Permissões e alertas" onPress={goNotif} />
          <SheetRow icon={<Share2 size={18} color={SHEET.brand} />} label="Redes sociais" description="Escolha quais redes exibir no perfil" onPress={goSocial} />
        </SheetGroup>

        <SheetGroup title="APLICATIVO">
          <SheetRow icon={<Info size={18} color={SHEET.textSecondary} />} label="Versão" value={version} />
        </SheetGroup>

        <SheetGroup title="LEGAL">
          <SheetRow icon={<FileText size={18} color={SHEET.textSecondary} />} label="Termos de Uso" onPress={goTerms} trailing={<ChevronRight size={18} color={SHEET.textFaint} />} />
          <SheetRow icon={<ShieldCheck size={18} color={SHEET.textSecondary} />} label="Política de Privacidade" onPress={goPrivacy} trailing={<ChevronRight size={18} color={SHEET.textFaint} />} />
        </SheetGroup>

        <SheetRow standalone tone="danger" icon={<LogOut size={18} color={SHEET.danger} />} label="Sair da conta" onPress={handleLogout} trailing={<ChevronRight size={18} color={SHEET.danger} />} />

        <RNText style={s.footer}>UNAADEB Play · versão {Application.nativeApplicationVersion ?? '1.1.0'}</RNText>

        {/* Exclusão de conta — discreta, em estilo de link (não incentivar). */}
        <Pressable onPress={handleDeleteAccount} hitSlop={10} style={s.deleteBtn} accessibilityRole="button" accessibilityLabel="Excluir minha conta">
          <Trash2 size={14} color={SHEET.textMuted} />
          <RNText style={s.deleteText}>Excluir minha conta</RNText>
        </Pressable>

        <View style={{ height: 24 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: SHEET.bg },
  header: { paddingHorizontal: 16, paddingTop: 8, paddingBottom: 4 },
  eyebrow: { color: SHEET.textFaint, fontSize: 11, letterSpacing: 1.5, fontWeight: '600' },
  title: { color: SHEET.textPrimary, fontSize: 28, fontWeight: '800', marginTop: 4 },
  content: { paddingHorizontal: 16, paddingTop: 12, paddingBottom: 32, gap: 18 },
  footer: { color: SHEET.textFaint, fontSize: 12.5, textAlign: 'center', marginTop: 4 },
  deleteBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, marginTop: 14 },
  deleteText: { color: SHEET.textMuted, fontSize: 13, fontWeight: '500', textDecorationLine: 'underline' },
});
