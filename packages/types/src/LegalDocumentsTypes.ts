import { GenericItem } from './GenericItem';

export interface LegalDocumentsTypes extends GenericItem {
    title: string;
    content: string;
    date_updated: string;
    type: string;
}