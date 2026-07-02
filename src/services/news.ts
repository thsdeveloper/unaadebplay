import { supabase } from '@/services/supabase';
import {
  NewsTypes,
  NewsCategory,
  NewsTag,
  NewsPaginationParams,
  NewsResponse
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

// category/author são FKs embutidas; tags vêm da m2m news_news_tags->news_tags;
// gallery vem de news_news_gallery.file_path. (author pode vir null: profiles é owner-only.)
// `news` tem 3 FKs para `profiles` (author, created_by, updated_by); é preciso desambiguar
// o embed do autor com a FK explícita, senão o PostgREST retorna PGRST201.
const NEWS_SELECT = `
  id,status,title,slug,excerpt,content,featured_image,publish_date,views_count,reading_time,featured,created_at,updated_at,
  category:news_categories(id,name,slug,description,icon,color,sort),
  author:profiles!news_author_fkey(id,first_name,last_name,avatar),
  news_news_tags(news_tags(id,name,slug)),
  news_news_gallery(file_path,sort)
`;

function mapNews(row: any): NewsTypes {
  const tags = (row?.news_news_tags ?? [])
    .map((t: any) => t.news_tags)
    .filter(Boolean);
  const gallery = (row?.news_news_gallery ?? [])
    .slice()
    .sort((a: any, b: any) => (a.sort ?? 0) - (b.sort ?? 0))
    .map((g: any) => g.file_path);
  return { ...row, tags, gallery } as NewsTypes;
}

class NewsService implements INewsService {
  private readonly DEFAULT_LIMIT = 10;

  async getNews(params?: NewsPaginationParams): Promise<NewsResponse> {
    const { page = 1, limit = this.DEFAULT_LIMIT, filter = {} } = params || {};

    // Filtro por tags (m2m): pré-consulta os news_id que possuem as tags selecionadas.
    let tagNewsIds: string[] | null = null;
    if (filter.tags && filter.tags.length > 0) {
      const { data: tagRows, error: tagErr } = await supabase
        .from('news_news_tags')
        .select('news_id')
        .in('news_tags_id', filter.tags);
      if (tagErr) throw tagErr;
      tagNewsIds = [...new Set((tagRows ?? []).map((r: any) => r.news_id))];
      if (tagNewsIds.length === 0) {
        return { data: [], meta: { total_count: 0, filter_count: 0 } };
      }
    }

    let q = supabase
      .from('news')
      .select(NEWS_SELECT, { count: 'exact' })
      .eq('status', 'published')
      .lte('publish_date', new Date().toISOString());

    if (filter.category) q = q.eq('category', filter.category);
    if (filter.featured !== undefined) q = q.eq('featured', filter.featured);
    if (filter.search) {
      const s = filter.search;
      q = q.or(`title.ilike.%${s}%,excerpt.ilike.%${s}%,content.ilike.%${s}%`);
    }
    if (tagNewsIds) q = q.in('id', tagNewsIds);

    q = q.order('publish_date', { ascending: false }).range((page - 1) * limit, page * limit - 1);

    const { data, error, count } = await q;
    if (error) throw error;

    return {
      data: (data ?? []).map(mapNews),
      meta: { total_count: count ?? 0, filter_count: count ?? 0 },
    };
  }

  async getNewsById(id: string): Promise<NewsTypes> {
    const { data, error } = await supabase.from('news').select(NEWS_SELECT).eq('id', id).single();
    if (error) throw error;
    return mapNews(data);
  }

  async getNewsBySlug(slug: string): Promise<NewsTypes> {
    const { data, error } = await supabase
      .from('news')
      .select(NEWS_SELECT)
      .eq('slug', slug)
      .eq('status', 'published')
      .limit(1)
      .maybeSingle();
    if (error) throw error;
    if (!data) throw new Error('News not found');
    return mapNews(data);
  }

  async getCategories(): Promise<NewsCategory[]> {
    const { data, error } = await supabase
      .from('news_categories')
      .select('*')
      .order('sort', { ascending: true })
      .order('name', { ascending: true });
    if (error) throw error;
    return (data ?? []) as unknown as NewsCategory[];
  }

  async getTags(): Promise<NewsTag[]> {
    const { data, error } = await supabase.from('news_tags').select('*').order('name', { ascending: true });
    if (error) throw error;
    return (data ?? []) as unknown as NewsTag[];
  }

  async incrementViewCount(id: string): Promise<void> {
    // news é read-only pela RLS; o incremento é feito por RPC SECURITY DEFINER.
    const { error } = await supabase.rpc('increment_news_views', { p_id: id });
    if (error) console.error('Error incrementing view count:', error);
  }

  async getFeaturedNews(): Promise<NewsTypes[]> {
    const response = await this.getNews({ page: 1, limit: 5, filter: { featured: true } });
    return response.data;
  }

  async getRelatedNews(newsId: string, limit: number = 3): Promise<NewsTypes[]> {
    try {
      const current = await this.getNewsById(newsId);
      const categoryId = (current.category as any)?.id;
      if (!categoryId && (!current.tags || current.tags.length === 0)) return [];

      let q = supabase
        .from('news')
        .select(NEWS_SELECT)
        .neq('id', newsId)
        .eq('status', 'published')
        .order('publish_date', { ascending: false })
        .limit(limit);

      if (categoryId) {
        q = q.eq('category', categoryId);
      } else {
        const tagIds = (current.tags ?? []).map((t: any) => t.id);
        const { data: tagRows } = await supabase
          .from('news_news_tags')
          .select('news_id')
          .in('news_tags_id', tagIds);
        const ids = [...new Set((tagRows ?? []).map((r: any) => r.news_id))].filter((x) => x !== newsId);
        if (ids.length === 0) return [];
        q = q.in('id', ids);
      }

      const { data, error } = await q;
      if (error) return [];
      return (data ?? []).map(mapNews);
    } catch (error) {
      console.error('Error fetching related news:', error);
      return [];
    }
  }
}

export const newsService = new NewsService();
