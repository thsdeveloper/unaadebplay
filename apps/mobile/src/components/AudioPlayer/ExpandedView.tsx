import React from 'react';
import { View, Text as RNText, Pressable, ScrollView, StyleSheet, useWindowDimensions } from 'react-native';
import { Image as ExpoImage } from 'expo-image';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import RenderHtml from 'react-native-render-html';
import { ChevronDown, Play, Pause, SkipBack, SkipForward, Music } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { usePlayerControls, usePlayerProgress } from '@/contexts/AudioPlayerContext';
import { SeekBar } from './SeekBar';
import { hexToRGBA } from './color';
import { SHEET } from '@/constants/sheetTokens';

const fmt = (ms: number) => {
  if (!ms || ms < 0) return '0:00';
  const s = Math.floor(ms / 1000);
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;
};

/** Scrubber + tempos: único trecho que consome progress → isola o re-render por tick. */
const Scrubber: React.FC<{ accent: string; onSeek: (ms: number) => void }> = ({ accent, onSeek }) => {
  const { position, duration } = usePlayerProgress();
  return (
    <View style={styles.seekWrap}>
      <SeekBar position={position} duration={duration} onSeek={onSeek} interactive thumb color={accent} height={6} />
      <View style={styles.times}>
        <RNText style={styles.time}>{fmt(position)}</RNText>
        <RNText style={styles.time}>{duration > 0 ? `-${fmt(Math.max(0, duration - position))}` : '0:00'}</RNText>
      </View>
    </View>
  );
};

/** Letra memoizada — não re-renderiza a cada tick de progresso. */
const Lyrics = React.memo<{ html: string; width: number }>(({ html, width }) => (
  <View style={styles.lyrics}>
    <RNText style={styles.lyricsTitle}>Letra</RNText>
    <RenderHtml
      contentWidth={width - 48}
      source={{ html }}
      baseStyle={{ color: SHEET.textSecondary, fontSize: 16, lineHeight: 27, textAlign: 'center' }}
      tagsStyles={{
        p: { color: SHEET.textSecondary, marginTop: 0, marginBottom: 4, textAlign: 'center' },
        span: { color: SHEET.textSecondary },
        strong: { color: SHEET.textPrimary, fontWeight: '800' },
      }}
    />
  </View>
));
Lyrics.displayName = 'Lyrics';

/** Player em tela cheia (modal): capa, título, controles e letra. */
const ExpandedView: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const { width } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const { track, isPlaying, isBuffering, hasNext, hasPrev, toggle, seek, next, prev } = usePlayerControls();

  if (!track) return null;
  const art = Math.min(width - 88, 330);
  const accent = track.color || SHEET.brand;

  const tap = (fn: () => void, style: Haptics.ImpactFeedbackStyle = Haptics.ImpactFeedbackStyle.Light) =>
    () => { Haptics.impactAsync(style); fn(); };

  return (
    <View style={styles.screen}>
      {/* Backdrop: capa desfocada tingida pela cor da faixa, fade para o dark sólido. */}
      <View style={StyleSheet.absoluteFill}>
        {track.artworkUri ? (
          <ExpoImage source={{ uri: track.artworkUri }} style={StyleSheet.absoluteFill} contentFit="cover" transition={300} />
        ) : (
          <View style={[StyleSheet.absoluteFill, { backgroundColor: accent }]} />
        )}
        <BlurView intensity={80} tint="dark" style={StyleSheet.absoluteFill} />
        <LinearGradient
          colors={[hexToRGBA(accent, 0.42), 'rgba(13,15,23,0.72)', SHEET.bg]}
          locations={[0, 0.5, 0.92]}
          style={StyleSheet.absoluteFill}
        />
      </View>

      <View style={[styles.header, { paddingTop: insets.top + 6 }]}>
        <Pressable onPress={onClose} hitSlop={10} style={styles.hIcon} accessibilityRole="button" accessibilityLabel="Fechar player">
          <ChevronDown size={26} color={SHEET.textPrimary} strokeWidth={2.4} />
        </Pressable>
        <RNText style={styles.hLabel}>TOCANDO AGORA</RNText>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={[styles.scroll, { paddingBottom: insets.bottom + 28 }]} showsVerticalScrollIndicator={false}>
        <View style={[styles.artGlow, { width: art, height: art, shadowColor: accent }]}>
          <View style={styles.artWrap}>
            {track.artworkUri ? (
              <ExpoImage source={{ uri: track.artworkUri }} style={StyleSheet.absoluteFill} contentFit="cover" transition={250} />
            ) : (
              <View style={[StyleSheet.absoluteFill, { backgroundColor: accent, alignItems: 'center', justifyContent: 'center' }]}>
                <Music size={64} color="#fff" />
              </View>
            )}
          </View>
        </View>

        <View style={styles.info}>
          <RNText style={styles.title} numberOfLines={2}>{track.title}</RNText>
          <RNText style={styles.artist} numberOfLines={1}>{track.artist}</RNText>
          {!!(track.category && track.category.length) && (
            <View style={[styles.catPill, { backgroundColor: hexToRGBA(accent, 0.18), borderColor: hexToRGBA(accent, 0.55) }]}>
              <RNText style={[styles.catText, { color: accent }]}>{track.category[0]}</RNText>
            </View>
          )}
        </View>

        <Scrubber accent={accent} onSeek={seek} />

        <View style={styles.controls}>
          <Pressable onPress={tap(prev)} disabled={!hasPrev} hitSlop={12} style={[styles.ctrlBtn, !hasPrev && styles.ctrlDisabled]} accessibilityRole="button" accessibilityLabel="Anterior">
            <SkipBack size={30} color={SHEET.textPrimary} fill={SHEET.textPrimary} />
          </Pressable>
          <Pressable onPress={tap(toggle, Haptics.ImpactFeedbackStyle.Medium)} style={[styles.playBtn, { backgroundColor: accent, shadowColor: accent }]} accessibilityRole="button" accessibilityLabel={isPlaying ? 'Pausar' : 'Tocar'}>
            {isPlaying
              ? <Pause size={34} color="#fff" fill="#fff" />
              : <Play size={34} color="#fff" fill="#fff" style={{ marginLeft: 3 }} />}
          </Pressable>
          <Pressable onPress={tap(next)} disabled={!hasNext} hitSlop={12} style={[styles.ctrlBtn, !hasNext && styles.ctrlDisabled]} accessibilityRole="button" accessibilityLabel="Próxima">
            <SkipForward size={30} color={SHEET.textPrimary} fill={SHEET.textPrimary} />
          </Pressable>
        </View>

        <View style={styles.statusRow}>
          {isBuffering && <RNText style={styles.buffering}>Carregando…</RNText>}
        </View>

        {!!track.content && <Lyrics html={track.content} width={width} />}
      </ScrollView>
    </View>
  );
};

export default ExpandedView;

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: SHEET.bg },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 12, paddingBottom: 6 },
  hIcon: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },
  hLabel: { color: 'rgba(255,255,255,0.85)', fontSize: 11.5, fontWeight: '800', letterSpacing: 1.6 },

  scroll: { alignItems: 'center', paddingHorizontal: 24, paddingTop: 12 },
  artGlow: {
    marginTop: 12, marginBottom: 26, borderRadius: 22,
    shadowOpacity: 0.55, shadowRadius: 28, shadowOffset: { width: 0, height: 14 },
  },
  artWrap: { flex: 1, borderRadius: 22, overflow: 'hidden', backgroundColor: SHEET.surface },

  info: { alignItems: 'center', width: '100%' },
  title: { color: '#FFFFFF', fontSize: 25, fontWeight: '800', textAlign: 'center', letterSpacing: 0.2 },
  artist: { color: 'rgba(255,255,255,0.75)', fontSize: 16, marginTop: 7, textAlign: 'center' },
  catPill: { marginTop: 14, paddingHorizontal: 13, paddingVertical: 6, borderRadius: 999, borderWidth: 1 },
  catText: { fontSize: 12, fontWeight: '800', letterSpacing: 0.3 },

  seekWrap: { width: '100%', marginTop: 26 },
  times: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 2 },
  time: { color: 'rgba(255,255,255,0.6)', fontSize: 12.5, fontWeight: '600', fontVariant: ['tabular-nums'] },

  controls: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 30, marginTop: 22 },
  ctrlBtn: { width: 58, height: 58, alignItems: 'center', justifyContent: 'center' },
  ctrlDisabled: { opacity: 0.28 },
  playBtn: {
    width: 78, height: 78, borderRadius: 39, alignItems: 'center', justifyContent: 'center',
    shadowOpacity: 0.55, shadowRadius: 18, shadowOffset: { width: 0, height: 8 },
  },

  statusRow: { height: 22, marginTop: 12, alignItems: 'center', justifyContent: 'center' },
  buffering: { color: 'rgba(255,255,255,0.6)', fontSize: 12.5 },

  lyrics: {
    width: '100%', marginTop: 18, borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: SHEET.border,
    paddingTop: 22, alignItems: 'center',
  },
  lyricsTitle: { color: '#FFFFFF', fontSize: 15.5, fontWeight: '800', marginBottom: 12, letterSpacing: 0.4 },
});
