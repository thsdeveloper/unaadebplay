import directusClient from "./api";
import {createItem, deleteItem, readItem, readItems, readSingleton, updateItem} from "@directus/sdk";
import {GlobalQueryParams} from "@/types/GlobalQueryParamsTypes";

export interface GenericItem {
    id: string;
}

export async function getItems(collectionName: string,  params?: GlobalQueryParams): Promise<any> {
    try {
        return await directusClient.request(readItems(collectionName, params));
    } catch (error) {
        throw error;
    }
}

export async function getItem(collectionName: string, id: number, params?: GlobalQueryParams): Promise<any> {
    try {
        return await directusClient.request(readItem(collectionName, id, params));
    } catch (error) {
        throw error;
    }
}

export async function getItemSingleton(collectionName: string, params?: GlobalQueryParams): Promise<any> {
    try {
        return await directusClient.request(readSingleton(collectionName, params));
    } catch (error) {
        throw error;
    }
}

export async function setCreateItem<T extends GenericItem>(collectionName: string, item: any): Promise<any> {
    try {
        return await directusClient.request(createItem(collectionName, item));
    } catch (error) {
        throw error;
    }
}

export async function setUpdateItem<T extends GenericItem>(collectionName: string, id: number, item: Partial<T>): Promise<any> {
    try {
        return await directusClient.request(updateItem(collectionName, id, item))
    } catch (error) {
        throw error;
    }
}

export async function setDeleteItem(collectionName: string, id: number): Promise<void> {
    try {
        return await directusClient.request(deleteItem(collectionName, id))
    } catch (error) {
        throw error;
    }
}
