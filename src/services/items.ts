import { supabase } from "./supabase";
import { GlobalQueryParams } from "@/types/GlobalQueryParamsTypes";

export interface GenericItem {
    id: string;
}

// Traduz um filtro estilo Directus ({ campo: { _eq|_in|_icontains|...: valor } })
// para o query-builder do Supabase. Operadores desconhecidos são ignorados.
function applyFilter(query: any, filter?: Record<string, any>) {
    if (!filter) return query;
    for (const [field, cond] of Object.entries(filter)) {
        if (field.startsWith('_')) continue; // _or/_and não suportados aqui
        if (!cond || typeof cond !== 'object') continue;
        for (const [op, val] of Object.entries(cond as Record<string, any>)) {
            switch (op) {
                case '_eq': query = query.eq(field, val); break;
                case '_neq': query = query.neq(field, val); break;
                case '_in': query = query.in(field, val as any[]); break;
                case '_gt': query = query.gt(field, val); break;
                case '_gte': query = query.gte(field, val); break;
                case '_lt': query = query.lt(field, val); break;
                case '_lte': query = query.lte(field, val); break;
                case '_contains':
                case '_icontains': query = query.ilike(field, `%${val}%`); break;
                default: break; // ignora operadores não mapeados
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

export async function getItems<T>(collectionName: string, params?: GlobalQueryParams): Promise<T> {
    let query: any = supabase.from(collectionName as any).select('*');
    query = applyFilter(query, params?.filter as any);
    query = applySort(query, params?.sort as any);
    if (params?.limit != null) query = query.limit(params.limit);
    if (params?.offset != null) {
        query = query.range(params.offset, params.offset + ((params.limit as number) ?? 50) - 1);
    }
    const { data, error } = await query;
    if (error) throw error;
    return (data ?? []) as T;
}

export async function getItem<T>(collectionName: string, id: string | number, _params?: GlobalQueryParams): Promise<T> {
    const { data, error } = await supabase.from(collectionName as any).select('*').eq('id', id).single();
    if (error) throw error;
    return data as T;
}

export async function getItemSingleton<T>(collectionName: string, _params?: GlobalQueryParams): Promise<T> {
    const { data, error } = await supabase.from(collectionName as any).select('*').limit(1).maybeSingle();
    if (error) throw error;
    return data as T;
}

export async function setCreateItem<T>(collectionName: string, item: any): Promise<T> {
    const { data, error } = await supabase.from(collectionName as any).insert(item).select().single();
    if (error) throw error;
    return data as T;
}

export async function setUpdateItem<T>(collectionName: string, id: number | string, item: Partial<T>): Promise<T> {
    const { data, error } = await supabase.from(collectionName as any).update(item as any).eq('id', id).select().single();
    if (error) throw error;
    return data as T;
}

export async function setDeleteItem(collectionName: string, id: number | string): Promise<void> {
    const { error } = await supabase.from(collectionName as any).delete().eq('id', id);
    if (error) throw error;
}
