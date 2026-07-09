import React, { useEffect, useMemo, useState } from 'react';
import { View, Text as RNText, Pressable, ScrollView, StyleSheet } from 'react-native';
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, { useSharedValue, useAnimatedStyle, withRepeat, withTiming, Easing } from 'react-native-reanimated';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { X, Clock, MapPin, Mic, Music, Coffee, CalendarDays, User } from 'lucide-react-native';
import { api } from '@/services/apiClient';
import { SHEET } from '@/constants/sheetTokens';

interface ProgramItem {
  id: string;
  day: string; // YYYY-MM-DD
  start_time: string | null; // HH:MM:SS
  end_time: string | null;
  title: string;
  description: string | null;
  location: string | null;
  speaker: string | null;
  type: string | null;
  sort: number | null;
}

const hhmm = (t?: string | null) => (t ? t.slice(0, 5) : '');

/** Rótulo do dia em pt-BR, capitalizado (ex.: "Quinta, 04 de junho"). */
const dayLabel = (day: string) => {
  const d = new Date(`${day}T00:00:00`);
  if (isNaN(d.getTime())) return day;
  const s = format(d, "EEEE',' dd 'de' MMMM", { locale: ptBR });
  return s.charAt(0).toUpperCase() + s.slice(1);
};

/** Ícone + cor por tipo de item — dá leitura rápida à agenda. */
const typeMeta = (type?: string | null): { Icon: any; color: string } => {
  switch ((type || '').toLowerCase()) {
    case 'louvor':
    case 'musica':
    case 'música':
      return { Icon: Music, color: '#A855F7' };
    case 'preletor':
    case 'palavra':
    case 'prelecao':
    case 'preleção':
    case 'ensino':
      return { Icon: Mic, color: SHEET.brand };
    case 'intervalo':
    case 'almoco':
    case 'almoço':
    case 'refeicao':
    case 'refeição':
    case 'lanche':
      return { Icon: Coffee, color: '#F59E0B' };
    default:
      return { Icon: CalendarDays, color: SHEET.gold };
  }
};

/** Uma linha da agenda: hora + chip de ícone + título/meta. */
const ItemRow: React.FC<{ item: ProgramItem }> = ({ item }) => {
  const { Icon, color } = typeMeta(item.type);
  return (
    <View style={s.row}>
      <View style={s.timeCol}>
        <RNText style={s.time}>{hhmm(item.start_time) || '—'}</RNText>
        {!!item.end_time && <RNText style={s.timeEnd}>{hhmm(item.end_time)}</RNText>}
      </View>

      <View style={[s.chip, { backgroundColor: `${color}22`, borderColor: `${color}55` }]}>
        <Icon size={16} color={color} />
      </View>

      <View style={s.content}>
        <RNText style={s.title}>{item.title}</RNText>
        {(item.speaker || item.location) && (
          <View style={s.metaRow}>
            {!!item.speaker && (
              <View style={s.meta}>
                <User size={12} color={SHEET.textMuted} />
                <RNText style={s.metaText} numberOfLines={1}>{item.speaker}</RNText>
              </View>
            )}
            {!!item.location && (
              <View style={s.meta}>
                <MapPin size={12} color={SHEET.textMuted} />
                <RNText style={s.metaText} numberOfLines={1}>{item.location}</RNText>
              </View>
            )}
          </View>
        )}
        {!!item.description && <RNText style={s.desc}>{item.description}</RNText>}
      </View>
    </View>
  );
};

/** Skeleton (pulso) enquanto carrega. */
const Skeleton: React.FC = () => {
  const pulse = useSharedValue(0.55);
  useEffect(() => {
    pulse.value = withRepeat(withTiming(1, { duration: 850, easing: Easing.inOut(Easing.ease) }), -1, true);
  }, [pulse]);
  const st = useAnimatedStyle(() => ({ opacity: pulse.value }));
  return (
    <Animated.View style={[{ paddingHorizontal: 16, paddingTop: 8 }, st]} pointerEvents="none">
      <View style={[s.skelBar, { width: 130, height: 13, marginBottom: 16 }]} />
      {[0, 1, 2, 3, 4].map((i) => (
        <View key={i} style={s.row}>
          <View style={[s.skelBar, { width: 40, height: 14 }]} />
          <View style={[s.chip, { backgroundColor: 'rgba(255,255,255,0.07)', borderColor: 'transparent' }]} />
          <View style={{ flex: 1, gap: 8 }}>
            <View style={[s.skelBar, { width: '70%', height: 14 }]} />
            <View style={[s.skelBar, { width: '45%', height: 11 }]} />
          </View>
        </View>
      ))}
    </Animated.View>
  );
};

export default function ProgramacaoModal() {
  const { id, name } = useLocalSearchParams<{ id: string; name?: string }>();
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const [items, setItems] = useState<ProgramItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let alive = true;
    (async () => {
      if (!id) return;
      setLoading(true);
      try {
        const res = await api.congressos.programacao<ProgramItem>(id);
        if (alive) setItems(res.data ?? []);
      } catch (e) {
        if (__DEV__) console.warn('[programacao] load falhou', e);
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => { alive = false; };
  }, [id]);

  // Agrupa por dia preservando a ordem já vinda da API (dia → hora → sort).
  const groups = useMemo(() => {
    const map = new Map<string, ProgramItem[]>();
    for (const it of items) {
      const arr = map.get(it.day) ?? [];
      arr.push(it);
      map.set(it.day, arr);
    }
    return Array.from(map.entries()).map(([day, list]) => ({ day, list }));
  }, [items]);

  return (
    <View style={s.screen}>
      <Stack.Screen options={{ headerShown: false }} />

      {/* Grabber + header do modal */}
      <View style={[s.header, { paddingTop: 10 }]}>
        <View style={s.grabber} />
        <View style={s.headerRow}>
          <View style={{ flex: 1 }}>
            <RNText style={s.eyebrow}>PROGRAMAÇÃO</RNText>
            {!!name && <RNText style={s.headerName} numberOfLines={1}>{name}</RNText>}
          </View>
          <Pressable onPress={() => router.back()} hitSlop={10} style={s.closeBtn} accessibilityRole="button" accessibilityLabel="Fechar">
            <X size={20} color={SHEET.textPrimary} strokeWidth={2.4} />
          </Pressable>
        </View>
      </View>

      {loading ? (
        <Skeleton />
      ) : groups.length === 0 ? (
        <View style={s.empty}>
          <View style={s.emptyIcon}><CalendarDays size={30} color={SHEET.textFaint} /></View>
          <RNText style={s.emptyTitle}>Programação em breve</RNText>
          <RNText style={s.emptyDesc}>A agenda deste congresso ainda não foi publicada.</RNText>
        </View>
      ) : (
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: insets.bottom + 28, paddingTop: 4 }}
        >
          {groups.map((g) => (
            <View key={g.day} style={s.group}>
              <View style={s.dayHeader}>
                <Clock size={13} color={SHEET.gold} />
                <RNText style={s.dayText}>{dayLabel(g.day)}</RNText>
              </View>
              {g.list.map((it) => (
                <ItemRow key={it.id} item={it} />
              ))}
            </View>
          ))}
        </ScrollView>
      )}
    </View>
  );
}

const s = StyleSheet.create({
  screen: { flex: 1, backgroundColor: SHEET.bg },
  header: { paddingHorizontal: 16, paddingBottom: 8, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: SHEET.hairline },
  grabber: { alignSelf: 'center', width: 40, height: 5, borderRadius: 999, backgroundColor: SHEET.grabber, marginBottom: 14 },
  headerRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  eyebrow: { color: SHEET.gold, fontSize: 11.5, fontWeight: '800', letterSpacing: 1.4 },
  headerName: { color: SHEET.textPrimary, fontSize: 18, fontWeight: '800', marginTop: 2 },
  closeBtn: {
    width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center',
    backgroundColor: SHEET.glass, borderWidth: 1, borderColor: SHEET.border,
  },

  group: { paddingTop: 18 },
  dayHeader: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 16, marginBottom: 10 },
  dayText: { color: SHEET.gold, fontSize: 12.5, fontWeight: '800', letterSpacing: 0.6, textTransform: 'uppercase' },

  row: { flexDirection: 'row', alignItems: 'flex-start', gap: 12, paddingHorizontal: 16, paddingVertical: 9 },
  timeCol: { width: 44, alignItems: 'flex-start', paddingTop: 8 },
  time: { color: SHEET.textPrimary, fontSize: 13.5, fontWeight: '800' },
  timeEnd: { color: SHEET.textFaint, fontSize: 11, marginTop: 1 },
  chip: { width: 36, height: 36, borderRadius: 11, alignItems: 'center', justifyContent: 'center', borderWidth: 1 },
  content: {
    flex: 1, borderRadius: 14, backgroundColor: SHEET.glass, borderWidth: 1, borderColor: SHEET.border,
    paddingHorizontal: 13, paddingVertical: 11, gap: 5,
  },
  title: { color: SHEET.textPrimary, fontSize: 14.5, fontWeight: '700' },
  metaRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  meta: { flexDirection: 'row', alignItems: 'center', gap: 4, maxWidth: '100%' },
  metaText: { color: SHEET.textMuted, fontSize: 12.5, flexShrink: 1 },
  desc: { color: SHEET.textSecondary, fontSize: 13, lineHeight: 18, marginTop: 1 },

  skelBar: { borderRadius: 7, backgroundColor: 'rgba(255,255,255,0.07)' },

  empty: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 40, paddingBottom: 60 },
  emptyIcon: {
    width: 72, height: 72, borderRadius: 36, alignItems: 'center', justifyContent: 'center',
    backgroundColor: SHEET.glass, borderWidth: 1, borderColor: SHEET.border, marginBottom: 16,
  },
  emptyTitle: { color: SHEET.textPrimary, fontSize: 17, fontWeight: '700', textAlign: 'center' },
  emptyDesc: { color: SHEET.textMuted, fontSize: 13.5, textAlign: 'center', marginTop: 6, lineHeight: 19 },
});
