import { api } from '@/services/apiClient';
import {
  NewsTypes,
  NewsCategory,
  NewsTag,
  NewsPaginationParams,
  NewsResponse,
} from '@/types/NewsTypes';

export interface INewsService {
  getNews(params?: NewsPaginationParams): Promise<NewsResponse>;
  getNewsById(id: string): Promise<NewsTypes>;
  getNewsBySlug(slug: string): Promise<NewsTypes>;
  getCategories(): Promise<NewsCategory[]>;
  getTags(): Promise<NewsTag[]>;
  incrementViewCount(id: string): Promise<void>;
  getFeaturedNews(): Promise<NewsTypes[]>;
  getRelatedNews(newsId: string, limit?: number): Promise<NewsTypes[]>;
}

/**
 * Camada de notícias — 100% via API Fastify (gateway). Nada de Supabase direto aqui:
 * a API expõe o shape rico (embeds de categoria/autor, tags m2m, galeria ordenada) no
 * módulo `apps/api/src/modules/news.ts`. O Supabase segue APENAS como provedor de
 * identidade (o token vai no api-client). Ver [[monorepo-mobile-api-admin]].
 */
class NewsService implements INewsService {
  private readonly DEFAULT_LIMIT = 10;

  async getNews(params?: NewsPaginationParams): Promise<NewsResponse> {
    const { page = 1, limit = this.DEFAULT_LIMIT, filter = {} } = params || {};
    const res = await api.news.list<NewsTypes>({
      page,
      limit,
      category: filter.category,
      featured: filter.featured,
      search: filter.search,
      tags: filter.tags,
    });
    return {
      data: res.data,
      meta: { total_count: res.meta.total, filter_count: res.meta.total },
    };
  }

  async getNewsById(id: string): Promise<NewsTypes> {
    return api.news.get<NewsTypes>(id);
  }

  async getNewsBySlug(slug: string): Promise<NewsTypes> {
    return api.news.getBySlug<NewsTypes>(slug);
  }

  async getCategories(): Promise<NewsCategory[]> {
    const res = await api.resource<NewsCategory>('news_categories').list({ sort: ['sort', 'name'], limit: 200 });
    return res.data;
  }

  async getTags(): Promise<NewsTag[]> {
    const res = await api.resource<NewsTag>('news_tags').list({ sort: 'name', limit: 500 });
    return res.data;
  }

  async incrementViewCount(id: string): Promise<void> {
    try {
      await api.news.incrementViews(id);
    } catch (error) {
      console.error('Error incrementing view count:', error);
    }
  }

  async getFeaturedNews(): Promise<NewsTypes[]> {
    const response = await this.getNews({ page: 1, limit: 5, filter: { featured: true } });
    return response.data;
  }

  async getRelatedNews(newsId: string, limit: number = 3): Promise<NewsTypes[]> {
    try {
      const res = await api.news.related<NewsTypes>(newsId, limit);
      return res.data;
    } catch (error) {
      console.error('Error fetching related news:', error);
      return [];
    }
  }
}

export const newsService = new NewsService();
