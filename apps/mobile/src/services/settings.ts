import { api } from './apiClient';

export interface Settings {
  [key: string]: any;
  project_logo?: string;
  project_name?: string;
  primary_color?: string;
  secondary_color?: string;
  primary_dark_color?: string;
  primary_darker_color?: string;
  avatar_default?: string;
}

const DEFAULT_SETTINGS: Settings = {
  project_name: 'Unaadeb Play',
  primary_color: '#E51C44',
  secondary_color: '#1E293B',
};

/**
 * Busca as configurações do projeto via API Fastify (tabela `app_config`).
 */
export async function getSettings(): Promise<Settings> {
  try {
    // Rota PÚBLICA: o tema/branding é aplicado ANTES do login; o GET /app_config exige auth
    // e dava "Missing bearer token" no boot pré-login.
    const res = await api.request<{ data: Settings[] }>('/public/config');
    return res.data[0] ?? DEFAULT_SETTINGS;
  } catch (error) {
    console.error('Erro ao buscar configurações:', error);
    return DEFAULT_SETTINGS;
  }
}
