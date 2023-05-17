import api from "./api";
import {AxiosResponse} from "axios";
import {UserTypes} from "../types/UserTypes";
import {GlobalQueryParams} from "../types/GlobalQueryParamsTypes";
import {GenericItem} from "./items";

export async function getUserId<T extends GenericItem>(id: string): Promise<UserTypes>{
    try {
        const response = await api.get(`/users/${id}`);
        return response.data.data;
    } catch (error) {
        throw error;
    }
}

export async function createUser(data: UserTypes): Promise<AxiosResponse<any> | null> {
    try {
        return await api.post('/users', data);
    } catch (error) {
        console.error('Erro:', error);
        throw error;
    }
}

export async function getUsers<T extends GenericItem>(params?: GlobalQueryParams):Promise<UserTypes[]> {
    try {
        const response = await api.get('/users', {
            params,
        });
        return response.data.data;
    } catch (error) {
        console.error('Erro ao buscar usuários:', error);
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