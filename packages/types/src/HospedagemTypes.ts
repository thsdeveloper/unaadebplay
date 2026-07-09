export interface HospedagemTypes {
    id: number;
    status: string;
    user_created: string;
    user_updated: string;
    date_created: Date;
    date_updated: Date;
    titulo: string;
    descricao: string;
    tipo: string[];
    vagas_disponiveis: number;
    vagas_ocupadas: number;
    custo: number;
    comodidades: string[];
    regras: string;
    disponibilidade: Date;
    anfitriao: string;
}
