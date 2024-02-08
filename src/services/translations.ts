import directusClient from "./api";
import {readTranslations} from "@directus/sdk";

export async function getTranslation() {
    try {
        return await directusClient.request(readTranslations())
    } catch (error) {
        throw error;
    }
}