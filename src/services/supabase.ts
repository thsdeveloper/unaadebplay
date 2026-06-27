import 'react-native-url-polyfill/auto';
import { AppState } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';
import type { Database } from '@/types/database.types';

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabasePublishableKey = process.env.EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

if (!supabaseUrl || !supabasePublishableKey) {
    throw new Error(
        'Supabase: defina EXPO_PUBLIC_SUPABASE_URL e EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY no .env',
    );
}

export const supabase = createClient<Database>(supabaseUrl, supabasePublishableKey, {
    auth: {
        // Persiste a sessão no AsyncStorage (sem limite de tamanho, ao contrário do SecureStore)
        storage: AsyncStorage,
        autoRefreshToken: true,
        persistSession: true,
        // Não há deep-link de OAuth via URL no app mobile
        detectSessionInUrl: false,
    },
});

// Pausa/retoma o auto-refresh do token conforme o app vai para foreground/background
// (padrão recomendado pelo Supabase para Expo/React Native)
AppState.addEventListener('change', (state) => {
    if (state === 'active') {
        supabase.auth.startAutoRefresh();
    } else {
        supabase.auth.stopAutoRefresh();
    }
});

export default supabase;
