import moment from 'moment';
import 'moment/locale/pt-br';
import {ERROR_MESSAGES} from "@/constants/errorMessages";
moment.locale('pt-br');

export function formatTime(dateTimeString: moment.MomentInput, format = 'DD/MM/YYYY HH:mm:ss') {
    return moment(dateTimeString).format(format);
}

export function relativeTime(dateTimeString: moment.MomentInput) {
    return moment(dateTimeString).startOf('hour').fromNow();
}

// Substitua a função handleErrors em src/utils/directus.ts
export function handleErrors(errors: any): string {
    // Verificar se errors é undefined ou null
    if (!errors) {
        return 'Ocorreu um erro desconhecido.';
    }

    // Se errors é uma string, retornar diretamente
    if (typeof errors === 'string') {
        return errors;
    }

    // Se errors é um objeto Error simples
    if (errors instanceof Error) {
        return errors.message;
    }

    // Se errors é um array (formato esperado do Directus)
    if (Array.isArray(errors) && errors.length > 0) {
        const firstError = errors[0];
        const code = firstError.extensions?.code || 'UNKNOWN';
        return ERROR_MESSAGES[code] || firstError.message || 'Ocorreu um erro desconhecido.';
    }

    // Se errors é um objeto com propriedade message
    if (typeof errors === 'object' && errors.message) {
        return errors.message;
    }

    // Fallback
    return 'Ocorreu um erro desconhecido.';
}

export function formatPhoneNumber(phoneNumber) {
    // Remove caracteres não numéricos
    const numericPhoneNumber = phoneNumber.replace(/\D/g, '');

    // Adiciona o código do país ao número formatado
    const formattedPhoneNumber = `+55${numericPhoneNumber}`;

    return formattedPhoneNumber;
}

export function formatDateToISO(birthdate: string){
    const parts = birthdate.split('/');
    const formattedDate = new Date(parts[2], parts[1] - 1, parts[0]); // Note que os meses são indexados a partir de 0
    return formattedDate.toISOString(); // Converte para o formato ISO string
}

export function calculateAge(birthdate: string){
    // Converte a data de DD/MM/AAAA para AAAA-MM-DD
    const parts = birthdate.split('/');
    const formattedDate = `${parts[2]}-${parts[1]}-${parts[0]}`;

    const birthDate = new Date(formattedDate);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
        age--;
    }
    return age;
}

export function formatCurrency(value) {
    // Configura o formatador de número para o estilo de moeda brasileiro
    const formatter = new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL',
        // Especifica a exibição mínima de casas decimais
        minimumFractionDigits: 2,
    });

    return formatter.format(value);
}
