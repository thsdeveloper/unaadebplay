import axios from 'axios'
import AsyncStorage from "@react-native-async-storage/async-storage";
import {ERROR_MESSAGES} from "../constants/errorMessages";
import {authentication, createDirectus, logout, readItems, readMe, rest} from '@directus/sdk';
import {UserTypes} from "../types/UserTypes";

const url = 'https://back-unaadeb.onrender.com'
const directusClient = createDirectus(url).with(authentication('cookie'));


export async function signIn(email, password): Promise<UserTypes> {
    try {
        const authClient = await directusClient.login(email, password)
        console.log('authClient', authClient)
        const client = await directusClient.with(rest())
        return await client.request<UserTypes>(readMe())
    } catch (error) {
        console.error('Erro ao fazer login no Directus:', error);
        throw error;
    }
}

export async function signOut(): Promise<void> {
    try {
        const result = await directusClient.logout()
        console.log('result', result)
    } catch (error) {
        console.error('Erro ao fazer logout:', error);
        throw error;
    }
}


const api = axios.create({
    baseURL: 'https://back-unaadeb.onrender.com',
})

api.interceptors.request.use(async (config) => {
    const access_token = await getAccessToken();
    if (access_token) {
        config.headers.Authorization = `Bearer ${access_token}`;
    }
    return config;
});


const handleErrorsAxios = async (error: any) => {
    const originalConfig = error.config;
    const loginUrl = 'https://back-unaadeb.onrender.com/auth/login';

    if (originalConfig.url !== loginUrl && error.response) {
        // Access Token was expired
        if (error.response.status === 401 && !originalConfig._retry) {
            console.warn('Refresh Token >', !originalConfig._retry)
            originalConfig._retry = true;
            try {
                const refresh = await getRefreshToken();
                const res = await axios.post('https://back-unaadeb.onrender.com/auth/refresh', {
                    refresh_token: refresh,
                });

                const {access_token, refresh_token, expires} = res.data.data;
                await setTokenStorage(access_token, refresh_token, expires);
                return api(originalConfig);
            } catch (_error) {
                return Promise.reject(_error);
            }
        }
    }

    return Promise.reject(error);
};

api.interceptors.response.use((response) => response, handleErrorsAxios);


const getAccessToken = async () => {
    try {
        return await AsyncStorage.getItem('@UNAADEBAuth:access_token');
    } catch (error) {
        console.error(error);
    }
};

const getRefreshToken = async () => {
    try {
        return await AsyncStorage.getItem('@UNAADEBAuth:refresh_token');
    } catch (error) {
        console.error(error);
    }
};

const setTokenStorage = async (access_token: string, refresh_token: string, expires: number) => {
    try {
        await AsyncStorage.setItem('@UNAADEBAuth:access_token', access_token)
        await AsyncStorage.setItem('@UNAADEBAuth:refresh_token', refresh_token)
        await AsyncStorage.setItem('@UNAADEBAuth:expires', String(expires))
    } catch (error) {
        console.error(error);
    }
};

export function handleErrors(errors: any[]): string {
    // Verifique se a matriz de erros não está vazia
    if (errors.length > 0) {
        // Pegue o primeiro erro
        const firstError = errors[0];
        const code = firstError.extensions?.code || 'UNKNOWN';
        // Retorne a mensagem de erro correspondente
        return ERROR_MESSAGES[code] || 'Ocorreu um erro desconhecido.';
    }
    // Retorne uma mensagem de erro padrão se a matriz de erros estiver vazia
    return 'Nenhum erro especificado.';
}


export default api;