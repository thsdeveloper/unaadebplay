import { GenericItem } from '../services/items';

export interface LegalDocuments extends GenericItem {
    title: string;
    content: string;
    date_updated: string;
    type: string;
}