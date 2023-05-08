import moment from 'moment';
import 'moment/locale/pt-br';

moment.locale('pt-br');



export function formatTime(dateTimeString: moment.MomentInput, format = 'DD/MM/YYYY HH:mm:ss') {
    return moment(dateTimeString).format(format);
}

export function relativeTime(dateTimeString: moment.MomentInput) {
    return moment(dateTimeString).startOf('hour').fromNow();
}