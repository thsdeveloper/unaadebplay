import { api } from './apiClient';

export interface Sector {
  id: string;
  title: string;
  status: 'active' | 'inactive';
  sort?: number;
  /** Pastor coordenador setorial (profiles.id) — pode não estar definido. */
  coordinatorId?: string | null;
  /** Líder setorial (profiles.id) — pode não estar definido. */
  leaderId?: string | null;
}

/** Perfil enxuto (não-PII) de um líder de setor, para exibição. */
export interface SectorLeader {
  id: string;
  first_name: string | null;
  last_name: string | null;
  avatar: string | null;
  title: string | null;
}

export interface SectorLeadership {
  sectorName: string | null;
  coordinator: SectorLeader | null;
  leader: SectorLeader | null;
}

/**
 * Liderança pública de um setor (coordenador + líder). Endpoint PÚBLICO — funciona no
 * cadastro (pré-login). Só retorna campos não-PII.
 */
export async function getSectorLeadership(id: string): Promise<SectorLeadership> {
  return api.request<SectorLeadership>(`/sectors/${id}/leadership`);
}

// Mapeia uma linha da tabela `sectors` para a interface Sector.
function mapSector(row: any): Sector {
  return {
    id: row.id,
    title: row.name,
    status: (row.status as Sector['status']) ?? 'active',
    sort: row.sort ?? undefined,
    coordinatorId: row.coordinator_id ?? null,
    leaderId: row.leader_id ?? null,
  };
}

export const sectorsService = {
  async getSectors(): Promise<Sector[]> {
    try {
      // Rota PÚBLICA: o cadastro (onde os setores são escolhidos) é PRÉ-LOGIN, então não
      // pode usar o GET /sectors autenticado (retornaria 401 e travaria o passo do setor).
      const res = await api.request<{ data: any[] }>('/public/sectors');
      return (res.data as any[]).map(mapSector);
    } catch (error) {
      console.error('Erro ao buscar setores:', error);
      return [];
    }
  },

  async getSectorById(id: string): Promise<Sector | null> {
    try {
      const row = await api.resource('sectors').get(id);
      return row ? mapSector(row) : null;
    } catch (error) {
      console.error('Erro ao buscar setor:', error);
      return null;
    }
  },

  async createSector(_data: { title: string; status: 'active' | 'inactive'; sort?: number }): Promise<Sector> {
    // Escrita em sectors é operação de admin (API /admin/sectors), não do cliente.
    throw new Error('Criação de setores não é suportada pelo cliente.');
  },
};
