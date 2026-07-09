/**
 * Typed fetch SDK for the UNAADEB Play Fastify gateway.
 * Zero runtime dependencies — the caller injects `getToken` so it stays
 * platform-agnostic (mobile reads the Supabase session; admin reads the SSR cookie).
 */

export interface ApiClientOptions {
  baseUrl: string;
  getToken: () => string | null | undefined | Promise<string | null | undefined>;
  onUnauthorized?: () => void;
}

export interface ListQuery {
  limit?: number;
  offset?: number;
  page?: number;
  sort?: string | string[];
  search?: string;
  /** Directus-style filter object, e.g. `{ status: { _eq: 'active' } }`. */
  filter?: Record<string, unknown>;
}

export interface ListResult<T> {
  data: T[];
  meta: { total: number };
}

export class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
    public body?: unknown,
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

function buildQuery(q?: ListQuery): string {
  if (!q) return '';
  const p = new URLSearchParams();
  if (q.limit != null) p.set('limit', String(q.limit));
  if (q.offset != null) p.set('offset', String(q.offset));
  if (q.page != null) p.set('page', String(q.page));
  if (q.search) p.set('search', q.search);
  if (q.sort) (Array.isArray(q.sort) ? q.sort : [q.sort]).forEach((s) => p.append('sort', s));
  if (q.filter && Object.keys(q.filter).length) p.set('filter', JSON.stringify(q.filter));
  const s = p.toString();
  return s ? `?${s}` : '';
}

export function createApiClient(opts: ApiClientOptions) {
  const base = opts.baseUrl.replace(/\/$/, '');

  async function request<T>(path: string, init?: RequestInit): Promise<T> {
    const token = await opts.getToken();
    // Só declarar JSON quando REALMENTE há corpo. Um POST/DELETE sem body com
    // `content-type: application/json` faz o Fastify estourar FST_ERR_CTP_EMPTY_JSON_BODY
    // ("Body cannot be empty…") — ex.: POST /news/:id/views, DELETE /me, remove().
    const hasBody = init?.body != null;
    const res = await fetch(base + path, {
      ...init,
      headers: {
        ...(hasBody ? { 'content-type': 'application/json' } : {}),
        ...(token ? { authorization: `Bearer ${token}` } : {}),
        ...(init?.headers ?? {}),
      },
    });
    if (res.status === 401) opts.onUnauthorized?.();
    if (res.status === 204) return undefined as T;
    const text = await res.text();
    const body = text ? safeJson(text) : undefined;
    if (!res.ok) {
      let message = res.statusText || `Request failed (${res.status})`;
      if (body && typeof body === 'object' && 'message' in body) {
        message = String((body as { message: unknown }).message);
      }
      throw new ApiError(res.status, message, body);
    }
    return body as T;
  }

  /** RLS-scoped reads + owner-scoped writes at `/<table>` (mobile app). */
  function resource<Row = unknown, Create = Partial<Row>, Update = Partial<Create>>(table: string) {
    return {
      list: (q?: ListQuery) => request<ListResult<Row>>(`/${table}${buildQuery(q)}`),
      get: (id: string) => request<Row>(`/${table}/${id}`),
      create: (body: Create) => request<Row>(`/${table}`, { method: 'POST', body: JSON.stringify(body) }),
      update: (id: string, body: Update) =>
        request<Row>(`/${table}/${id}`, { method: 'PATCH', body: JSON.stringify(body) }),
      remove: (id: string) => request<void>(`/${table}/${id}`, { method: 'DELETE' }),
    };
  }

  /** Full CRUD at `/admin/<table>` (service-role, requires admin). */
  function adminResource<Row = unknown, Create = Partial<Row>, Update = Partial<Create>>(table: string) {
    return {
      list: (q?: ListQuery) => request<ListResult<Row>>(`/admin/${table}${buildQuery(q)}`),
      get: (id: string) => request<Row>(`/admin/${table}/${id}`),
      create: (body: Create) => request<Row>(`/admin/${table}`, { method: 'POST', body: JSON.stringify(body) }),
      update: (id: string, body: Update) =>
        request<Row>(`/admin/${table}/${id}`, { method: 'PATCH', body: JSON.stringify(body) }),
      remove: (id: string) => request<void>(`/admin/${table}/${id}`, { method: 'DELETE' }),
    };
  }

  const users = {
    /** Non-PII member directory. */
    directory: (params?: Record<string, string | number | undefined>) => {
      const p = new URLSearchParams();
      if (params) for (const [k, val] of Object.entries(params)) if (val != null && val !== '') p.set(k, String(val));
      const qsStr = p.toString();
      return request<{ data: unknown[] }>(`/users${qsStr ? `?${qsStr}` : ''}`);
    },
    /** Diverse leadership preview for the home screen (members with a distinct title). */
    leadership: (limit = 12) => request<{ data: unknown[] }>(`/users/leadership?limit=${limit}`),
    get: <T = unknown>(id: string) => request<T>(`/users/${id}`),
    /** Seguir o usuário `id` (idempotente). */
    follow: (id: string) => request<{ following: boolean }>(`/users/${id}/follow`, { method: 'POST' }),
    /** Deixar de seguir o usuário `id`. */
    unfollow: (id: string) => request<{ following: boolean }>(`/users/${id}/follow`, { method: 'DELETE' }),
    /** Perfis que seguem `id`. */
    followers: (id: string, params?: { limit?: number; offset?: number }) => {
      const p = new URLSearchParams();
      if (params?.limit != null) p.set('limit', String(params.limit));
      if (params?.offset != null) p.set('offset', String(params.offset));
      const qs = p.toString();
      return request<{ data: unknown[] }>(`/users/${id}/followers${qs ? `?${qs}` : ''}`);
    },
    /** Perfis que `id` segue. */
    following: (id: string, params?: { limit?: number; offset?: number }) => {
      const p = new URLSearchParams();
      if (params?.limit != null) p.set('limit', String(params.limit));
      if (params?.offset != null) p.set('offset', String(params.offset));
      const qs = p.toString();
      return request<{ data: unknown[] }>(`/users/${id}/following${qs ? `?${qs}` : ''}`);
    },
  };

  const me = {
    get: <T = unknown>() => request<T>('/me'),
    update: <T = unknown>(body: Record<string, unknown>) =>
      request<T>('/me', { method: 'PATCH', body: JSON.stringify(body) }),
    deactivate: () => request<void>('/me', { method: 'DELETE' }),
    /** Upload own media (base64) proxied through the API into the caller's own prefix. */
    upload: (body: { bucket?: 'images' | 'avatars' | 'audio'; filename: string; contentType: string; contentBase64: string }) =>
      request<{ bucket: string; path: string; publicUrl: string }>('/me/uploads', { method: 'POST', body: JSON.stringify(body) }),
    /** Delete an own-uploaded object (path must be under the user's prefix). */
    deleteUpload: (params: { bucket?: 'images' | 'avatars' | 'audio'; path: string }) => {
      const p = new URLSearchParams();
      if (params.bucket) p.set('bucket', params.bucket);
      p.set('path', params.path);
      return request<{ ok: boolean }>(`/me/uploads?${p.toString()}`, { method: 'DELETE' });
    },
  };

  const news = {
    /** List published news (rich shape: category/author embeds, tags, gallery). */
    list: <Row = unknown>(params?: {
      page?: number;
      limit?: number;
      category?: string;
      featured?: boolean;
      search?: string;
      tags?: string[];
    }) => {
      const p = new URLSearchParams();
      if (params?.page != null) p.set('page', String(params.page));
      if (params?.limit != null) p.set('limit', String(params.limit));
      if (params?.category) p.set('category', params.category);
      if (params?.featured != null) p.set('featured', String(params.featured));
      if (params?.search) p.set('search', params.search);
      if (params?.tags?.length) p.set('tags', params.tags.join(','));
      const qs = p.toString();
      return request<ListResult<Row>>(`/news${qs ? `?${qs}` : ''}`);
    },
    get: <Row = unknown>(id: string) => request<Row>(`/news/${id}`),
    getBySlug: <Row = unknown>(slug: string) => request<Row>(`/news/slug/${encodeURIComponent(slug)}`),
    related: <Row = unknown>(id: string, limit = 3) =>
      request<{ data: Row[] }>(`/news/${id}/related?limit=${limit}`),
    incrementViews: (id: string) => request<{ ok: boolean }>(`/news/${id}/views`, { method: 'POST' }),
  };

  const storage = {
    /** Get a signed upload URL for a media file (admin). */
    signedUpload: (body: { bucket?: 'images' | 'avatars' | 'audio'; filename: string }) =>
      request<{ bucket: string; path: string; token: string; signedUrl: string; publicUrl: string }>(
        '/storage/signed-upload',
        { method: 'POST', body: JSON.stringify(body) },
      ),
  };

  /** Presença de confirmação (`{ confirmed, total }`). */
  type Presenca = { confirmed: boolean; total: number };
  /** Item da programação (linha da tabela congresso_programacao). */
  type ProgramacaoRow = {
    id: string;
    congresso_id: string;
    status: string;
    day: string;
    start_time: string | null;
    end_time: string | null;
    title: string;
    description: string | null;
    location: string | null;
    speaker: string | null;
    type: string | null;
    sort: number | null;
    created_at: string;
    updated_at: string | null;
  };
  const congressos = {
    presenca: {
      /** Status do usuário atual + total de confirmados. */
      get: (id: string) => request<Presenca>(`/congressos/${id}/presenca`),
      /** Confirmar presença (idempotente). */
      confirm: (id: string) => request<Presenca>(`/congressos/${id}/presenca`, { method: 'POST' }),
      /** Cancelar presença. */
      cancel: (id: string) => request<Presenca>(`/congressos/${id}/presenca`, { method: 'DELETE' }),
    },
    /** Programação (agenda) do congresso — itens publicados, ordenados por dia/hora. */
    programacao: <Row = unknown>(id: string) => request<{ data: Row[] }>(`/congressos/${id}/programacao`),
    /** CRUD admin da programação (requer admin): /admin/congresso_programacao. */
    programacaoAdmin: adminResource<ProgramacaoRow>('congresso_programacao'),
  };

  const notifications = {
    /** Cria a notificação (lista in-app) e dispara push remoto (admin). target 'all' ou 'users' (+ user_ids). */
    send: (body: {
      title: string;
      body: string;
      data?: Record<string, unknown>;
      type?: string;
      target?: 'all' | 'users';
      user_ids?: string[];
    }) =>
      request<{
        created: number;
        push: { recipients: number; valid: number; sent: number; errors: number; deactivated: number };
      }>('/admin/notifications/send', { method: 'POST', body: JSON.stringify(body) }),
  };

  return { request, resource, adminResource, buildQuery, users, me, news, storage, congressos, notifications };
}

export type ApiClient = ReturnType<typeof createApiClient>;

function safeJson(text: string): unknown {
  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
}
