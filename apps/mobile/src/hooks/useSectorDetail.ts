import { useEffect, useState } from 'react';
import { sectorsService } from '@/services/sectors';
import { getUser, getUsers } from '@/services/user';
import type { UserTypes } from '@/types/UserTypes';

export interface SectorDetail {
  /** Nome do setor resolvido a partir do id. */
  sectorName: string | null;
  /** Pastor coordenador setorial (perfil público) ou null. */
  coordinator: UserTypes | null;
  /** Líder setorial (perfil público) ou null. */
  leader: UserTypes | null;
  /** Demais membros do mesmo setor (sem o usuário atual, coordenador e líder). */
  members: UserTypes[];
  loading: boolean;
}

const EMPTY: SectorDetail = {
  sectorName: null,
  coordinator: null,
  leader: null,
  members: [],
  loading: false,
};

// Busca um perfil por id sem lançar — retorna null em qualquer falha (ou id vazio).
async function fetchProfile(id?: string | null): Promise<UserTypes | null> {
  if (!id) return null;
  try {
    return await getUser<UserTypes>(String(id));
  } catch {
    return null;
  }
}

/**
 * Contexto de setor de um perfil (SRP): resolve o nome do setor, os dois cargos
 * de liderança (coordenador e líder) e os demais membros do mesmo setor.
 *
 * As três consultas de liderança/membros correm em paralelo e falham de forma
 * isolada (Promise.allSettled) — a queda de uma não derruba as outras. A lista
 * de membros exclui o usuário atual, o coordenador e o líder para não duplicar
 * as pessoas já exibidas nos cards de liderança. Cancela no unmount (flag alive).
 */
export function useSectorDetail(
  sectorId?: string | null,
  currentUserId?: string | null,
): SectorDetail {
  const [state, setState] = useState<SectorDetail>(EMPTY);

  useEffect(() => {
    if (!sectorId) {
      setState(EMPTY);
      return;
    }

    let alive = true;
    setState((prev) => ({ ...prev, loading: true }));

    (async () => {
      // 1) Setor → nome + ids de liderança.
      const sector = await sectorsService.getSectorById(String(sectorId));
      if (!alive) return;

      const sectorName = sector?.title ?? null;
      const coordinatorId = sector?.coordinatorId ?? null;
      const leaderId = sector?.leaderId ?? null;

      // 2) Coordenador, líder e membros em paralelo (falha isolada).
      const [coordRes, leaderRes, membersRes] = await Promise.allSettled([
        fetchProfile(coordinatorId),
        fetchProfile(leaderId),
        getUsers({
          filter: { sector: { _eq: String(sectorId) } },
          limit: 30,
          fields: '*,avatar.*',
        } as any),
      ]);
      if (!alive) return;

      const coordinator = coordRes.status === 'fulfilled' ? coordRes.value : null;
      const leader = leaderRes.status === 'fulfilled' ? leaderRes.value : null;
      const rawMembers = membersRes.status === 'fulfilled' ? membersRes.value ?? [] : [];

      // 3) Exclui o próprio usuário e a liderança já destacada nos cards.
      const excluded = new Set<string>(
        [currentUserId, coordinator?.id, leader?.id].filter(Boolean) as string[],
      );
      const members = rawMembers.filter((m) => m?.id && !excluded.has(m.id));

      setState({ sectorName, coordinator, leader, members, loading: false });
    })().catch(() => {
      if (alive) setState({ ...EMPTY });
    });

    return () => {
      alive = false;
    };
  }, [sectorId, currentUserId]);

  return state;
}
