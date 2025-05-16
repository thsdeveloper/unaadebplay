import { GenericItem } from '@/services/items';

export interface BannerTypes extends GenericItem {
    status: string | null;
    sort: number | null;
    title: string | null;
    date_created: Date | null;
    image: string;
    description: string | null;
    page_route: string;
    screen: string;
    params_id: string | null;
}
