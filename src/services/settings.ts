import { supabase } from "./supabase";

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
 * Busca as configurações do projeto no Supabase (tabela `app_config`).
 * @returns Promise com os dados de configuração
 */
export async function getSettings(): Promise<Settings> {
    try {
        const { data, error } = await supabase
            .from('app_config')
            .select('*')
            .limit(1)
            .maybeSingle();

        if (error) throw error;

        return data ?? DEFAULT_SETTINGS;
    } catch (error) {
        console.error("Erro ao buscar configurações:", error);
        // Retorna configurações padrão em vez de lançar erro
        return DEFAULT_SETTINGS;
    }
}
