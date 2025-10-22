import { directusClient } from './api';
import { GlobalQueryParams } from '@/types/GlobalQueryParamsTypes';

export interface Sector {
  id: string;
  title: string;
  status: 'active' | 'inactive';
  sort?: number;
}

// Dados estáticos enquanto não temos a collection no Directus
const staticSectors: Sector[] = Array.from({ length: 31 }, (_, i) => ({
  id: `sector-${i + 1}`,
  title: `Setor ${i + 1}`,
  status: 'active' as const,
  sort: i + 1,
}));

export const sectorsService = {
  async getSectors(): Promise<Sector[]> {
    try {
      // Primeiro tentamos buscar do Directus
      // Se a collection existir, ela será usada
      // Caso contrário, usamos os dados estáticos
      
      // Comentado até a collection ser criada no Directus
      // const params: GlobalQueryParams = {
      //   filter: { status: { _eq: 'active' } },
      //   sort: ['sort', 'title']
      // };
      // const response = await directusClient.request(readItems('sectors', params));
      // return response;
      
      // Por enquanto, simulamos delay e retornamos dados estáticos
      await new Promise(resolve => setTimeout(resolve, 300));
      return staticSectors.filter(s => s.status === 'active').sort((a, b) => (a.sort || 0) - (b.sort || 0));
    } catch (error) {
      console.error('Erro ao buscar setores:', error);
      // Em caso de erro, retorna dados estáticos
      return staticSectors.filter(s => s.status === 'active');
    }
  },
  
  async getSectorById(id: string): Promise<Sector | null> {
    try {
      // Comentado até a collection ser criada
      // const response = await directusClient.request(readItem('sectors', id));
      // return response;
      
      const sector = staticSectors.find(s => s.id === id);
      return sector || null;
    } catch (error) {
      console.error('Erro ao buscar setor:', error);
      const sector = staticSectors.find(s => s.id === id);
      return sector || null;
    }
  },

  // Método para criar setores via API (quando implementado)
  async createSector(data: { title: string; status: 'active' | 'inactive'; sort?: number }): Promise<Sector> {
    try {
      // Comentado até a collection ser criada
      // const response = await directusClient.request(createItem('sectors', data));
      // return response;
      
      throw new Error('Collection sectors não existe ainda no Directus');
    } catch (error) {
      console.error('Erro ao criar setor:', error);
      throw error;
    }
  }
};