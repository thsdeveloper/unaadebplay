import { api } from './apiClient';
import { GlobalQueryParams } from '@/types/GlobalQueryParamsTypes';

// GenericItem now lives in @repo/types (monorepo). Re-exported for existing consumers.
export type { GenericItem } from '@repo/types';

// Data now flows through the Fastify gateway (RLS-scoped user client). The
// Directus-style filter/sort/limit params are forwarded and translated server-side.
function toListQuery(params?: GlobalQueryParams) {
  if (!params) return undefined;
  return {
    filter: params.filter,
    sort: params.sort,
    limit: params.limit,
    offset: params.offset,
    page: params.page,
    search: params.search,
  };
}

export async function getItems<T>(collectionName: string, params?: GlobalQueryParams): Promise<T> {
  const res = await api.resource(collectionName).list(toListQuery(params));
  return res.data as unknown as T;
}

export async function getItem<T>(collectionName: string, id: string | number, _params?: GlobalQueryParams): Promise<T> {
  return (await api.resource(collectionName).get(String(id))) as unknown as T;
}

export async function getItemSingleton<T>(collectionName: string, _params?: GlobalQueryParams): Promise<T> {
  const res = await api.resource(collectionName).list({ limit: 1 });
  return res.data[0] as unknown as T;
}

export async function setCreateItem<T>(collectionName: string, item: any): Promise<T> {
  return (await api.resource(collectionName).create(item)) as unknown as T;
}

export async function setUpdateItem<T>(collectionName: string, id: number | string, item: Partial<T>): Promise<T> {
  return (await api.resource(collectionName).update(String(id), item)) as unknown as T;
}

export async function setDeleteItem(collectionName: string, id: number | string): Promise<void> {
  await api.resource(collectionName).remove(String(id));
}
