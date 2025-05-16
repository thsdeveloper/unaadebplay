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
export async function getTranslationVersion() {
    try {
        // Abordagem 1: Obter a entrada mais recentemente modificada
        const result = await directusClient.request(
            readItems('translations', {
                sort: ['-date_updated'],
                limit: 1,
                fields: ['date_updated']
            })
        );

        // Retorna o timestamp da última atualização ou gera um hash baseado na data atual
        if (result && result.length > 0 && result[0].date_updated) {
            return result[0].date_updated;
        }

        // Abordagem 2: Alternativa se o método acima falhar
        // Gerar um timestamp como fallback
        return new Date().toISOString();
    } catch (error) {
        console.error('Erro ao obter versão das traduções:', error);
        // Retornar timestamp atual como fallback
        return new Date().toISOString();
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
