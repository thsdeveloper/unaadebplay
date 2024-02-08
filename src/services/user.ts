import directusClient from "./api";
import {UserTypes} from "../types/UserTypes";
import {GlobalQueryParams} from "../types/GlobalQueryParamsTypes";
import {GenericItem} from "./items";
import {createUser, readUser, readUsers, updateMe} from "@directus/sdk";

export async function getUsers<T extends GenericItem>(params?: GlobalQueryParams):Promise<UserTypes[]> {
    try {
        return await directusClient.request<UserTypes[]>(readUsers(params));
    } catch (error) {
        throw error;
    }
}

export async function getUser<T extends GenericItem>(id: string, params?: GlobalQueryParams): Promise<UserTypes>{
    try {
        return await directusClient.request<UserTypes>(readUser(id, params))
    } catch (error) {
        throw error;
    }
}

export async function setUser(userObject: any): Promise<UserTypes> {
    try {
        return await directusClient.request<UserTypes>(createUser(userObject))
    } catch (error) {
        throw error;
    }
}

export async function updateUserMe(parcelUserObject: any): Promise<UserTypes> {
    try {
        return await directusClient.request<UserTypes>(updateMe(parcelUserObject));
    } catch (error) {
        throw error;
    }
}

export const emailExists = async (email: string): Promise<boolean> => {
    const queryParams: GlobalQueryParams = {
        filter: {
            email: {
                _eq: email,
            },
        },
    };
    try {
        const users = await getUsers(queryParams); // substitua pela sua chamada de API
        return users.length === 1;
    } catch (error) {
        console.error('Erro ao verificar e-mail:', error);
        return false;
    }
};