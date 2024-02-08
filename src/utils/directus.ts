import moment from 'moment';
import 'moment/locale/pt-br';
import {ERROR_MESSAGES} from "../constants/errorMessages";
moment.locale('pt-br');

export function formatTime(dateTimeString: moment.MomentInput, format = 'DD/MM/YYYY HH:mm:ss') {
    return moment(dateTimeString).format(format);
}

export function relativeTime(dateTimeString: moment.MomentInput) {
    return moment(dateTimeString).startOf('hour').fromNow();
}

export function handleErrors(errors: any[]): string {
    if (errors.length > 0) {
        const firstError = errors[0];
        const code = firstError.extensions?.code || 'UNKNOWN';
        return ERROR_MESSAGES[code] || 'Ocorreu um erro desconhecido.';
    }
    return 'Nenhum erro especificado.';
}
