import api from "./api";

export interface ResponseDirectusAPI{
    access_token: string;
    expires: number;
    refresh_token: string;
}

export interface ReponseUser{
    id: string,
    first_name: string,
    last_name: string,
    email: string,
    password: string,
    location: string,
    title: string,
    description: string,
    tags: string[],
    avatar: string,
    language: string,
    theme: string,
    tfa_secret: string,
    status: string,
    role: string,
    token: string,
    last_access: string,
    last_page: string
}


export async function signIn(email: string, password: string): Promise<ResponseDirectusAPI>{
    try {
        const response = await api.post(`https://yio4ceoc.directus.app/auth/login`, {email: email, password: password});
        return {
            access_token: response.data.data.access_token,
            refresh_token: response.data.data.refresh_token,
            expires: response.data.data.expires,
        };
    } catch (error) {
        throw error;
    }
}

export async function getUser(): Promise<ReponseUser>{
    try {
        const response = await api.get(`/users/me`);
        return response.data.data;
    } catch (error) {
        throw error;
    }
}

export async function logout(refresh_token: string | null){
    try {
        await api.post(`/auth/logout`, {
            refresh_token: refresh_token
        });
    } catch (error) {
        throw error;
    }
}