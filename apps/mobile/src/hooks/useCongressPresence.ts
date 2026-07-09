import { useCallback, useEffect, useState } from 'react';
import * as Haptics from 'expo-haptics';
import { api } from '@/services/apiClient';
import { useAuth } from '@/contexts/AuthContext';

export interface CongressPresence {
  /** O usuário atual confirmou presença neste congresso. */
  confirmed: boolean;
  /** Total de confirmados (social proof). */
  total: number;
  loading: boolean;
  toggling: boolean;
  /** Alterna a presença (confirmar/cancelar) de forma otimista. */
  toggle: () => Promise<void>;
}

/**
 * Presença do usuário em um congresso (SRP: separa a lógica da UI).
 * Busca status + total ao montar e faz TOGGLE OTIMISTA — atualiza a UI na hora e
 * reverte se a API falhar — para resposta instantânea. Reconcilia o total com o
 * servidor após cada ação. Endpoints: api.congressos.presenca.{get,confirm,cancel}.
 */
export function useCongressPresence(congressId?: string): CongressPresence {
  const { user } = useAuth();
  const [confirmed, setConfirmed] = useState(false);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [toggling, setToggling] = useState(false);

  useEffect(() => {
    let alive = true;
    (async () => {
      if (!congressId || !user?.id) {
        setLoading(false);
        return;
      }
      setLoading(true);
      try {
        const res = await api.congressos.presenca.get(congressId);
        if (!alive) return;
        setConfirmed(res.confirmed);
        setTotal(res.total);
      } catch (e) {
        if (__DEV__) console.warn('[presenca] load falhou', e);
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => { alive = false; };
  }, [congressId, user?.id]);

  const toggle = useCallback(async () => {
    if (!congressId || toggling) return;
    const next = !confirmed;

    // Otimista: aplica na hora (UI instantânea).
    setConfirmed(next);
    setTotal((t) => Math.max(0, t + (next ? 1 : -1)));
    setToggling(true);
    Haptics.notificationAsync(
      next ? Haptics.NotificationFeedbackType.Success : Haptics.NotificationFeedbackType.Warning,
    ).catch(() => {});

    try {
      const res = next
        ? await api.congressos.presenca.confirm(congressId)
        : await api.congressos.presenca.cancel(congressId);
      // Reconcilia com o servidor (fonte da verdade do total).
      setConfirmed(res.confirmed);
      setTotal(res.total);
    } catch (e) {
      // Reverte a mudança otimista.
      setConfirmed(!next);
      setTotal((t) => Math.max(0, t + (next ? -1 : 1)));
      if (__DEV__) console.warn('[presenca] toggle falhou', e);
      throw e;
    } finally {
      setToggling(false);
    }
  }, [congressId, confirmed, toggling]);

  return { confirmed, total, loading, toggling, toggle };
}
