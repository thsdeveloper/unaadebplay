import { useState, useEffect, useCallback, useRef } from 'react';
import { newsService } from '@/services/news';
import { 
  NewsTypes, 
  NewsCategory, 
  NewsTag, 
  NewsPaginationParams,
  NewsFilters
} from '@/types/NewsTypes';

interface UseNewsReturn {
  news: NewsTypes[];
  categories: NewsCategory[];
  tags: NewsTag[];
  isLoading: boolean;
  isRefreshing: boolean;
  error: string | null;
  hasMore: boolean;
  totalCount: number;
  page: number;
  filters: NewsFilters;
  loadNews: () => Promise<void>;
  loadMore: () => Promise<void>;
  refresh: () => Promise<void>;
  setFilters: (filters: NewsFilters) => void;
  clearFilters: () => void;
}

export const useNews = (initialLimit: number = 10): UseNewsReturn => {
  const [news, setNews] = useState<NewsTypes[]>([]);
  const [categories, setCategories] = useState<NewsCategory[]>([]);
  const [tags, setTags] = useState<NewsTag[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const [totalCount, setTotalCount] = useState(0);
  const [page, setPage] = useState(1);
  const [filters, setFilters] = useState<NewsFilters>({});
  
  const isMountedRef = useRef(true);

  useEffect(() => {
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  const loadMetadata = useCallback(async () => {
    try {
      const [categoriesData, tagsData] = await Promise.all([
        newsService.getCategories(),
        newsService.getTags()
      ]);
      
      if (isMountedRef.current) {
        setCategories(categoriesData);
        setTags(tagsData);
      }
    } catch (err) {
      console.error('Error loading metadata:', err);
    }
  }, []);

  const loadNews = useCallback(async () => {
    if (!isMountedRef.current) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      const params: NewsPaginationParams = {
        page: 1,
        limit: initialLimit,
        filter: filters
      };
      
      const response = await newsService.getNews(params);
      
      console.log('[useNews.loadNews] Response received:', {
        total_items: response.data.length,
        items_with_images: response.data.filter(item => !!item.featured_image).length,
        first_item: response.data[0] ? {
          id: response.data[0].id,
          title: response.data[0].title,
          featured_image: response.data[0].featured_image
        } : null
      });
      
      if (isMountedRef.current) {
        setNews(response.data);
        setTotalCount(response.meta.total_count);
        setHasMore(response.data.length < response.meta.filter_count);
        setPage(1);
      }
    } catch (err) {
      if (isMountedRef.current) {
        setError('Erro ao carregar notícias');
        console.error('Error loading news:', err);
      }
    } finally {
      if (isMountedRef.current) {
        setIsLoading(false);
      }
    }
  }, [filters, initialLimit]);

  const loadMore = useCallback(async () => {
    if (!hasMore || isLoading || isRefreshing || !isMountedRef.current) return;
    
    setIsLoading(true);
    
    try {
      const nextPage = page + 1;
      const params: NewsPaginationParams = {
        page: nextPage,
        limit: initialLimit,
        filter: filters
      };
      
      const response = await newsService.getNews(params);
      
      console.log('[useNews.loadMore] Response received:', {
        page: nextPage,
        new_items: response.data.length,
        new_items_with_images: response.data.filter(item => !!item.featured_image).length
      });
      
      if (isMountedRef.current) {
        setNews(prev => [...prev, ...response.data]);
        setPage(nextPage);
        setHasMore(
          news.length + response.data.length < response.meta.filter_count
        );
      }
    } catch (err) {
      if (isMountedRef.current) {
        setError('Erro ao carregar mais notícias');
        console.error('Error loading more news:', err);
      }
    } finally {
      if (isMountedRef.current) {
        setIsLoading(false);
      }
    }
  }, [hasMore, isLoading, isRefreshing, page, filters, initialLimit, news.length]);

  const refresh = useCallback(async () => {
    if (!isMountedRef.current) return;
    
    setIsRefreshing(true);
    setError(null);
    
    try {
      await Promise.all([loadNews(), loadMetadata()]);
    } finally {
      if (isMountedRef.current) {
        setIsRefreshing(false);
      }
    }
  }, [loadNews, loadMetadata]);

  const clearFilters = useCallback(() => {
    setFilters({});
  }, []);

  useEffect(() => {
    loadNews();
  }, [loadNews]);

  useEffect(() => {
    loadMetadata();
  }, [loadMetadata]);

  return {
    news,
    categories,
    tags,
    isLoading,
    isRefreshing,
    error,
    hasMore,
    totalCount,
    page,
    filters,
    loadNews,
    loadMore,
    refresh,
    setFilters,
    clearFilters
  };
};

interface UseNewsItemReturn {
  news: NewsTypes | null;
  relatedNews: NewsTypes[];
  isLoading: boolean;
  error: string | null;
  incrementViews: () => Promise<void>;
}

export const useNewsItem = (idOrSlug: string, isSlug: boolean = false): UseNewsItemReturn => {
  const [news, setNews] = useState<NewsTypes | null>(null);
  const [relatedNews, setRelatedNews] = useState<NewsTypes[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const isMountedRef = useRef(true);
  const viewIncrementedRef = useRef(false);

  useEffect(() => {
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  const loadNewsItem = useCallback(async () => {
    if (!isMountedRef.current) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      const newsData = isSlug 
        ? await newsService.getNewsBySlug(idOrSlug)
        : await newsService.getNewsById(idOrSlug);
      
      console.log('[useNewsItem.loadNewsItem] News item loaded:', {
        id: newsData.id,
        title: newsData.title,
        featured_image: newsData.featured_image,
        has_featured_image: !!newsData.featured_image
      });
      
      if (isMountedRef.current) {
        setNews(newsData);
        
        const related = await newsService.getRelatedNews(newsData.id);
        setRelatedNews(related);
      }
    } catch (err) {
      if (isMountedRef.current) {
        setError('Erro ao carregar notícia');
        console.error('Error loading news item:', err);
      }
    } finally {
      if (isMountedRef.current) {
        setIsLoading(false);
      }
    }
  }, [idOrSlug, isSlug]);

  const incrementViews = useCallback(async () => {
    if (!news || viewIncrementedRef.current) return;
    
    try {
      await newsService.incrementViewCount(news.id);
      viewIncrementedRef.current = true;
    } catch (err) {
      console.error('Error incrementing views:', err);
    }
  }, [news]);

  useEffect(() => {
    loadNewsItem();
  }, [loadNewsItem]);

  useEffect(() => {
    if (news && !viewIncrementedRef.current) {
      incrementViews();
    }
  }, [news, incrementViews]);

  return {
    news,
    relatedNews,
    isLoading,
    error,
    incrementViews
  };
};