import {GenericItem} from "./GenericItem";

/** Quais redes sociais o usuário escolhe EXIBIR no perfil (config em Ajustes). */
export interface SocialVisibility {
    instagram?: boolean;
    linkedin?: boolean;
    tiktok?: boolean;
    whatsapp?: boolean;
}

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
    cover_image?: string | null,
    instagram?: string | null,
    linkedin?: string | null,
    tiktok?: string | null,
    whatsapp?: string | null,
    social_visibility?: SocialVisibility | null,
    followers_count?: number,
    following_count?: number,
    is_following?: boolean,
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
    created_at?: string
}

// Export type alias for consistency
export type User = UserTypes;