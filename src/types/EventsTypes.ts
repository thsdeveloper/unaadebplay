import {GenericItem} from '@/services/items';
import {FilesTypes} from "./FilesTypes";

export interface EventsTypes extends GenericItem {
    status: string | null;
    sort: number | null;
    user_created: string | null;
    date_created: Date | null;
    user_updated: string | null;
    date_updated: Date | null;
    title: string;
    description: string;
    start_date_time: Date;
    end_date_time: Date;
    location: string;
    organizer: string;
    event_type: string;
    organizer_contact_info: string | null;
    image_cover: string;
}