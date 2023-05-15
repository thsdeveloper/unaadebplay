import { GenericItem } from '../services/items';

export interface BannerTypes extends GenericItem {
    title: string | null;
    status: string | null;
    sort: number | null;
    date_created: Date | null;
    image: string;
    description: string;
    page_route: string;
    id_route: string;
}