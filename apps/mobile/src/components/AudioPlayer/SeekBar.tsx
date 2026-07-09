import React, { useRef, useState } from 'react';
import { View, StyleSheet, type GestureResponderEvent } from 'react-native';
import { SHEET } from '@/constants/sheetTokens';

interface Props {
  position: number; // ms
  duration: number; // ms
  onSeek?: (ms: number) => void;
  interactive?: boolean;
  color?: string;
  height?: number;
  thumb?: boolean;
}

/** Barra de progresso/seek dark. interactive=true habilita arrastar para buscar. */
export const SeekBar: React.FC<Props> = ({
  position, duration, onSeek, interactive = false, color = SHEET.brand, height = 4, thumb = false,
}) => {
  const [scrub, setScrub] = useState<number | null>(null);
  const scrubRef = useRef<number | null>(null);
  const widthRef = useRef(0);
  const durRef = useRef(duration);
  durRef.current = duration;

  const setFromX = (e: GestureResponderEvent) => {
    const w = widthRef.current;
    const d = durRef.current;
    const x = e.nativeEvent.locationX;
    const ms = w > 0 && d > 0 ? (Math.min(w, Math.max(0, x)) / w) * d : 0;
    scrubRef.current = ms;
    setScrub(ms);
  };

  const scrubbing = scrub != null;
  const value = scrubbing ? (scrub as number) : position;
  const pct = duration > 0 ? Math.min(1, Math.max(0, value / duration)) : 0;
  const pctStr: `${number}%` = `${pct * 100}%`;
  const barH = scrubbing ? height + 2 : height;

  return (
    <View
      style={styles.hit}
      onLayout={(e) => { widthRef.current = e.nativeEvent.layout.width; }}
      onStartShouldSetResponder={() => interactive}
      onMoveShouldSetResponder={() => interactive}
      onResponderGrant={setFromX}
      onResponderMove={setFromX}
      onResponderRelease={() => { if (scrubRef.current != null) onSeek?.(scrubRef.current); scrubRef.current = null; setScrub(null); }}
      onResponderTerminate={() => { scrubRef.current = null; setScrub(null); }}
    >
      <View style={[styles.track, { height: barH, borderRadius: barH / 2 }]}>
        <View style={[styles.fill, { width: pctStr, backgroundColor: color, borderRadius: barH / 2 }]} />
      </View>
      {thumb && (
        <View style={[styles.thumbWrap, { left: pctStr }]} pointerEvents="none">
          <View style={[styles.thumb, scrubbing && styles.thumbActive, { backgroundColor: color }]} />
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  hit: { justifyContent: 'center', paddingVertical: 10 },
  track: { width: '100%', backgroundColor: 'rgba(255,255,255,0.18)', overflow: 'hidden' },
  fill: { height: '100%' },
  thumbWrap: { position: 'absolute', top: 0, bottom: 0, justifyContent: 'center' },
  thumb: {
    width: 14, height: 14, borderRadius: 7, marginLeft: -7,
    borderWidth: 3, borderColor: '#fff',
    shadowColor: '#000', shadowOpacity: 0.4, shadowRadius: 4, shadowOffset: { width: 0, height: 1 },
  },
  thumbActive: { width: 20, height: 20, borderRadius: 10, marginLeft: -10 },
});
