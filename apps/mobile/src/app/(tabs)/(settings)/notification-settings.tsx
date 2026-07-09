import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, Switch, Pressable, StyleSheet, Linking, Platform, AppState } from 'react-native';
import { useFocusEffect } from 'expo-router';
import * as Notifications from 'expo-notifications';
import { Bell, BellOff, AlertCircle, Mail, CheckCheck, Lightbulb, Settings as SettingsIcon, Send, ChevronRight } from 'lucide-react-native';
import { Spinner } from '@/components/ui/spinner';
import { useNotifications } from '@/contexts/NotificationContext';
import { SheetGroup } from '@/components/molecules/SheetGroup';
import { SheetRow } from '@/components/molecules/SheetRow';
import { SHEET } from '@/constants/sheetTokens';

export default function NotificationSettingsScreen() {
  const {
    notificationsEnabled,
    requestPermissions,
    unreadCount,
    markAllAsRead,
    checkNotificationPermissions,
  } = useNotifications();

  const [loading, setLoading] = useState(false);
  const [appState, setAppState] = useState(AppState.currentState);

  const checkPermissionsStatus = async () => {
    setLoading(true);
    if (checkNotificationPermissions) {
      await checkNotificationPermissions();
    } else {
      await Notifications.getPermissionsAsync();
    }
    setLoading(false);
  };

  useEffect(() => {
    const subscription = AppState.addEventListener('change', (nextAppState) => {
      if (appState.match(/inactive|background/) && nextAppState === 'active') {
        checkPermissionsStatus();
      }
      setAppState(nextAppState);
    });
    return () => subscription.remove();
  }, [appState]);

  useFocusEffect(
    React.useCallback(() => {
      checkPermissionsStatus();
      return () => {};
    }, []),
  );

  const handleToggleNotifications = async () => {
    setLoading(true);
    if (!notificationsEnabled) {
      await requestPermissions();
    } else if (Platform.OS === 'ios') {
      await Linking.openURL('app-settings:');
    } else {
      await Linking.openSettings();
    }
    setLoading(false);
  };

  const notificationTypes = [
    { id: 'promotions', label: 'Promoções e ofertas' },
    { id: 'updates', label: 'Atualizações do app' },
    { id: 'transactions', label: 'Transações e pagamentos' },
    { id: 'messages', label: 'Mensagens' },
  ];

  const [preferences, setPreferences] = useState<Record<string, boolean>>(
    notificationTypes.reduce((acc, type) => ({ ...acc, [type.id]: true }), {}),
  );
  const togglePreference = (typeId: string) =>
    setPreferences((prev) => ({ ...prev, [typeId]: !prev[typeId] }));

  const openDeviceSettings = () => {
    if (Platform.OS === 'ios') Linking.openURL('app-settings:');
    else Linking.openSettings();
  };

  const sendTestNotification = () =>
    Notifications.scheduleNotificationAsync({
      content: {
        title: 'Teste de Notificação 🔔',
        body: 'Suas notificações estão funcionando perfeitamente!',
        data: { route: '/notifications' },
      },
      trigger: null,
    });

  const trackColor = { true: SHEET.brand, false: 'rgba(255,255,255,0.16)' };

  return (
    <View style={st.screen}>
      <ScrollView contentContainerStyle={st.content} showsVerticalScrollIndicator={false}>
        {/* Status geral */}
        <View style={st.card}>
          <View style={st.rowBetween}>
            <View style={st.rowLeft}>
              <View style={[st.iconChip, notificationsEnabled && st.iconChipOn]}>
                {notificationsEnabled ? <Bell size={20} color={SHEET.brand} /> : <BellOff size={20} color={SHEET.textMuted} />}
              </View>
              <View>
                <Text style={st.cardTitle}>Notificações</Text>
                <Text style={st.cardSub}>{notificationsEnabled ? 'Ativadas' : 'Desativadas'}</Text>
              </View>
            </View>
            {loading ? (
              <Spinner color={SHEET.brand} />
            ) : (
              <Switch value={notificationsEnabled} onValueChange={handleToggleNotifications} trackColor={trackColor} thumbColor="#ffffff" />
            )}
          </View>

          {!notificationsEnabled && (
            <View style={st.warning}>
              <AlertCircle size={16} color={SHEET.gold} />
              <Text style={st.warningText}>Ative as notificações para receber atualizações importantes</Text>
            </View>
          )}
        </View>

        {/* Resumo */}
        <View style={st.card}>
          <Text style={st.groupTitle}>RESUMO</Text>
          <View style={st.summaryRow}>
            <View style={st.rowLeft}>
              <Mail size={18} color={SHEET.textMuted} />
              <Text style={st.summaryLabel}>Não lidas</Text>
            </View>
            <View style={[st.countPill, unreadCount > 0 && st.countPillOn]}>
              <Text style={[st.countText, unreadCount > 0 && st.countTextOn]}>{unreadCount}</Text>
            </View>
          </View>
          {unreadCount > 0 && (
            <Pressable onPress={markAllAsRead} style={({ pressed }) => [st.ghostBtn, pressed && { opacity: 0.7 }]}>
              <CheckCheck size={16} color={SHEET.brand} />
              <Text style={st.ghostBtnText}>Marcar todas como lidas</Text>
            </Pressable>
          )}
        </View>

        {/* Preferências (tipos) */}
        {notificationsEnabled && (
          <SheetGroup title="Preferências">
            {notificationTypes.map((type) => (
              <SheetRow
                key={type.id}
                icon={<Bell size={18} color={SHEET.gold} />}
                label={type.label}
                trailing={
                  <Switch
                    value={preferences[type.id]}
                    onValueChange={() => togglePreference(type.id)}
                    trackColor={trackColor}
                    thumbColor="#ffffff"
                  />
                }
              />
            ))}
          </SheetGroup>
        )}

        {/* Dicas */}
        <View style={st.card}>
          <View style={st.tipsHeader}>
            <Lightbulb size={18} color={SHEET.gold} />
            <Text style={st.groupTitleInline}>DICAS</Text>
          </View>
          {[
            'Personalize suas preferências de notificação',
            'Receba atualizações em tempo real',
            'Ajuste também nas configurações do dispositivo',
          ].map((tip, i) => (
            <View key={i} style={st.tipRow}>
              <View style={st.tipDot} />
              <Text style={st.tipText}>{tip}</Text>
            </View>
          ))}
        </View>

        {/* Ações rápidas */}
        <SheetGroup title="Ações rápidas">
          <SheetRow
            icon={<SettingsIcon size={18} color={SHEET.textMuted} />}
            label="Configurações do dispositivo"
            trailing={<ChevronRight size={18} color={SHEET.textFaint} />}
            onPress={openDeviceSettings}
          />
          <SheetRow
            icon={<Send size={18} color={SHEET.brand} />}
            label="Enviar notificação de teste"
            tone="primary"
            onPress={sendTestNotification}
          />
        </SheetGroup>

        <View style={{ height: 24 }} />
      </ScrollView>
    </View>
  );
}

const st = StyleSheet.create({
  screen: { flex: 1, backgroundColor: SHEET.bg },
  content: { paddingHorizontal: 16, paddingTop: 16, gap: 16 },
  card: { backgroundColor: SHEET.glass, borderWidth: 1, borderColor: SHEET.border, borderRadius: 16, padding: 16 },
  rowBetween: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  rowLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  iconChip: { width: 40, height: 40, borderRadius: 12, alignItems: 'center', justifyContent: 'center', backgroundColor: SHEET.glass },
  iconChipOn: { backgroundColor: SHEET.brandTint },
  cardTitle: { color: SHEET.textPrimary, fontSize: 16, fontWeight: '700' },
  cardSub: { color: SHEET.textMuted, fontSize: 13, marginTop: 2 },
  warning: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 14, padding: 12, borderRadius: 12, backgroundColor: 'rgba(255,215,0,0.10)', borderWidth: 1, borderColor: 'rgba(255,215,0,0.28)' },
  warningText: { color: '#FCD9A0', fontSize: 12.5, flex: 1, lineHeight: 17 },
  groupTitle: { color: SHEET.textMuted, fontSize: 13, fontWeight: '600', marginBottom: 12 },
  groupTitleInline: { color: SHEET.textMuted, fontSize: 13, fontWeight: '600' },
  summaryRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  summaryLabel: { color: SHEET.textSecondary, fontSize: 15 },
  countPill: { paddingHorizontal: 12, paddingVertical: 4, borderRadius: 999, backgroundColor: 'rgba(255,255,255,0.08)' },
  countPillOn: { backgroundColor: SHEET.brandTint },
  countText: { color: SHEET.textMuted, fontSize: 14, fontWeight: '700' },
  countTextOn: { color: SHEET.brand },
  ghostBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, marginTop: 14, height: 44, borderRadius: 12, borderWidth: 1, borderColor: 'rgba(229,28,68,0.4)' },
  ghostBtnText: { color: SHEET.brand, fontSize: 14, fontWeight: '700' },
  tipsHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 12 },
  tipRow: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 8 },
  tipDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: SHEET.brand },
  tipText: { color: SHEET.textSecondary, fontSize: 14, flex: 1, lineHeight: 19 },
});
