import { supabase } from './supabase';

export interface Sector {
  id: string;
  title: string;
  status: 'active' | 'inactive';
  sort?: number;
}

// Mapeia uma linha da tabela `sectors` (Supabase) para a interface Sector.
function mapSector(row: any): Sector {
  return {
    id: row.id,
    title: row.name,
    status: (row.status as Sector['status']) ?? 'active',
    sort: row.sort ?? undefined,
  };
}

export const sectorsService = {
  async getSectors(): Promise<Sector[]> {
    try {
      const { data, error } = await supabase
        .from('sectors')
        .select('id,name,sort,status')
        .eq('status', 'active')
        .order('sort', { ascending: true });
      if (error) throw error;
      return (data ?? []).map(mapSector);
    } catch (error) {
      console.error('Erro ao buscar setores:', error);
      return [];
    }
  },

  async getSectorById(id: string): Promise<Sector | null> {
    try {
      const { data, error } = await supabase
        .from('sectors')
        .select('id,name,sort,status')
        .eq('id', id)
        .maybeSingle();
      if (error) throw error;
      return data ? mapSector(data) : null;
    } catch (error) {
      console.error('Erro ao buscar setor:', error);
      return null;
    }
  },

  async createSector(_data: { title: string; status: 'active' | 'inactive'; sort?: number }): Promise<Sector> {
    // Escrita em sectors não é exposta ao cliente (somente leitura pública).
    throw new Error('Criação de setores não é suportada pelo cliente.');
  },
};
