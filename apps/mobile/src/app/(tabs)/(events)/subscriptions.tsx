import React, { useCallback, useContext, useMemo, useRef, useState } from 'react';
import { View, Text as RNText, Pressable, FlatList, RefreshControl, ActivityIndicator, Alert, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { useRouter, useFocusEffect } from 'expo-router';
import { ArrowLeft, TicketCheck, CalendarPlus } from 'lucide-react-native';
import { SHEET } from '@/constants/sheetTokens';
import { SubscriptionCard } from '@/components/events/SubscriptionCard';
import { eventsService } from '@/services/events';
import { useAuth } from '@/contexts/AuthContext';
import AlertContext from '@/contexts/AlertContext';
import type { EventsTypes } from '@/types/EventsTypes';

interface Item { event: EventsTypes; subscriptionId: string }

const getTime = (e: EventsTypes) => new Date(e.start_date_time).getTime();

export default function SubscriptionsScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const alert = useContext(AlertContext);
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const seen = useRef<Set<string>>(new Set());

  const load = useCallback(async () => {
    if (!user?.id) { setItems([]); setLoading(false); return; }
    try {
      const rows = await eventsService.getSubscribedEvents(user.id);
      const now = Date.now();
      // Próximos primeiro (asc), depois os já realizados (desc).
      const future = rows.filter((r) => getTime(r.event) >= now).sort((a, b) => getTime(a.event) - getTime(b.event));
      const past = rows.filter((r) => getTime(r.event) < now).sort((a, b) => getTime(b.event) - getTime(a.event));
      setItems([...future, ...past]);
    } catch {
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  useFocusEffect(useCallback(() => { load(); }, [load]));

  const refresh = useCallback(async () => {
    setRefreshing(true);
    await load();
    setRefreshing(false);
  }, [load]);

  const onCancel = useCallback((subscriptionId: string, eventTitle: string) => {
    Alert.alert(
      'Cancelar inscrição',
      `Deseja cancelar sua inscrição em "${eventTitle}"?`,
      [
        { text: 'Manter inscrição', style: 'cancel' },
        {
          text: 'Cancelar inscrição',
          style: 'destructive',
          onPress: async () => {
            const prev = items;
            setItems((cur) => cur.filter((x) => x.subscriptionId !== subscriptionId)); // otimista
            try {
              await eventsService.unsubscribeFromEvent(subscriptionId);
              alert.success('Inscrição cancelada');
            } catch {
              setItems(prev); // rollback
              alert.error('Não foi possível cancelar a inscrição');
            }
          },
        },
      ],
    );
  }, [items, alert]);

  const upcomingCount = useMemo(() => items.filter((r) => getTime(r.event) >= Date.now()).length, [items]);

  const renderItem = useCallback(({ item, index }: { item: Item; index: number }) => {
    const first = !seen.current.has(item.subscriptionId);
    seen.current.add(item.subscriptionId);
    return <SubscriptionCard event={item.event} subscriptionId={item.subscriptionId} onCancel={onCancel} animate={first} index={index} />;
  }, [onCancel]);

  const keyExtractor = useCallback((it: Item) => it.subscriptionId, []);

  const listHeader = items.length > 0 ? (
    <View style={s.summary}>
      <View style={s.summaryItem}>
        <RNText style={s.summaryNum}>{items.length}</RNText>
        <RNText style={s.summaryLabel}>{items.length === 1 ? 'inscrição' : 'inscrições'}</RNText>
      </View>
      <View style={s.summaryDivider} />
      <View style={s.summaryItem}>
        <RNText style={[s.summaryNum, { color: SHEET.success }]}>{upcomingCount}</RNText>
        <RNText style={s.summaryLabel}>{upcomingCount === 1 ? 'próximo' : 'próximos'}</RNText>
      </View>
    </View>
  ) : null;

  return (
    <SafeAreaView style={s.safe} edges={['top']}>
      <StatusBar style="light" />

      <View style={s.header}>
        <Pressable onPress={() => router.back()} hitSlop={8} style={s.backPill} accessibilityRole="button" accessibilityLabel="Voltar">
          <ArrowLeft size={21} color={SHEET.textPrimary} strokeWidth={2.5} />
        </Pressable>
        <View style={{ flex: 1 }}>
          <RNText style={s.eyebrow}>MEUS EVENTOS</RNText>
          <RNText style={s.title}>Minhas inscrições</RNText>
        </View>
      </View>

      {loading ? (
        <View style={s.centered}>
          <ActivityIndicator size="large" color={SHEET.brand} />
          <RNText style={s.loadingText}>Carregando inscrições...</RNText>
        </View>
      ) : items.length === 0 ? (
        <View style={s.empty}>
          <View style={s.emptyIcon}><TicketCheck size={30} color={SHEET.textMuted} /></View>
          <RNText style={s.emptyTitle}>Nenhuma inscrição ainda</RNText>
          <RNText style={s.emptyDesc}>Quando você se inscrever em um evento, ele aparece aqui para você acompanhar.</RNText>
          <Pressable onPress={() => router.back()} style={s.emptyBtn}>
            <CalendarPlus size={16} color={SHEET.textPrimary} />
            <RNText style={s.emptyBtnText}>Explorar eventos</RNText>
          </Pressable>
        </View>
      ) : (
        <FlatList
          data={items}
          keyExtractor={keyExtractor}
          renderItem={renderItem}
          ListHeaderComponent={listHeader}
          contentContainerStyle={s.listContent}
          showsVerticalScrollIndicator={false}
          initialNumToRender={8}
          removeClippedSubviews
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={refresh} tintColor={SHEET.brand} colors={[SHEET.brand]} />}
        />
      )}
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: SHEET.bg },
  header: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: 16, paddingTop: 6, paddingBottom: 10 },
  backPill: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center', backgroundColor: SHEET.glass, borderWidth: 1, borderColor: SHEET.border },
  eyebrow: { color: SHEET.textFaint, fontSize: 11, letterSpacing: 1.5, fontWeight: '600' },
  title: { color: SHEET.textPrimary, fontSize: 24, fontWeight: '800', marginTop: 2 },

  listContent: { paddingTop: 6, paddingBottom: 120 },
  summary: { flexDirection: 'row', alignItems: 'center', marginHorizontal: 16, marginBottom: 14, padding: 14, borderRadius: 18, backgroundColor: SHEET.glass, borderWidth: 1, borderColor: SHEET.border },
  summaryItem: { flex: 1, alignItems: 'center' },
  summaryNum: { color: SHEET.textPrimary, fontSize: 24, fontWeight: '800' },
  summaryLabel: { color: SHEET.textMuted, fontSize: 12, fontWeight: '600', marginTop: 2 },
  summaryDivider: { width: 1, height: 34, backgroundColor: SHEET.hairline },

  centered: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  loadingText: { color: SHEET.textMuted, fontSize: 14, marginTop: 12 },

  empty: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 40 },
  emptyIcon: { width: 72, height: 72, borderRadius: 36, alignItems: 'center', justifyContent: 'center', backgroundColor: SHEET.glass, borderWidth: 1, borderColor: SHEET.border, marginBottom: 16 },
  emptyTitle: { color: SHEET.textPrimary, fontSize: 17, fontWeight: '700', textAlign: 'center' },
  emptyDesc: { color: SHEET.textMuted, fontSize: 13.5, textAlign: 'center', marginTop: 6, lineHeight: 19 },
  emptyBtn: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 18, paddingHorizontal: 18, paddingVertical: 11, borderRadius: 999, backgroundColor: SHEET.glass, borderWidth: 1, borderColor: SHEET.border },
  emptyBtnText: { color: SHEET.textPrimary, fontSize: 14, fontWeight: '700' },
});
