import { directusClient } from '@/services/api';
import { 
  NewsTypes, 
  NewsCategory, 
  NewsTag, 
  NewsPaginationParams, 
  NewsResponse 
} from '@/types/NewsTypes';
import { readItems, readItem, createItem, updateItem, deleteItem } from '@directus/sdk';

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

class NewsService implements INewsService {
  private readonly DEFAULT_LIMIT = 10;
  private readonly DEFAULT_FIELDS = [
    'id',
    'status',
    'title',
    'slug',
    'excerpt',
    'content',
    'featured_image',
    'gallery',
    'category.*',
    'tags.news_tags_id.*',
    'author.id',
    'author.first_name',
    'author.last_name',
    'author.avatar',
    'publish_date',
    'views_count',
    'reading_time',
    'featured',
    'date_created',
    'date_updated'
  ];

  async getNews(params?: NewsPaginationParams): Promise<NewsResponse> {
    try {
      const { 
        page = 1, 
        limit = this.DEFAULT_LIMIT, 
        sort = ['-publish_date'], 
        filter = {} 
      } = params || {};

      const queryFilter: any = {
        status: { _eq: 'published' },
        publish_date: { _lte: '$NOW' }
      };

      if (filter.category) {
        queryFilter.category = { _eq: filter.category };
      }

      if (filter.tags && filter.tags.length > 0) {
        queryFilter.tags = { _in: filter.tags };
      }

      if (filter.search) {
        queryFilter._or = [
          { title: { _contains: filter.search } },
          { excerpt: { _contains: filter.search } },
          { content: { _contains: filter.search } }
        ];
      }

      if (filter.featured !== undefined) {
        queryFilter.featured = { _eq: filter.featured };
      }

      const response = await directusClient.request(
        readItems('news', {
          fields: this.DEFAULT_FIELDS,
          filter: queryFilter,
          sort,
          limit,
          offset: (page - 1) * limit
        })
      );

      // O Directus SDK retorna os dados diretamente, não em um objeto com data/meta
      // Por ora, vamos retornar um count estimado baseado no array retornado
      const data = response as NewsTypes[];
      
      // Processar tags da relação many-to-many
      const newsWithTags = data.map(item => {
        console.log(`[NewsService.getNews] Processing item ${item.id}:`, {
          featured_image: item.featured_image,
          title: item.title
        });
        
        const processedTags = item.tags?.map((t: any) => {
          if (t.news_tags_id) {
            return {
              id: t.news_tags_id.id,
              name: t.news_tags_id.name,
              slug: t.news_tags_id.slug
            };
          }
          return t;
        }) || [];
        
        const processedItem = {
          ...item,
          tags: processedTags
        };
        
        console.log(`[NewsService.getNews] Processed item ${item.id}:`, {
          featured_image: processedItem.featured_image,
          has_featured_image: !!processedItem.featured_image
        });
        
        return processedItem;
      });
      
      const result = {
        data: newsWithTags,
        meta: {
          total_count: newsWithTags.length,
          filter_count: newsWithTags.length
        }
      };
      
      console.log('[NewsService.getNews] Final result:', {
        total_items: result.data.length,
        items_with_images: result.data.filter(item => !!item.featured_image).length,
        first_item_image: result.data[0]?.featured_image
      });
      
      return result;
    } catch (error) {
      console.error('Error fetching news:', error);
      throw new Error('Failed to fetch news');
    }
  }

  async getNewsById(id: string): Promise<NewsTypes> {
    try {
      const response = await directusClient.request(
        readItem('news', id, {
          fields: this.DEFAULT_FIELDS
        })
      );
      
      const newsItem = response as any;
      const processedTags = newsItem.tags?.map((t: any) => {
        if (t.news_tags_id) {
          return {
            id: t.news_tags_id.id,
            name: t.news_tags_id.name,
            slug: t.news_tags_id.slug
          };
        }
        return t;
      }) || [];
      
      return {
        ...newsItem,
        tags: processedTags
      } as NewsTypes;
    } catch (error) {
      console.error('Error fetching news by id:', error);
      throw new Error('Failed to fetch news item');
    }
  }

  async getNewsBySlug(slug: string): Promise<NewsTypes> {
    try {
      const response = await directusClient.request(
        readItems('news', {
          fields: this.DEFAULT_FIELDS,
          filter: {
            slug: { _eq: slug },
            status: { _eq: 'published' }
          },
          limit: 1
        })
      );
      
      const items = response as any[];
      if (!items || items.length === 0) {
        throw new Error('News not found');
      }
      
      const newsItem = items[0];
      const processedTags = newsItem.tags?.map((t: any) => {
        if (t.news_tags_id) {
          return {
            id: t.news_tags_id.id,
            name: t.news_tags_id.name,
            slug: t.news_tags_id.slug
          };
        }
        return t;
      }) || [];
      
      return {
        ...newsItem,
        tags: processedTags
      } as NewsTypes;
    } catch (error) {
      console.error('Error fetching news by slug:', error);
      throw new Error('Failed to fetch news item');
    }
  }

  async getCategories(): Promise<NewsCategory[]> {
    try {
      const response = await directusClient.request(
        readItems('news_categories', {
          fields: ['*'],
          sort: ['sort', 'name']
        })
      );
      
      return response as NewsCategory[];
    } catch (error) {
      console.error('Error fetching categories:', error);
      throw new Error('Failed to fetch categories');
    }
  }

  async getTags(): Promise<NewsTag[]> {
    try {
      const response = await directusClient.request(
        readItems('news_tags', {
          fields: ['*'],
          sort: ['name']
        })
      );
      
      return response as NewsTag[];
    } catch (error) {
      console.error('Error fetching tags:', error);
      throw new Error('Failed to fetch tags');
    }
  }

  async incrementViewCount(id: string): Promise<void> {
    try {
      const news = await this.getNewsById(id);
      const currentViews = news.views_count || 0;
      
      await directusClient.request(
        updateItem('news', id, {
          views_count: currentViews + 1
        })
      );
    } catch (error) {
      console.error('Error incrementing view count:', error);
    }
  }

  async getFeaturedNews(): Promise<NewsTypes[]> {
    try {
      const response = await this.getNews({
        page: 1,
        limit: 5,
        filter: { featured: true }
      });
      
      return response.data;
    } catch (error) {
      console.error('Error fetching featured news:', error);
      throw new Error('Failed to fetch featured news');
    }
  }

  async getRelatedNews(newsId: string, limit: number = 3): Promise<NewsTypes[]> {
    try {
      const currentNews = await this.getNewsById(newsId);
      
      if (!currentNews.category && (!currentNews.tags || currentNews.tags.length === 0)) {
        return [];
      }

      const filter: any = {
        id: { _neq: newsId },
        status: { _eq: 'published' }
      };

      if (currentNews.category) {
        filter.category = { _eq: currentNews.category.id };
      } else if (currentNews.tags && currentNews.tags.length > 0) {
        filter.tags = { _in: currentNews.tags.map(tag => tag.id) };
      }

      const response = await directusClient.request(
        readItems('news', {
          fields: this.DEFAULT_FIELDS,
          filter,
          sort: ['-publish_date'],
          limit
        })
      );

      const items = response as any[];
      return items.map(item => {
        const processedTags = item.tags?.map((t: any) => {
          if (t.news_tags_id) {
            return {
              id: t.news_tags_id.id,
              name: t.news_tags_id.name,
              slug: t.news_tags_id.slug
            };
          }
          return t;
        }) || [];
        
        return {
          ...item,
          tags: processedTags
        };
      }) as NewsTypes[];
    } catch (error) {
      console.error('Error fetching related news:', error);
      return [];
    }
  }
}

export const newsService = new NewsService();