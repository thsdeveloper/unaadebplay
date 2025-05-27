import { GenericItem } from "../services/items";
import { UserTypes } from "./UserTypes";

export interface NewsCategory {
  id: string;
  name: string;
  slug: string;
  description?: string;
  icon?: string;
  color?: string;
  sort?: number;
}

export interface NewsTag {
  id: string;
  name: string;
  slug: string;
}

export interface NewsTypes extends GenericItem {
  status: 'draft' | 'published' | 'archived';
  title: string;
  slug: string;
  excerpt?: string;
  content: string;
  featured_image?: string;
  gallery?: string[];
  category?: NewsCategory;
  tags?: NewsTag[];
  author?: UserTypes;
  publish_date: Date;
  views_count?: number;
  reading_time?: number;
  featured?: boolean;
  meta_title?: string;
  meta_description?: string;
  date_created: Date;
  date_updated: Date;
  user_created: string;
  user_updated: string;
}

export interface NewsFilters {
  category?: string;
  tags?: string[];
  search?: string;
  status?: 'draft' | 'published' | 'archived';
  featured?: boolean;
  date_from?: Date;
  date_to?: Date;
}

export interface NewsPaginationParams {
  page: number;
  limit: number;
  sort?: string[];
  filter?: NewsFilters;
}

export interface NewsResponse {
  data: NewsTypes[];
  meta: {
    total_count: number;
    filter_count: number;
  };
}