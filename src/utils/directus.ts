import api from "../services/api";
import moment from 'moment';
import 'moment/locale/pt-br';
import {ERROR_MESSAGES} from "../constants/errorMessages";

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

export function relativeTime(dateTimeString: moment.MomentInput){
    return moment(dateTimeString).startOf('hour').fromNow();
}

export function handleErrors(errors: any[]) {
    return errors.map((error) => {
        const code = error.extensions?.code || 'UNKNOWN';
        return ERROR_MESSAGES[code] || 'Ocorreu um erro desconhecido.';
    });
}