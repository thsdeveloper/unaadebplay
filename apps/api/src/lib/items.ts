import type { DbClient } from '../plugins/supabase';
import type { ListQuery } from '@repo/validation';

/**
 * Directus-style filter → PostgREST (ported verbatim from the mobile services layer,
 * now taking the Supabase client as an argument so it works with either the
 * RLS-scoped user client or the service-role admin client).
 */
function applyFilter(query: any, filter?: Record<string, unknown>) {
  if (!filter) return query;
  for (const [field, cond] of Object.entries(filter)) {
    if (field.startsWith('_')) continue; // _or/_and not supported here
    if (!cond || typeof cond !== 'object') continue;
    for (const [op, val] of Object.entries(cond as Record<string, unknown>)) {
      switch (op) {
        case '_eq': query = query.eq(field, val); break;
        case '_neq': query = query.neq(field, val); break;
        case '_in': query = query.in(field, val as unknown[]); break;
        case '_gt': query = query.gt(field, val); break;
        case '_gte': query = query.gte(field, val); break;
        case '_lt': query = query.lt(field, val); break;
        case '_lte': query = query.lte(field, val); break;
        case '_contains':
        case '_icontains': query = query.ilike(field, `%${val}%`); break;
        default: break; // ignore unmapped operators
      }
    }
  }
  return query;
}

function applySort(query: any, sort?: string | string[]) {
  if (!sort) return query;
  const arr = Array.isArray(sort) ? sort : [sort];
  for (const s of arr) {
    if (typeof s !== 'string') continue;
    const desc = s.startsWith('-');
    query = query.order(desc ? s.slice(1) : s, { ascending: !desc });
  }
  return query;
}

export async function listItems(client: DbClient, table: string, params: ListQuery = {}) {
  let query: any = (client.from as any)(table).select('*', { count: 'exact' });
  query = applyFilter(query, params.filter as Record<string, unknown> | undefined);
  query = applySort(query, params.sort as string | string[] | undefined);
  const limit = params.limit ?? 50;
  const offset = params.offset ?? (params.page ? (params.page - 1) * limit : 0);
  query = query.range(offset, offset + limit - 1);
  const { data, error, count } = await query;
  if (error) throw error;
  return { data: (data ?? []) as unknown[], count: count ?? 0 };
}

export async function getItemById(client: DbClient, table: string, id: string) {
  const { data, error } = await (client.from as any)(table).select('*').eq('id', id).maybeSingle();
  if (error) throw error;
  return data as unknown;
}

export async function createItem(client: DbClient, table: string, item: unknown) {
  const { data, error } = await (client.from as any)(table).insert(item).select().single();
  if (error) throw error;
  return data as unknown;
}

export async function updateItem(client: DbClient, table: string, id: string, item: unknown) {
  const { data, error } = await (client.from as any)(table).update(item).eq('id', id).select().single();
  if (error) throw error;
  return data as unknown;
}

export async function deleteItem(client: DbClient, table: string, id: string) {
  const { error } = await (client.from as any)(table).delete().eq('id', id);
  if (error) throw error;
}
