import api from "./api";
import {handleErrors} from "../utils/directus";
import {NewsItem} from "./news";

export interface SectorItem {
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

export function loadSectors(setSectors: (sectors: SectorItem[]) => void, setIsLoading: (loading: boolean) => void, setError: (error: string) => void) {
    api.get('/items/setores',
        {
            params: {
                filter: {status: {_eq: 'published'}}
            }
        }).then(({data: {data}}) => {
        setSectors(data);
        setIsLoading(false);
        setError('');
    }).catch((error) => {
        const message = handleErrors(error.response.data.errors);
        setIsLoading(false);
        setSectors([]);
        setError(message);
    });
}