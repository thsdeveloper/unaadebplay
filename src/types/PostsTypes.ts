import {GenericItem} from "../services/items";

export interface PostsTypes extends GenericItem{
    status: string;
    title: string;
    sort: number;
    user_created: string;
    user_updated: string;
    date_created: Date;
    date_updated: Date;
    description: string;
    content: string;
    tags: string[];
    image: string;
}