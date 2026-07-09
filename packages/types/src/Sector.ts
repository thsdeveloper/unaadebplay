export interface Sector {
    id: number;
    status: string;
    name: string;
    sort: number;
    user_created: string;
    user_updated: string;
    date_created: Date;
    date_updated: Date;
    pr_coordenador: string;
    lider_coordenador: string;
    tags: string[];
    igrejas: number[];
}
