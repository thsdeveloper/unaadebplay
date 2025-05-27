// Service temporário para testar a interface enquanto as collections não estão criadas
import { 
  NewsTypes, 
  NewsCategory, 
  NewsTag, 
  NewsPaginationParams, 
  NewsResponse 
} from '@/types/NewsTypes';
import { INewsService } from './news';

class MockNewsService implements INewsService {
  private mockCategories: NewsCategory[] = [
    { id: '1', name: 'Tecnologia', slug: 'tecnologia', color: '#3B82F6', icon: 'rocket-outline' },
    { id: '2', name: 'Eventos', slug: 'eventos', color: '#10B981', icon: 'calendar-outline' },
    { id: '3', name: 'Avisos', slug: 'avisos', color: '#F59E0B', icon: 'megaphone-outline' },
    { id: '4', name: 'Esportes', slug: 'esportes', color: '#EF4444', icon: 'football-outline' },
  ];

  private mockTags: NewsTag[] = [
    { id: '1', name: 'urgente', slug: 'urgente' },
    { id: '2', name: 'destaque', slug: 'destaque' },
    { id: '3', name: 'novidade', slug: 'novidade' },
  ];

  private mockNews: NewsTypes[] = [
    {
      id: '1',
      status: 'published',
      title: 'Nova funcionalidade de notícias lançada no app',
      slug: 'nova-funcionalidade-noticias',
      excerpt: 'Agora você pode acompanhar todas as novidades da UNAADEB diretamente pelo aplicativo com nossa nova seção de notícias.',
      content: '<p>Estamos muito felizes em anunciar o lançamento da nova funcionalidade de notícias em nosso aplicativo!</p><p>Com esta atualização, você poderá:</p><ul><li>Acompanhar as últimas notícias da igreja</li><li>Filtrar por categorias de seu interesse</li><li>Compartilhar notícias com amigos</li><li>Salvar suas notícias favoritas</li></ul>',
      featured_image: '550e8400-e29b-41d4-a716-446655440000',
      category: this.mockCategories[0],
      tags: [this.mockTags[1], this.mockTags[2]],
      publish_date: new Date('2024-01-15'),
      views_count: 150,
      reading_time: 3,
      featured: true,
      date_created: new Date('2024-01-15'),
      date_updated: new Date('2024-01-15'),
      user_created: 'user-1',
      user_updated: 'user-1'
    },
    {
      id: '2',
      status: 'published',
      title: 'Congresso Nacional 2024 - Inscrições Abertas',
      slug: 'congresso-nacional-2024',
      excerpt: 'As inscrições para o Congresso Nacional 2024 já estão abertas. Garanta sua vaga!',
      content: '<p>O Congresso Nacional 2024 está chegando e as inscrições já estão abertas!</p>',
      featured_image: '550e8400-e29b-41d4-a716-446655440001',
      category: this.mockCategories[1],
      tags: [this.mockTags[0]],
      publish_date: new Date('2024-01-10'),
      views_count: 300,
      reading_time: 5,
      featured: true,
      date_created: new Date('2024-01-10'),
      date_updated: new Date('2024-01-10'),
      user_created: 'user-1',
      user_updated: 'user-1'
    },
    {
      id: '3',
      status: 'published',
      title: 'Novo calendário de atividades disponível',
      slug: 'novo-calendario-atividades',
      excerpt: 'Confira o calendário completo de atividades para 2024.',
      content: '<p>O novo calendário está disponível com todas as atividades programadas.</p>',
      featured_image: '550e8400-e29b-41d4-a716-446655440002',
      category: this.mockCategories[2],
      tags: [this.mockTags[2]],
      publish_date: new Date('2024-01-05'),
      views_count: 120,
      reading_time: 2,
      featured: false,
      date_created: new Date('2024-01-05'),
      date_updated: new Date('2024-01-05'),
      user_created: 'user-1',
      user_updated: 'user-1'
    }
  ];

  async getNews(params?: NewsPaginationParams): Promise<NewsResponse> {
    const { 
      page = 1, 
      limit = 10, 
      filter = {} 
    } = params || {};

    let filteredNews = [...this.mockNews];

    // Aplicar filtros
    if (filter.category) {
      filteredNews = filteredNews.filter(n => n.category?.id === filter.category);
    }

    if (filter.featured !== undefined) {
      filteredNews = filteredNews.filter(n => n.featured === filter.featured);
    }

    // Paginação
    const start = (page - 1) * limit;
    const paginatedNews = filteredNews.slice(start, start + limit);

    return {
      data: paginatedNews,
      meta: {
        total_count: filteredNews.length,
        filter_count: filteredNews.length
      }
    };
  }

  async getNewsById(id: string): Promise<NewsTypes> {
    const news = this.mockNews.find(n => n.id === id);
    if (!news) throw new Error('News not found');
    return news;
  }

  async getNewsBySlug(slug: string): Promise<NewsTypes> {
    const news = this.mockNews.find(n => n.slug === slug);
    if (!news) throw new Error('News not found');
    return news;
  }

  async getCategories(): Promise<NewsCategory[]> {
    return this.mockCategories;
  }

  async getTags(): Promise<NewsTag[]> {
    return this.mockTags;
  }

  async incrementViewCount(id: string): Promise<void> {
    const news = this.mockNews.find(n => n.id === id);
    if (news && news.views_count !== undefined) {
      news.views_count++;
    }
  }

  async getFeaturedNews(): Promise<NewsTypes[]> {
    return this.mockNews.filter(n => n.featured);
  }

  async getRelatedNews(newsId: string, limit: number = 3): Promise<NewsTypes[]> {
    const currentNews = this.mockNews.find(n => n.id === newsId);
    if (!currentNews) return [];

    return this.mockNews
      .filter(n => n.id !== newsId && n.category?.id === currentNews.category?.id)
      .slice(0, limit);
  }
}

export const mockNewsService = new MockNewsService();