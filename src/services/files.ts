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

export async function uploadFile(uri: any): Promise<DirectusFile> {
    let formData = new FormData();
    let name = uri.split("/").pop();
    let match = /\.(\w+)$/.exec(name);
    let type = match ? `image/${match[1]}` : `image`;

    formData.append('file', {uri: uri, name: name, type});

    try {
        return await directusClient.request<DirectusFile>(uploadFiles(formData));
    } catch (error) {
        throw error;
    }
}

export async function setUpdateFile(id: string, fileObject: FormData | Partial<DirectusFile<object>>): Promise<DirectusFile> {
    try {
        return await directusClient.request<DirectusFile>(updateFile(id, fileObject));
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