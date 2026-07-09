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
const SEARCH_DEBOUNCE_MS = 300;
/** Nº mínimo de caracteres p/ disparar a busca (1 = qualquer letra já filtra). */
const SEARCH_MIN_CHARS = 1;

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
  const searchTimeoutRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  // Refs espelham os valores voláteis para que buildQueryParams/loadUsers sejam
  // ESTÁVEIS (sem depender de searchQuery/filters). Isso mata o bug de closure
  // obsoleta: antes o setTimeout capturava um loadUsers com o searchQuery de UM
  // caractere atrás, então a busca sempre saía defasada.
  const searchRef = useRef('');
  const filtersRef = useRef(filters);

  const activeFiltersCount = Object.values(filters).filter(
    value => value !== null && value !== undefined && value !== 'name' && value !== 'asc'
  ).length;

  const buildQueryParams = useCallback(() => {
    const query = searchRef.current.trim();
    const f = filtersRef.current;

    const params: any = {
      limit: pageSize,
      offset: (pageRef.current - 1) * pageSize,
      fields: '*,avatar.*',
      sort: f.sortOrder === 'asc' ? f.sortBy : `-${f.sortBy}`,
      filter: {},
    };

    // Busca por nome (mapeada para o RPC `p_search`, que casa o nome COMPLETO).
    if (query.length >= SEARCH_MIN_CHARS) {
      params.filter.name = { _icontains: query };
    }
    if (f.sector) params.filter.sector = { _eq: f.sector };
    if (f.role) params.filter.role = { _eq: f.role };
    if (f.isActive !== null && f.isActive !== undefined) {
      params.filter.status = { _eq: f.isActive ? 'active' : 'inactive' };
    }

    return params;
  }, [pageSize]);

  const loadUsers = useCallback(async (reset = false) => {
    try {
      if (reset) {
        pageRef.current = 1;
        setHasMore(true);
      }

      const params = buildQueryParams();
      // getUsers agora retorna um array (diretório seguro via RPC), não { data }.
      const newUsers = (await getUsers(params)) ?? [];

      if (reset) {
        setUsers(newUsers);
      } else {
        setUsers(prev => [...prev, ...newUsers]);
      }

      setHasMore(newUsers.length === pageSize);
      setError(null);
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
    setSearchQuery(query);       // valor imediato do input
    searchRef.current = query;   // valor lido pelo fetch (sempre o mais recente)

    if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);
    // Debounce: recarrega do começo. Vazio → volta a listar todos; 1+ char → filtra.
    searchTimeoutRef.current = setTimeout(() => {
      loadUsers(true);
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

  // Carga inicial + recarga quando os filtros mudam. Sincroniza o ref ANTES de buscar.
  useEffect(() => {
    filtersRef.current = filters;
    setIsLoading(true);
    loadUsers(true).finally(() => setIsLoading(false));
  }, [filters]);

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