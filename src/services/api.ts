import axios from 'axios'
import AsyncStorage from "@react-native-async-storage/async-storage";
import {ERROR_MESSAGES} from "../constants/errorMessages";


const api = axios.create({
    baseURL: 'https://back-unaadeb.onrender.com',
})

api.interceptors.request.use(async (config) => {
    const access_token = await getAccessToken();
    if(access_token){
        config.headers.Authorization = `Bearer ${access_token}`;
    }
    return config;
});


const handleErrorsAxios = async (error: any) => {
    const originalConfig = error.config;
    console.log(`originalConfig`, originalConfig)
    const loginUrl = 'https://back-unaadeb.onrender.com/auth/login';

    if (originalConfig.url !== loginUrl && error.response) {
        // const message = handleErrors(error.response.data.errors);

        // Access Token was expired
        if (error.response.status === 401 && !originalConfig._retry) {
            console.warn('Refresh Token >', !originalConfig._retry)
            originalConfig._retry = true;
            try {
                const refresh = await getRefreshToken();
                const res = await axios.post('https://back-unaadeb.onrender.com/auth/refresh', {
                    refresh_token: refresh,
                });

                const { access_token, refresh_token, expires } = res.data.data;
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
        const refresh_token = await AsyncStorage.getItem('@UNAADEBAuth:refresh_token');
        return refresh_token;
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

export function handleErrors(errors: any[]) {
    return errors.map((error) => {
        const code = error.extensions?.code || 'UNKNOWN';
        return ERROR_MESSAGES[code] || 'Ocorreu um erro desconhecido.';
    });
}


export default api;