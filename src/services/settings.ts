import directusClient from "./api";
import { readSettings } from "@directus/sdk";

export interface Settings {
    [key: string]: any;
    project_logo?: string;
    project_name?: string;
    primary_color?: string;
    secondary_color?: string;
}

/**
 * Busca as configurações do projeto no Directus
 * @returns Promise com os dados de configuração
 */
export async function getSettings(): Promise<Settings> {
    try {
        const settings = await directusClient.request(readSettings());
        return settings || {};
    } catch (error) {
        console.error("Erro ao buscar configurações:", error);
        throw error;
    }
}
