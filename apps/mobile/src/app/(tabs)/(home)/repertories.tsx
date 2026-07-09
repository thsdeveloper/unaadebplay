import React, { useCallback, useEffect, useState } from 'react';
import { View, Text as RNText, Pressable, FlatList, ActivityIndicator, StyleSheet } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { Image as ExpoImage } from 'expo-image';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import { ArrowLeft, Play, Pause, Music, Shuffle } from 'lucide-react-native';
import { getItems } from '@/services/items';
import { usePlayerControls, trackFromRepertorio, type AudioTrack } from '@/contexts/AudioPlayerContext';
import { Equalizer } from '@/components/AudioPlayer/Equalizer';
import { hexToRGBA } from '@/components/AudioPlayer/color';
import { SHEET } from '@/constants/sheetTokens';

interface Row extends AudioTrack {}

const ROW_HEIGHT = 74;

/** Item da lista — memoizado; só re-renderiza se seu próprio estado (ativo/tocando) muda. */
const RepertoireRow = React.memo<{
  track: Row;
  active: boolean;
  playing: boolean;
  onPress: () => void;
}>(({ track, active, playing, onPress }) => {
  const accent = track.color || SHEET.brand;
  const [pressed, setPressed] = useState(false);
  // NOTA: style em ARRAY estático (não função). Pressable + NativeWind descarta o
  // layout quando o style é `({pressed}) => [...]` — o feedback vai via onPressIn/Out.
  return (
    <Pressable
      onPress={onPress}
      onPressIn={() => setPressed(true)}
      onPressOut={() => setPressed(false)}
      style={[s.row, active && { backgroundColor: hexToRGBA(accent, 0.14), borderColor: hexToRGBA(accent, 0.4) }, pressed && { opacity: 0.7 }]}
      accessibilityRole="button"
      accessibilityLabel={`Tocar ${track.title}`}
    >
      <View style={[s.art, { backgroundColor: accent }]}>
        {track.artworkUri ? (
          <ExpoImage source={{ uri: track.artworkUri }} style={StyleSheet.absoluteFill} contentFit="cover" transition={200} />
        ) : (
          <Music size={22} color="#fff" />
        )}
        {active && (
          <View style={s.artOverlay}>
            {playing
              ? <Equalizer color="#fff" active size={20} barWidth={3} />
              : <Play size={22} color="#fff" fill="#fff" />}
          </View>
        )}
      </View>

      <View style={{ flex: 1 }}>
        <RNText style={[s.title, active && { color: accent }]} numberOfLines={1}>{track.title}</RNText>
        <RNText style={s.artist} numberOfLines={1}>
          {track.artist}{track.category?.length ? `  ·  ${track.category[0]}` : ''}
        </RNText>
      </View>

      <View style={[s.playHint, active && { backgroundColor: hexToRGBA(accent, 0.16) }]}>
        {active && playing
          ? <Pause size={17} color={accent} fill={accent} />
          : <Play size={16} color={active ? accent : SHEET.textMuted} fill={active ? accent : 'transparent'} style={{ marginLeft: 1.5 }} />}
      </View>
    </Pressable>
  );
});
RepertoireRow.displayName = 'RepertoireRow';

/** Botão "Tocar tudo" — style estático (mesmo motivo do gotcha acima). */
const PlayAllButton: React.FC<{ onPress: () => void }> = ({ onPress }) => {
  const [pressed, setPressed] = useState(false);
  return (
    <Pressable
      onPress={onPress}
      onPressIn={() => setPressed(true)}
      onPressOut={() => setPressed(false)}
      style={[s.playAll, pressed && { opacity: 0.85 }]}
      accessibilityRole="button"
      accessibilityLabel="Tocar tudo"
    >
      <Shuffle size={16} color="#fff" />
      <RNText style={s.playAllText}>Tocar tudo</RNText>
    </Pressable>
  );
};

const Repertories = () => {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { track: current, isPlaying, playTrack } = usePlayerControls();

  const [rows, setRows] = useState<Row[] | null>(null);

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const data = await getItems<any[]>('repertorios', {
          filter: { status: { _eq: 'published' } },
          sort: ['sort'],
        });
        const tracks = (data ?? []).map(trackFromRepertorio).filter(Boolean) as Row[];
        if (alive) setRows(tracks);
      } catch (e) {
        console.warn('[repertorios] erro ao carregar', e);
        if (alive) setRows([]);
      }
    })();
    return () => { alive = false; };
  }, []);

  const onPlay = useCallback((t: Row) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    playTrack(t, rows ?? [t]);
  }, [playTrack, rows]);

  const onPlayAll = useCallback(() => {
    if (!rows || !rows.length) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    playTrack(rows[0], rows);
  }, [playTrack, rows]);

  const renderItem = useCallback(({ item }: { item: Row }) => (
    <RepertoireRow
      track={item}
      active={current?.id === item.id}
      playing={current?.id === item.id && isPlaying}
      onPress={() => onPlay(item)}
    />
  ), [current?.id, isPlaying, onPlay]);

  const getItemLayout = useCallback((_: unknown, index: number) => (
    { length: ROW_HEIGHT, offset: ROW_HEIGHT * index, index }
  ), []);

  const count = rows?.length ?? 0;

  const ListHeader = (
    <View style={s.listHead}>
      <View style={{ flex: 1 }}>
        <RNText style={s.headKicker}>LOUVOR & ADORAÇÃO</RNText>
        <RNText style={s.headCount}>{count} {count === 1 ? 'faixa' : 'faixas'}</RNText>
      </View>
      {count > 0 && <PlayAllButton onPress={onPlayAll} />}
    </View>
  );

  return (
    <View style={s.screen}>
      <Stack.Screen options={{ headerShown: false }} />

      <View style={[s.topbar, { paddingTop: insets.top + 6 }]}>
        <Pressable onPress={() => router.back()} hitSlop={8} style={s.backPill} accessibilityRole="button" accessibilityLabel="Voltar">
          <ArrowLeft size={21} color={SHEET.textPrimary} strokeWidth={2.5} />
        </Pressable>
        <RNText style={s.topTitle}>Repertórios</RNText>
        <View style={{ width: 40 }} />
      </View>

      {rows === null ? (
        <View style={s.centered}><ActivityIndicator size="large" color={SHEET.brand} /></View>
      ) : rows.length === 0 ? (
        <View style={s.centered}>
          <View style={s.emptyIcon}><Music size={30} color={SHEET.textMuted} /></View>
          <RNText style={s.emptyTitle}>Nenhum repertório disponível</RNText>
          <RNText style={s.emptyDesc}>Os louvores aparecerão aqui quando publicados.</RNText>
        </View>
      ) : (
        <FlatList
          data={rows}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          ListHeaderComponent={ListHeader}
          getItemLayout={getItemLayout}
          contentContainerStyle={{ paddingHorizontal: 12, paddingBottom: insets.bottom + 150 }}
          showsVerticalScrollIndicator={false}
          initialNumToRender={12}
          windowSize={10}
          removeClippedSubviews
        />
      )}
    </View>
  );
};

export default Repertories;

const s = StyleSheet.create({
  screen: { flex: 1, backgroundColor: SHEET.bg },
  topbar: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingBottom: 8 },
  backPill: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center', backgroundColor: SHEET.glass, borderWidth: StyleSheet.hairlineWidth, borderColor: SHEET.border },
  topTitle: { color: SHEET.textPrimary, fontSize: 18, fontWeight: '800' },

  listHead: { flexDirection: 'row', alignItems: 'flex-end', paddingHorizontal: 4, paddingTop: 10, paddingBottom: 14 },
  headKicker: { color: SHEET.textMuted, fontSize: 11, fontWeight: '800', letterSpacing: 1.4 },
  headCount: { color: SHEET.textPrimary, fontSize: 22, fontWeight: '800', marginTop: 3 },
  playAll: { flexDirection: 'row', alignItems: 'center', gap: 7, backgroundColor: SHEET.brand, paddingHorizontal: 15, paddingVertical: 10, borderRadius: 999 },
  playAllText: { color: '#fff', fontSize: 13.5, fontWeight: '800' },

  centered: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 40, paddingBottom: 80 },
  emptyIcon: { width: 72, height: 72, borderRadius: 36, alignItems: 'center', justifyContent: 'center', backgroundColor: SHEET.glass, borderWidth: 1, borderColor: SHEET.border, marginBottom: 16 },
  emptyTitle: { color: SHEET.textPrimary, fontSize: 16, fontWeight: '700', textAlign: 'center' },
  emptyDesc: { color: SHEET.textMuted, fontSize: 13.5, textAlign: 'center', marginTop: 6, lineHeight: 19 },

  row: { height: ROW_HEIGHT, flexDirection: 'row', alignItems: 'center', gap: 13, paddingHorizontal: 10, borderRadius: 16, borderWidth: 1, borderColor: 'transparent' },
  art: { width: 54, height: 54, borderRadius: 12, overflow: 'hidden', alignItems: 'center', justifyContent: 'center' },
  artOverlay: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(0,0,0,0.4)' },
  title: { color: SHEET.textPrimary, fontSize: 15.5, fontWeight: '700' },
  artist: { color: SHEET.textMuted, fontSize: 13, marginTop: 3 },
  playHint: { width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center' },
});
