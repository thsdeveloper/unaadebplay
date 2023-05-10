import { GenericItem } from '../services/items';
import {FilesTypes} from "./FilesTypes";

export interface RepertoriesTypes extends GenericItem {
    title: string | null;
    status: string | null;
    sort: number | null;
    image_cover: FilesTypes;
    artist: string;
    mp3: FilesTypes;
    category: string[]
    content: string
}