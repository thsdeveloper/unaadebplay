import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { createAudioPlayer, setAudioModeAsync, type AudioPlayer } from 'expo-audio';
import { getStorageUrl } from '@/services/storage';
import { getItem } from '@/services/items';

/**
 * Player de áudio GLOBAL.
 *
 * A instância nativa do expo-audio vive AQUI, no provider (raiz do app), não em uma
 * tela/mini-player. Assim o áudio continua tocando ao navegar entre telas, em segundo
 * plano (shouldPlayInBackground) e com controles na tela de bloqueio (setActiveForLockScreen).
 * Trocar de faixa usa player.replace() — reaproveita a mesma instância (performático).
 *
 * Dois contextos para performance: "controls" (faixa atual + ações, muda pouco) e
 * "progress" (posição/duração, atualiza ~2x/s). A lista de repertórios só consome
 * "controls", então não re-renderiza a cada tick de progresso.
 */

export interface AudioTrack {
  id: string;
  title: string;
  artist: string;
  artworkUri: string | null; // URL de imagem já resolvida
  uri: string; // URL de mp3 já resolvida
  color?: string | null;
  category?: string[] | null;
  content?: string | null; // letra (HTML)
}

interface PlayerControls {
  track: AudioTrack | null;
  isPlaying: boolean;
  isBuffering: boolean;
  hasNext: boolean;
  hasPrev: boolean;
  playTrack: (track: AudioTrack, queue?: AudioTrack[]) => void;
  toggle: () => void;
  seek: (positionMs: number) => void;
  next: () => void;
  prev: () => void;
  close: () => void;
  // Compat com telas antigas (repertorieID + setter por id).
  repertorieID: string | null;
  setRepertorieID: (id: string | null) => void;
}

interface PlayerProgress {
  position: number; // ms
  duration: number; // ms
}

const ControlsContext = createContext<PlayerControls | null>(null);
const ProgressContext = createContext<PlayerProgress>({ position: 0, duration: 0 });

export const usePlayerControls = (): PlayerControls => {
  const ctx = useContext(ControlsContext);
  if (!ctx) throw new Error('usePlayerControls must be used within an AudioPlayerProvider');
  return ctx;
};
export const usePlayerProgress = (): PlayerProgress => useContext(ProgressContext);
/** Compat: telas antigas usam useRepertorieContext().{repertorieID,setRepertorieID}. */
export const useRepertorieContext = usePlayerControls;

/** Monta um AudioTrack a partir de uma linha da tabela `repertorios`. */
export function trackFromRepertorio(r: any): AudioTrack | null {
  const uri = getStorageUrl(r?.mp3, 'audio');
  if (!uri) return null;
  return {
    id: String(r.id),
    title: r?.title ?? 'Sem título',
    artist: r?.artist ?? 'UNAADEB',
    artworkUri: getStorageUrl(r?.image_cover, 'images'),
    uri,
    color: r?.color ?? null,
    category: Array.isArray(r?.category) ? r.category : null,
    content: r?.content ?? null,
  };
}

export const AudioPlayerProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const playerRef = useRef<AudioPlayer | null>(null);
  const subRef = useRef<{ remove: () => void } | null>(null);
  const queueRef = useRef<AudioTrack[]>([]);
  const indexRef = useRef<number>(-1);
  const playAtRef = useRef<(i: number) => void>(() => {});

  const [track, setTrack] = useState<AudioTrack | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isBuffering, setIsBuffering] = useState(false);
  const [position, setPosition] = useState(0);
  const [duration, setDuration] = useState(0);
  const [queueVersion, setQueueVersion] = useState(0); // recomputa hasNext/hasPrev

  // Sessão de áudio: toca no silencioso, em background e não mistura (habilita lock screen).
  useEffect(() => {
    setAudioModeAsync({
      playsInSilentMode: true,
      shouldPlayInBackground: true,
      interruptionMode: 'doNotMix',
      allowsRecording: false,
    }).catch(() => {});
  }, []);

  const attachListener = useCallback((player: AudioPlayer) => {
    subRef.current?.remove();
    const sub = player.addListener('playbackStatusUpdate', (status: any) => {
      setPosition((status?.currentTime ?? 0) * 1000);
      if (status?.duration && status.duration > 0) setDuration(status.duration * 1000);
      setIsPlaying(!!status?.playing);
      setIsBuffering(!!status?.isBuffering);
      if (status?.didJustFinish) playAtRef.current(indexRef.current + 1); // auto-avança
    });
    subRef.current = sub;
  }, []);

  const loadAndPlay = useCallback((t: AudioTrack) => {
    try {
      let player = playerRef.current;
      if (!player) {
        player = createAudioPlayer({ uri: t.uri }, { updateInterval: 500 });
        playerRef.current = player;
      } else {
        player.replace({ uri: t.uri });
      }
      attachListener(player);
      player.play();
      setTrack(t);
      setIsPlaying(true);
      setIsBuffering(true);
      setPosition(0);
      setDuration(0);
      try {
        player.setActiveForLockScreen?.(true, { title: t.title, artist: t.artist, artworkUrl: t.artworkUri ?? undefined });
      } catch { /* lock screen é bônus */ }
    } catch (e) {
      console.warn('[audio] erro ao carregar faixa', e);
    }
  }, [attachListener]);

  const playAt = useCallback((index: number) => {
    const q = queueRef.current;
    if (index < 0 || index >= q.length) return;
    indexRef.current = index;
    setQueueVersion((v) => v + 1);
    loadAndPlay(q[index]);
  }, [loadAndPlay]);

  useEffect(() => { playAtRef.current = playAt; }, [playAt]);

  const playTrack = useCallback((t: AudioTrack, queue?: AudioTrack[]) => {
    if (queue && queue.length) {
      queueRef.current = queue;
      const i = queue.findIndex((x) => x.id === t.id);
      indexRef.current = i >= 0 ? i : 0;
    } else {
      queueRef.current = [t];
      indexRef.current = 0;
    }
    setQueueVersion((v) => v + 1);
    loadAndPlay(t);
  }, [loadAndPlay]);

  const toggle = useCallback(() => {
    const p = playerRef.current;
    if (!p) return;
    if (p.playing) p.pause(); else p.play();
  }, []);

  const seek = useCallback((positionMs: number) => {
    const p = playerRef.current;
    if (!p) return;
    setPosition(positionMs);
    p.seekTo(Math.max(0, positionMs) / 1000).catch(() => {});
  }, []);

  const next = useCallback(() => playAt(indexRef.current + 1), [playAt]);
  const prev = useCallback(() => {
    const p = playerRef.current;
    if (p && (p.currentTime ?? 0) > 3) { p.seekTo(0).catch(() => {}); return; }
    playAt(indexRef.current - 1);
  }, [playAt]);

  const close = useCallback(() => {
    try {
      subRef.current?.remove();
      subRef.current = null;
      const p = playerRef.current;
      if (p) {
        p.pause();
        try { p.clearLockScreenControls?.(); } catch { /* noop */ }
        p.remove();
      }
    } catch { /* noop */ }
    playerRef.current = null;
    queueRef.current = [];
    indexRef.current = -1;
    setTrack(null);
    setIsPlaying(false);
    setIsBuffering(false);
    setPosition(0);
    setDuration(0);
  }, []);

  const setRepertorieID = useCallback(async (id: string | null) => {
    if (!id) { close(); return; }
    try {
      const r = await getItem<any>('repertorios', id);
      const t = trackFromRepertorio(r);
      if (t) playTrack(t);
    } catch (e) {
      console.warn('[audio] erro ao carregar repertório', e);
    }
  }, [close, playTrack]);

  // Libera o player nativo ao desmontar o app.
  useEffect(() => () => {
    try { subRef.current?.remove(); playerRef.current?.remove(); } catch { /* noop */ }
  }, []);

  const controls = useMemo<PlayerControls>(() => ({
    track,
    isPlaying,
    isBuffering,
    hasNext: indexRef.current >= 0 && indexRef.current < queueRef.current.length - 1,
    hasPrev: indexRef.current > 0,
    playTrack,
    toggle,
    seek,
    next,
    prev,
    close,
    repertorieID: track?.id ?? null,
    setRepertorieID,
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }), [track, isPlaying, isBuffering, queueVersion, playTrack, toggle, seek, next, prev, close, setRepertorieID]);

  const progress = useMemo<PlayerProgress>(() => ({ position, duration }), [position, duration]);

  return (
    <ControlsContext.Provider value={controls}>
      <ProgressContext.Provider value={progress}>
        {children}
      </ProgressContext.Provider>
    </ControlsContext.Provider>
  );
};
