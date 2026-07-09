import { supabase } from './supabase';

export type StorageBucket = 'images' | 'avatars' | 'audio';

/**
 * Resolve um valor de coluna de imagem/arquivo para uma URL pública utilizável.
 *
 * Aceita:
 *  - URL http(s) completa (ex.: seed/demo ou link externo) → retorna como está (passthrough)
 *  - caminho/chave de objeto no Supabase Storage (ex.: "events/cover.jpg") → monta a URL pública
 *
 * Substitui o antigo builder do Directus (`${API_URL}/assets/${id}`), que apontava para o
 * backend morto no Railway.
 */
export function getStorageUrl(
    pathOrUrl: string | null | undefined,
    bucket: StorageBucket = 'images',
): string | null {
    if (!pathOrUrl) return null;

    // Passthrough para URLs absolutas (http/https) — útil para dados demo e links externos.
    if (/^https?:\/\//i.test(pathOrUrl)) return pathOrUrl;

    return supabase.storage.from(bucket).getPublicUrl(pathOrUrl).data.publicUrl;
}
