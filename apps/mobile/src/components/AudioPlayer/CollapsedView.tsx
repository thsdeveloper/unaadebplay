import React from 'react';
import { View, Text as RNText, Pressable, StyleSheet } from 'react-native';
import { Image as ExpoImage } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import { Play, Pause, X, Music } from 'lucide-react-native';
import { usePlayerControls, usePlayerProgress } from '@/contexts/AudioPlayerContext';
import { Equalizer } from './Equalizer';
import { SHEET } from '@/constants/sheetTokens';
import { hexToRGBA } from './color';

/** Linha de progresso isolada — só ela re-renderiza a cada tick. */
const MiniProgress: React.FC<{ accent: string; buffering: boolean }> = ({ accent, buffering }) => {
  const { position, duration } = usePlayerProgress();
  const pct = duration > 0 ? Math.min(1, Math.max(0, position / duration)) : 0;
  return (
    <View style={styles.progressTrack} pointerEvents="none">
      <View style={[styles.progressFill, { width: `${pct * 100}%`, backgroundColor: buffering ? SHEET.textMuted : accent }]} />
    </View>
  );
};

/**
 * Mini-player (barra compacta) dentro do BottomAccessory nativo das tabs.
 * Fundo próprio (gradiente dark tingido pela cor da faixa) para garantir contraste
 * sobre o vidro nativo — independente do tema claro/escuro do sistema.
 */
const CollapsedView: React.FC<{ onExpand: () => void }> = ({ onExpand }) => {
  const { track, isPlaying, isBuffering, toggle, close } = usePlayerControls();
  if (!track) return null;

  const accent = track.color || SHEET.brand;

  const onToggle = () => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); toggle(); };
  const onClose = () => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Rigid); close(); };

  return (
    <Pressable onPress={onExpand} style={styles.wrap} accessibilityRole="button" accessibilityLabel={`Abrir player: ${track.title}`}>
      <LinearGradient
        colors={[hexToRGBA(accent, 0.32), SHEET.bgDeep, SHEET.bgDeep]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={StyleSheet.absoluteFill}
      />

      <View style={styles.row}>
        <View style={[styles.art, { backgroundColor: accent }]}>
          {track.artworkUri ? (
            <ExpoImage source={{ uri: track.artworkUri }} style={StyleSheet.absoluteFill} contentFit="cover" transition={200} />
          ) : (
            <Music size={18} color="#fff" />
          )}
          {isPlaying && (
            <View style={styles.artEq}>
              <Equalizer color="#fff" active size={14} barWidth={2.5} />
            </View>
          )}
        </View>

        <View style={styles.meta}>
          <RNText numberOfLines={1} style={styles.title}>{track.title}</RNText>
          <RNText numberOfLines={1} style={styles.artist}>{track.artist}</RNText>
        </View>

        <Pressable onPress={onToggle} hitSlop={12} style={[styles.playBtn, { backgroundColor: accent }]} accessibilityRole="button" accessibilityLabel={isPlaying ? 'Pausar' : 'Tocar'}>
          {isPlaying
            ? <Pause size={18} color="#fff" fill="#fff" />
            : <Play size={18} color="#fff" fill="#fff" style={{ marginLeft: 1.5 }} />}
        </Pressable>
        <Pressable onPress={onClose} hitSlop={10} style={styles.closeBtn} accessibilityRole="button" accessibilityLabel="Fechar player">
          <X size={17} color="rgba(255,255,255,0.6)" strokeWidth={2.5} />
        </Pressable>
      </View>

      <MiniProgress accent={accent} buffering={isBuffering} />
    </Pressable>
  );
};

export default CollapsedView;

const styles = StyleSheet.create({
  wrap: { flex: 1, borderRadius: 16, overflow: 'hidden', justifyContent: 'center', minHeight: 56 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 11, paddingHorizontal: 10, paddingVertical: 8 },
  art: { width: 42, height: 42, borderRadius: 9, overflow: 'hidden', alignItems: 'center', justifyContent: 'center' },
  artEq: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(0,0,0,0.32)' },
  meta: { flex: 1, justifyContent: 'center' },
  title: { color: '#FFFFFF', fontSize: 14.5, fontWeight: '700' },
  artist: { color: 'rgba(255,255,255,0.68)', fontSize: 12, marginTop: 1.5 },
  playBtn: { width: 34, height: 34, borderRadius: 17, alignItems: 'center', justifyContent: 'center' },
  closeBtn: { width: 30, height: 34, alignItems: 'center', justifyContent: 'center' },
  progressTrack: { position: 'absolute', left: 10, right: 10, bottom: 4, height: 2.5, borderRadius: 2, backgroundColor: 'rgba(255,255,255,0.14)', overflow: 'hidden' },
  progressFill: { height: '100%', borderRadius: 2 },
});
