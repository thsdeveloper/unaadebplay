import api from "./api";
import {handleErrors} from "../utils/directus";

export interface NewsItem {
    id: number;
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

export function loadNews(setNews: (news: NewsItem[]) => void, setIsLoading: (loading: boolean) => void, setError: (error: string) => void) {
    api.get('/items/posts',
        {
            params: {
                filter: {status: {_eq: 'published'}}
            }
        }).then(({data: {data}}) => {
        setNews(data);
        setIsLoading(false);
        setError('');
    }).catch((error) => {
        const message = handleErrors(error.response.data.errors);
        setIsLoading(false);
        setNews([]);
        setError(message);
    });
}
