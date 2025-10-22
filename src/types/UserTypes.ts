import {GenericItem} from "../services/items";

export interface UserTypes extends GenericItem{
    first_name: string,
    last_name: string,
    email: string,
    password: string,
    location: string,
    title: string,
    description: string,
    tags: string[],
    avatar: string,
    language: string,
    theme: string,
    tfa_secret: string,
    status: string,
    role: string,
    token: string,
    last_access: string,
    last_page: string,
    sector: string
    gender: string
    phone: string
}

// Export type alias for consistency
export type User = UserTypes;