// Serviço de traduções com suporte a versionamento
// src/services/translations.ts

import { supabase } from "./supabase";

export interface Translation {
    id: string;
    language: string;
    key: string;
    value: string;
}

// Função para obter todas as traduções
export async function getTranslation(): Promise<Translation[]> {
    const { data, error } = await supabase
        .from('translations')
        .select('id, language, key, value');

    if (error) throw error;

    return data ?? [];
}

// Função para obter a versão atual das traduções.
// Combina a contagem total com o timestamp de atualização mais recente:
// quando qualquer linha é inserida, removida ou alterada, a versão muda.
export async function getTranslationVersion(): Promise<string> {
    try {
        const [{ count, error: countError }, lastUpdated] = await Promise.all([
            supabase
                .from('translations')
                .select('id', { count: 'exact', head: true }),
            supabase
                .from('translations')
                .select('updated_at')
                .order('updated_at', { ascending: false })
                .limit(1)
                .maybeSingle(),
        ]);

        if (countError) throw countError;
        if (lastUpdated.error) throw lastUpdated.error;

        const total = count ?? 0;
        const updatedAt = lastUpdated.data?.updated_at ?? '0';

        return `count-${total}-updated-${updatedAt}`;
    } catch (error) {
        // Versão de fallback usando apenas o timestamp atual
        console.warn('Usando fallback para versão das traduções:', error);
        return `time-${Date.now()}`;
    }
}

// Função auxiliar para buscar traduções de um idioma específico
export async function getTranslationByLanguage(langCode: string): Promise<Translation[]> {
    const { data, error } = await supabase
        .from('translations')
        .select('id, language, key, value')
        .eq('language', langCode);

    if (error) throw error;

    return data ?? [];
}
