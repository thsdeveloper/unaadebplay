import {GenericItem} from './GenericItem';
import {FilesTypes} from "./FilesTypes";
import {UserTypes} from "./UserTypes";

export interface CongressType extends GenericItem {
    status: string;
    name: string;
    poster: string;
    primary_color: string;
    second_color: string;
    theme: string;
    description?: string;
    date_start: Date;
    date_end: Date;
    convidados: UserTypes[];
    status_hospedagem: boolean;
    /** Endereço/nome do local (exibido no card de localização). */
    location?: string | null;
    /** Link explícito de mapa; se vazio, o app busca `location` no mapa. */
    location_url?: string | null;
}