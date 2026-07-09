// Serviço de traduções com suporte a versionamento
// src/services/translations.ts

import { api } from './apiClient';

export interface Translation {
  id: string;
  language: string;
  key: string;
  value: string;
}

// Traduções são strings de UI, necessárias ANTES do login (tela de login usa t()).
// Por isso usamos a rota PÚBLICA /public/translations (o GET /translations exige auth e
// dava "Missing bearer token" no boot pré-login). Ver [[signup-flow-and-public-endpoints]].

// Todas as traduções (via API Fastify, rota pública).
export async function getTranslation(): Promise<Translation[]> {
  const res = await api.request<{ data: Translation[] }>('/public/translations');
  return res.data;
}

// Versão atual das traduções: combina a contagem total com o updated_at mais recente,
// de modo que qualquer inserção/remoção/alteração muda a versão.
export async function getTranslationVersion(): Promise<string> {
  try {
    const res = await api.request<{ data: { updated_at?: string }[]; meta: { total: number } }>('/public/translations');
    const total = res.meta?.total ?? res.data.length;
    const updatedAt = res.data[0]?.updated_at ?? '0'; // rota já ordena por updated_at desc
    return `count-${total}-updated-${updatedAt}`;
  } catch (error) {
    console.warn('Usando fallback para versão das traduções:', error);
    return `time-${Date.now()}`;
  }
}

// Traduções de um idioma específico.
export async function getTranslationByLanguage(langCode: string): Promise<Translation[]> {
  const res = await api.request<{ data: Translation[] }>(`/public/translations?language=${encodeURIComponent(langCode)}`);
  return res.data;
}
