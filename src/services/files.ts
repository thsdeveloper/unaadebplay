import directusClient from "./api";
import {DirectusFile, readFile, uploadFiles, updateFile, deleteFile} from "@directus/sdk";
import {GlobalQueryParams} from "@/types/GlobalQueryParamsTypes";


export async function getAssetURI(fileId: string, params?: GlobalQueryParams): Promise<any> {
    try {
        return await directusClient.request(readFile(fileId, params));
    } catch (error) {
        throw error;
    }
}

export async function uploadFile(uri: any): Promise<DirectusFile<any>> {
    let formData = new FormData();
    let name = uri.split("/").pop();
    let match = /\.(\w+)$/.exec(name);
    let type = match ? `image/${match[1]}` : `image`;

    // Usar 'any' para evitar erro de tipo no FormData
    formData.append('file', {uri: uri, name: name, type} as any);

    try {
        return await directusClient.request<DirectusFile<any>>(uploadFiles(formData));
    } catch (error) {
        throw error;
    }
}

export async function setUpdateFile(id: string, fileObject: FormData | Partial<DirectusFile<any>>): Promise<DirectusFile<any>> {
    try {
        return await directusClient.request<DirectusFile<any>>(updateFile(id, fileObject));
    } catch (error) {
        throw error;
    }
}

export async function setDeleteFile(id: string): Promise<void> {
    try {
        return await directusClient.request(deleteFile(id));
    } catch (error) {
        throw error;
    }
}

export async function uploadImage(uri: string, folder?: string): Promise<DirectusFile<any>> {
    let formData = new FormData();
    let name = uri.split("/").pop();
    let match = /\.(\w+)$/.exec(name);
    let type = match ? `image/${match[1]}` : `image`;

    formData.append('file', {uri: uri, name: name, type} as any);
    
    if (folder) {
        formData.append('folder', folder);
    }

    try {
        return await directusClient.request<DirectusFile<any>>(uploadFiles(formData));
    } catch (error) {
        throw error;
    }
}

// Exportar como objeto para facilitar o uso
export const filesService = {
    getAssetURI,
    uploadFile,
    uploadImage,
    setUpdateFile,
    setDeleteFile,
};