import api from "../services/api";
import moment from 'moment';
import 'moment/locale/pt-br';
import {ERROR_MESSAGES} from "../constants/errorMessages";
import {getUsers, GlobalQueryParams} from "../services/user";

moment.locale('pt-br');

export async function getImageData(url: string): Promise<string> {
    const response = await api.get(url, { responseType: 'blob' });
    const reader = new FileReader();
    reader.readAsDataURL(response.data);
    return new Promise((resolve, reject) => {
        reader.onloadend = () => {
            const base64data = reader.result;
            resolve(base64data as string);
        };
        reader.onerror = reject;
    });
}

export function formatTime(dateTimeString: moment.MomentInput, format = 'DD/MM/YYYY HH:mm:ss') {
    return moment(dateTimeString).format(format);
}

export function relativeTime(dateTimeString: moment.MomentInput) {
    return moment(dateTimeString).startOf('hour').fromNow();
}

export function handleErrors(errors: any[]) {
    return errors.map((error) => {
        const code = error.extensions?.code || 'UNKNOWN';
        return ERROR_MESSAGES[code] || 'Ocorreu um erro desconhecido.';
    });
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

export async function fetchImage(id): Promise<string | null> {
    try {
        const response = await api.get(`/assets/${id}`, {
            responseType: 'blob',
        });

        const reader = new FileReader();
        reader.readAsDataURL(response.data);
        return new Promise((resolve, reject) => {
            reader.onloadend = () => {
                const base64data = reader.result;
                resolve(base64data as string);
            };
            reader.onerror = reject;
        });


        console.log('REXXX', response.data)

        // Converter ArrayBuffer para base64
        // const base64 = Buffer.from(response.data, 'binary').toString('base64');

        // Criar uma URL Data para exibir a imagem
        // return response.data;
    } catch (error) {
        console.error(error);
        return null;
    }
}