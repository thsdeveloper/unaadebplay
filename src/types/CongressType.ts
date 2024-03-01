import {GenericItem} from '@/services/items';
import {FilesTypes} from "@/types/FilesTypes";
import {UserTypes} from "@/types/UserTypes";

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
}