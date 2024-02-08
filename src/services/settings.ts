import directusClient from "./api";
import {readSettings} from "@directus/sdk";

export async function getSettings() {
    try {
        return await directusClient.request(readSettings())
    } catch (error) {
        throw error;
    }
}