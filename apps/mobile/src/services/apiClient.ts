import { createApiClient } from '@repo/api-client';
import { supabase } from './supabase';
import { resolveApiBaseUrl } from './resolveApiBaseUrl';

/**
 * Cliente da API Fastify (gateway de dados). O token é lido da sessão Supabase,
 * que continua sendo o provedor de identidade (SecureStore + biometria) — só os
 * DADOS passam pela API.
 *
 * A baseUrl é resolvida em runtime (ver resolveApiBaseUrl): em DEV segue o host do
 * Metro → funciona no simulador E no iPhone físico sem depender do IP fixo do .env.
 */
const API_BASE_URL = resolveApiBaseUrl();
if (__DEV__) console.log('[apiClient] baseUrl =', API_BASE_URL);

export const api = createApiClient({
  baseUrl: API_BASE_URL,
  getToken: async () => {
    const { data } = await supabase.auth.getSession();
    return data.session?.access_token ?? null;
  },
});
