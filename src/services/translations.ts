// Serviço de traduções atualizado com suporte a versionamento
// src/services/translations.ts

import directusClient from "./api";
import { readTranslations, readItems } from "@directus/sdk";

// Função para obter todas as traduções
export async function getTranslation() {
    try {
        return await directusClient.request(readTranslations());
    } catch (error) {
        throw error;
    }
}

// Função para obter a versão atual das traduções
// Esta função consulta a última data de modificação das traduções
// Função atualizada para obter a versão atual das traduções sem depender de date_updated
export async function getTranslationVersion() {
    try {
        // Abordagem 1: Obter uma contagem de itens na coleção de traduções
        // Quando o número total muda, sabemos que houve alterações
        const result = await directusClient.request(
            readItems('translations', {
                aggregate: { count: 'id' },
                limit: 1
            })
        );

        if (result && result.length > 0) {
            // Usar a contagem total como versão
            return `count-${result[0].count || 0}`;
        }

        // Se a abordagem acima falhar, tentamos uma segunda estratégia
        const sample = await directusClient.request(
            readItems('translations', {
                limit: 1,
                fields: ['id']
            })
        );

        if (sample && sample.length > 0) {
            // Usar um ID de amostra + timestamp atual como versão
            return `id-${sample[0].id}-${Date.now()}`;
        }

        // Fallback final
        return `timestamp-${Date.now()}`;
    } catch (error) {
        // Versão de fallback usando apenas o timestamp atual
        console.warn('Usando fallback para versão das traduções:', error);
        return `time-${Date.now()}`;
    }
}

// Função auxiliar para buscar traduções de um idioma específico
export async function getTranslationByLanguage(langCode: string) {
    try {
        return await directusClient.request(
            readItems('translations', {
                filter: {
                    language: { _eq: langCode }
                }
            })
        );
    } catch (error) {
        throw error;
    }
}
