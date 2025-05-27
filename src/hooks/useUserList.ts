import { useState, useCallback, useEffect, useRef } from 'react';
import { getUsers } from '@/services/user';
import type { User } from '@/types/UserTypes';

interface UseUserListParams {
  pageSize?: number;
}

interface UseUserListReturn {
  users: User[];
  isLoading: boolean;
  isRefreshing: boolean;
  isLoadingMore: boolean;
  error: string | null;
  hasMore: boolean;
  searchQuery: string;
  filters: UserFilters;
  loadUsers: () => Promise<void>;
  loadMore: () => Promise<void>;
  refresh: () => Promise<void>;
  search: (query: string) => void;
  updateFilters: (filters: UserFilters) => void;
  clearFilters: () => void;
  activeFiltersCount: number;
}

export interface UserFilters {
  sector?: string | null;
  role?: string | null;
  isActive?: boolean | null;
  sortBy?: 'name' | 'createdAt' | 'updatedAt';
  sortOrder?: 'asc' | 'desc';
}

const DEFAULT_PAGE_SIZE = 20;
const SEARCH_DEBOUNCE_MS = 500;

export function useUserList({ 
  pageSize = DEFAULT_PAGE_SIZE 
}: UseUserListParams = {}): UseUserListReturn {
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState<UserFilters>({
    sortBy: 'name',
    sortOrder: 'asc'
  });

  const pageRef = useRef(1);
  const searchTimeoutRef = useRef<NodeJS.Timeout>();

  const activeFiltersCount = Object.values(filters).filter(
    value => value !== null && value !== undefined && value !== 'name' && value !== 'asc'
  ).length;

  const buildQueryParams = useCallback(() => {
    const params: any = {
      limit: pageSize,
      offset: (pageRef.current - 1) * pageSize,
      fields: '*,avatar.*',
      sort: filters.sortOrder === 'asc' ? filters.sortBy : `-${filters.sortBy}`,
      filter: {}
    };

    // Add search filter
    if (searchQuery.trim().length >= 3) {
      params.filter.name = { _icontains: searchQuery.trim() };
    }

    // Add sector filter
    if (filters.sector) {
      params.filter.sector = { _eq: filters.sector };
    }

    // Add role filter
    if (filters.role) {
      params.filter.role = { _eq: filters.role };
    }

    // Add active filter
    if (filters.isActive !== null && filters.isActive !== undefined) {
      params.filter.status = { _eq: filters.isActive ? 'active' : 'inactive' };
    }

    return params;
  }, [pageSize, searchQuery, filters]);

  const loadUsers = useCallback(async (reset = false) => {
    try {
      if (reset) {
        pageRef.current = 1;
        setHasMore(true);
      }

      const params = buildQueryParams();
      const response = await getUsers(params);

      if (response?.data) {
        const newUsers = response.data;
        
        if (reset) {
          setUsers(newUsers);
        } else {
          setUsers(prev => [...prev, ...newUsers]);
        }

        setHasMore(newUsers.length === pageSize);
        setError(null);
      }
    } catch (err) {
      setError('Erro ao carregar usuários');
      console.error('Error loading users:', err);
    }
  }, [buildQueryParams, pageSize]);

  const loadMore = useCallback(async () => {
    if (isLoadingMore || !hasMore) return;

    setIsLoadingMore(true);
    pageRef.current += 1;
    
    try {
      await loadUsers(false);
    } finally {
      setIsLoadingMore(false);
    }
  }, [isLoadingMore, hasMore, loadUsers]);

  const refresh = useCallback(async () => {
    setIsRefreshing(true);
    try {
      await loadUsers(true);
    } finally {
      setIsRefreshing(false);
    }
  }, [loadUsers]);

  const search = useCallback((query: string) => {
    setSearchQuery(query);
    
    // Clear existing timeout
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    // Set new timeout for debounced search
    searchTimeoutRef.current = setTimeout(() => {
      if (query.trim().length === 0 || query.trim().length >= 3) {
        loadUsers(true);
      }
    }, SEARCH_DEBOUNCE_MS);
  }, [loadUsers]);

  const updateFilters = useCallback((newFilters: UserFilters) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
  }, []);

  const clearFilters = useCallback(() => {
    setFilters({
      sortBy: 'name',
      sortOrder: 'asc'
    });
  }, []);

  // Initial load
  useEffect(() => {
    setIsLoading(true);
    loadUsers(true).finally(() => setIsLoading(false));
  }, [filters]); // Re-fetch when filters change

  // Cleanup
  useEffect(() => {
    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, []);

  return {
    users,
    isLoading,
    isRefreshing,
    isLoadingMore,
    error,
    hasMore,
    searchQuery,
    filters,
    loadUsers,
    loadMore,
    refresh,
    search,
    updateFilters,
    clearFilters,
    activeFiltersCount
  };
}