interface SendCodeAttempt {
    time: string;
    channel: string;
    attempt_sid: string;
}

export interface VerificationTwilioType {
    sid: string;
    service_sid: string;
    account_sid: string;
    to: string;
    channel: string;
    status: string;
    valid: boolean;
    date_created: string;
    date_updated: string;
    lookup: Record<string, any>; // Use 'any' se o conteúdo de 'lookup' for desconhecido ou variável
    amount: null | number; // Assumindo que 'amount' pode ser um número ou nulo
    payee: null | string; // Assumindo que 'payee' pode ser uma string ou nulo
    send_code_attempts: SendCodeAttempt[];
    sna: null; // Assumindo que 'sna' é sempre nulo, caso contrário, defina o tipo apropriado
    url: string;
}

export interface VerificationCheckType {
    sid: string;
    service_sid: string;
    account_sid: string;
    to: string;
    channel: string;
    status: string;
    valid: boolean;
    amount: null; // Assumindo que 'amount' é sempre nulo, caso contrário, ajuste conforme necessário
    payee: null; // Assumindo que 'payee' é sempre nulo, caso contrário, ajuste conforme necessário
    sna_attempts_error_codes: number[]; // Se os códigos de erro forem sempre numéricos
    date_created: string;
    date_updated: string;
}

