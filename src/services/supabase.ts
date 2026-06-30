import 'react-native-url-polyfill/auto';
import { AppState } from 'react-native';
import * as SecureStore from 'expo-secure-store';
import { createClient } from '@supabase/supabase-js';
import type { Database } from '@/types/database.types';

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabasePublishableKey = process.env.EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

if (!supabaseUrl || !supabasePublishableKey) {
    throw new Error(
        'Supabase: defina EXPO_PUBLIC_SUPABASE_URL e EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY no .env',
    );
}

/**
 * Armazenamento da sessão do Supabase em SecureStore (Keychain/Keystore), com cifragem
 * por hardware — o refresh token é credencial de longa duração e NÃO deve ficar em
 * AsyncStorage (texto puro, incluído em backups do dispositivo).
 *
 * SecureStore aceita apenas chaves [A-Za-z0-9._-] e valores de até ~2KB, enquanto a
 * sessão do Supabase (JWT + refresh token + user) pode passar disso. Por isso o valor é
 * fatiado em pedaços e a contagem é guardada num registro "__meta".
 */
const CHUNK_SIZE = 1800;
const sanitizeKey = (key: string) => key.replace(/[^A-Za-z0-9._-]/g, '_');

const SecureStoreAdapter = {
    async getItem(key: string): Promise<string | null> {
        const safe = sanitizeKey(key);
        const meta = await SecureStore.getItemAsync(`${safe}__meta`);
        if (meta == null) {
            // Valor simples (não fatiado) ou inexistente
            return SecureStore.getItemAsync(safe);
        }
        const count = parseInt(meta, 10);
        if (!Number.isFinite(count) || count <= 0) return null;

        let value = '';
        for (let i = 0; i < count; i++) {
            const part = await SecureStore.getItemAsync(`${safe}__${i}`);
            if (part == null) return null; // pedaço ausente → trata como dado corrompido
            value += part;
        }
        return value;
    },

    async setItem(key: string, value: string): Promise<void> {
        const safe = sanitizeKey(key);

        // Limpa pedaços de uma gravação anterior (que pode ter tido mais chunks)
        const prevMeta = await SecureStore.getItemAsync(`${safe}__meta`);
        if (prevMeta != null) {
            const prevCount = parseInt(prevMeta, 10) || 0;
            for (let i = 0; i < prevCount; i++) await SecureStore.deleteItemAsync(`${safe}__${i}`);
            await SecureStore.deleteItemAsync(`${safe}__meta`);
        }

        if (value.length <= CHUNK_SIZE) {
            await SecureStore.setItemAsync(safe, value);
            return;
        }

        const count = Math.ceil(value.length / CHUNK_SIZE);
        for (let i = 0; i < count; i++) {
            await SecureStore.setItemAsync(`${safe}__${i}`, value.slice(i * CHUNK_SIZE, (i + 1) * CHUNK_SIZE));
        }
        await SecureStore.setItemAsync(`${safe}__meta`, String(count));
        await SecureStore.deleteItemAsync(safe); // remove valor simples antigo, se existia
    },

    async removeItem(key: string): Promise<void> {
        const safe = sanitizeKey(key);
        const meta = await SecureStore.getItemAsync(`${safe}__meta`);
        if (meta != null) {
            const count = parseInt(meta, 10) || 0;
            for (let i = 0; i < count; i++) await SecureStore.deleteItemAsync(`${safe}__${i}`);
            await SecureStore.deleteItemAsync(`${safe}__meta`);
        }
        await SecureStore.deleteItemAsync(safe);
    },
};

export const supabase = createClient<Database>(supabaseUrl, supabasePublishableKey, {
    auth: {
        // Sessão cifrada por hardware (refresh token nunca em texto puro)
        storage: SecureStoreAdapter,
        autoRefreshToken: true,
        persistSession: true,
        // Não há deep-link de OAuth via URL no app mobile
        detectSessionInUrl: false,
    },
});

// Pausa/retoma o auto-refresh do token conforme o app vai para foreground/background
// (padrão recomendado pelo Supabase para Expo/React Native). Substitui os setInterval
// manuais de refresh/rotação que existiam no fluxo antigo (Directus).
AppState.addEventListener('change', (state) => {
    if (state === 'active') {
        supabase.auth.startAutoRefresh();
    } else {
        supabase.auth.stopAutoRefresh();
    }
});

export default supabase;
