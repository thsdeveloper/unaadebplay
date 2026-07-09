import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { AppState, type AppStateStatus } from 'react-native';
import type { RealtimeChannel } from '@supabase/supabase-js';
import { supabase } from '@/services/supabase';
import { useAuth } from './AuthContext';

/**
 * Presença online REAL via Supabase Realtime Presence (não toca o banco → barato).
 *
 * Eficiência: um ÚNICO canal compartilhado (`online-users`), com a chave de presença =
 * id do usuário (dedup entre múltiplos aparelhos). O canal só existe enquanto o app está
 * em FOREGROUND — ao ir para background desconecta (não consome realtime parado) e ao
 * voltar reconecta. Presence não grava nada no Postgres; o payload é mínimo.
 */
interface PresenceValue {
  /** Ids de usuários atualmente online (chaves de presença). */
  onlineIds: Set<string>;
  /** True somente se o id informado estiver presente agora. */
  isOnline: (userId?: string | null) => boolean;
  onlineCount: number;
}

const PresenceContext = createContext<PresenceValue>({
  onlineIds: new Set(),
  isOnline: () => false,
  onlineCount: 0,
});

const CHANNEL = 'online-users';

export function PresenceProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const userId = user?.id ?? null;
  const [onlineIds, setOnlineIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (!userId) {
      setOnlineIds(new Set());
      return;
    }

    let channel: RealtimeChannel | null = null;
    let cancelled = false;

    const connect = () => {
      if (channel || cancelled) return;
      const ch = supabase.channel(CHANNEL, { config: { presence: { key: userId } } });
      channel = ch;

      const sync = () => {
        // presenceState() → { [key]: meta[] }. As chaves são os ids online.
        setOnlineIds(new Set(Object.keys(ch.presenceState())));
      };

      ch.on('presence', { event: 'sync' }, sync).subscribe((status) => {
        if (status === 'SUBSCRIBED') ch.track({ at: Date.now() }).catch(() => {});
      });
    };

    const disconnect = () => {
      if (!channel) return;
      const ch = channel;
      channel = null;
      ch.untrack().catch(() => {});
      supabase.removeChannel(ch);
      setOnlineIds(new Set());
    };

    // Conecta já se o app está em foreground; senão espera ficar ativo.
    if (AppState.currentState === 'active') connect();

    const sub = AppState.addEventListener('change', (s: AppStateStatus) => {
      if (cancelled) return;
      if (s === 'active') connect();
      else disconnect();
    });

    return () => {
      cancelled = true;
      sub.remove();
      disconnect();
    };
  }, [userId]);

  const isOnline = useCallback((id?: string | null) => !!id && onlineIds.has(id), [onlineIds]);

  const value = useMemo<PresenceValue>(
    () => ({ onlineIds, isOnline, onlineCount: onlineIds.size }),
    [onlineIds, isOnline],
  );

  return <PresenceContext.Provider value={value}>{children}</PresenceContext.Provider>;
}

/** Acesso ao conjunto de presença + helper `isOnline`. Seguro sem provider (default offline). */
export function usePresence(): PresenceValue {
  return useContext(PresenceContext);
}

/** Açúcar: true se aquele usuário está online agora. */
export function useIsOnline(userId?: string | null): boolean {
  return usePresence().isOnline(userId);
}
