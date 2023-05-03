import api from "./api";
import {ReponseUser} from "./auth";
import {AxiosResponse} from "axios";

export interface UserData {
    id?: string,
    first_name: string,
    last_name: string,
    email: string,
    password: string,
    location: string,
    title: string,
    description: string,
    tags?: string[] | null,
    avatar: string | null,
    language: string,
    theme: string,
    tfa_secret: string | null,
    status: string,
    role: string,
    token?: string,
    last_access?: string,
    last_page?: string
}

export async function getUserId(id: string): Promise<ReponseUser>{
    try {
        const response = await api.get(`/users/${id}`);
        return response.data.data;
    } catch (error) {
        throw error;
    }
}

export async function createUser(data: UserData): Promise<AxiosResponse<any> | null> {
    try {
        return await api.post('/users', data);
    } catch (error) {
        console.error('Erro:', error);
        throw error;
    }
}