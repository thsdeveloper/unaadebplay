import { GenericItem } from '../services/items';

export interface LegalDocumentsTypes extends GenericItem {
    title: string;
    content: string;
    date_updated: string;
    type: string;
}