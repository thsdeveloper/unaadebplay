import axios from 'axios'
import AsyncStorage from "@react-native-async-storage/async-storage";
import {ResponseDirectusAPI} from "./auth";
// import { showMessage, hideMessage } from 'react-native-flash-message';

const api = axios.create({
    baseURL: 'https://yio4ceoc.directus.app',
})
// api.interceptors.response.use(
//     response => response,
//     error => {
//         flashMessage();
//         return Promise.reject(error);
//     }
// );

// const flashMessage = () => {
//     return showMessage({
//         message: 'Erro',
//         description: 'Ocorreu um erro ao processar a requisição.',
//         type: 'danger',
//         icon: 'danger',
//     });
// };
//

api.interceptors.request.use(async (config) => {
    const access_token = await getAccessToken();
    if(access_token){
        console.log('Request >', access_token)
        config.headers.Authorization = `Bearer ${access_token}`;
    }
    return config;
});

api.interceptors.response.use(
    (response) => response,
    async (err) => {
        const originalConfig = err.config;

        if (originalConfig.url !== "/auth/login" && err.response) {
            // Access Token was expired
            if (err.response.status === 401 && !originalConfig._retry) {
                originalConfig._retry = true;
                try {
                    const refresh = await getRefreshToken();
                    const res = await axios.post("https://yio4ceoc.directus.app/auth/refresh", {
                        refresh_token: refresh,
                        mode: 'json'
                    });
                    console.log('THIAGO', res)
                    const { access_token, refresh_token, expires }: ResponseDirectusAPI = res.data.data;
                    await setTokenStorage(access_token, refresh_token, expires)
                    return api(originalConfig);
                } catch (_error) {
                    return Promise.reject(_error);
                }
            }
        }
        return Promise.reject(err);
    }
);

// api.interceptors.response.use(
//     (response) => response,
//     (error) => {
//         if (error.response.status === 401) {
//             getRefreshToken().then(refresh_token => {
//                 if (refresh_token) {
//                     return axios.post(`https://yio4ceoc.directus.app/auth/refresh`, {refresh_token})
//                         .then((res) => {
//                             console.log('refresh: access_token', res.data.data.access_token)
//                             console.log('refresh: refresh_token', res.data.data.refresh_token)
//                             console.log('refresh: expires', res.data.data.expires)
//
//                             setTokenStorage(res.data.data.access_token, res.data.data.refresh_token, res.data.data.data.expires)
//                             error.config.headers.Authorization = `Bearer ${res.data.data.access_token}`;
//                             return api(error.config);
//                         });
//                 }
//             })
//         }
//         return Promise.reject(error);
//     }
// );

const getAccessToken = async () => {
    try {
        const accessToken = await AsyncStorage.getItem('@UNAADEBAuth:access_token');
        return accessToken;
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


export default api;