import type { FastifyInstance } from 'fastify';
import type { ZodTypeProvider } from 'fastify-type-provider-zod';
import { z } from 'zod';

/**
 * News reads with the rich shape the mobile app expects (category + author embeds,
 * m2m tags, and ordered gallery). The generic `/:table` CRUD only does `select('*')`,
 * which would drop these — so news gets a dedicated module. RLS-scoped (req.supabaseUser),
 * mirroring the logic previously living in the mobile `news.ts` service verbatim.
 *
 * `news` is registered with `mobileRead: false` in resources.ts so the generic loop does
 * NOT mount `/news` and `/news/:id` (avoids duplicate-route). Admin CRUD stays at
 * `/admin/news`. View increment lives in specialized.ts (`POST /news/:id/views`).
 */

const NEWS_SELECT = `
  id,status,title,slug,excerpt,content,featured_image,publish_date,views_count,reading_time,featured,created_at,updated_at,
  category:news_categories(id,name,slug,description,icon,color,sort),
  author:profiles!news_author_fkey(id,first_name,last_name,avatar),
  news_news_tags(news_tags(id,name,slug)),
  news_news_gallery(file_path,sort)
`;

function mapNews(row: any) {
  const tags = (row?.news_news_tags ?? []).map((t: any) => t.news_tags).filter(Boolean);
  const gallery = (row?.news_news_gallery ?? [])
    .slice()
    .sort((a: any, b: any) => (a.sort ?? 0) - (b.sort ?? 0))
    .map((g: any) => g.file_path);
  return { ...row, tags, gallery };
}

const listQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(10),
  category: z.string().optional(),
  featured: z.coerce.boolean().optional(),
  search: z.string().optional(),
  /** Comma-separated tag ids (m2m filter). */
  tags: z.string().optional(),
});

export default async function newsRoutes(app: FastifyInstance) {
  const t = app.withTypeProvider<ZodTypeProvider>();

  // ---------- List (published, RLS) ----------
  t.get(
    '/news',
    { preValidation: app.requireAuth, schema: { tags: ['news'], summary: 'List published news', querystring: listQuerySchema } },
    async (req) => {
      const { page, limit, category, featured, search, tags } = req.query as z.infer<typeof listQuerySchema>;
      const sb = req.supabaseUser;

      // Filtro por tags (m2m): pré-consulta os news_id que possuem as tags selecionadas.
      let tagNewsIds: string[] | null = null;
      const tagList = tags ? tags.split(',').map((s) => s.trim()).filter(Boolean) : [];
      if (tagList.length) {
        const { data: tagRows, error: tagErr } = await sb.from('news_news_tags').select('news_id').in('news_tags_id', tagList);
        if (tagErr) throw tagErr;
        tagNewsIds = [...new Set((tagRows ?? []).map((r: any) => r.news_id))];
        if (tagNewsIds.length === 0) return { data: [], meta: { total: 0 } };
      }

      let q = sb
        .from('news')
        .select(NEWS_SELECT, { count: 'exact' })
        .eq('status', 'published')
        .lte('publish_date', new Date().toISOString());

      if (category) q = q.eq('category', category);
      if (featured !== undefined) q = q.eq('featured', featured);
      if (search) q = q.or(`title.ilike.%${search}%,excerpt.ilike.%${search}%,content.ilike.%${search}%`);
      if (tagNewsIds) q = q.in('id', tagNewsIds);

      q = q.order('publish_date', { ascending: false }).range((page - 1) * limit, page * limit - 1);

      const { data, error, count } = await q;
      if (error) throw error;
      return { data: (data ?? []).map(mapNews), meta: { total: count ?? 0 } };
    },
  );

  // ---------- By slug (published) ----------
  t.get(
    '/news/slug/:slug',
    { preValidation: app.requireAuth, schema: { tags: ['news'], summary: 'Get news by slug', params: z.object({ slug: z.string() }) } },
    async (req) => {
      const { slug } = req.params as { slug: string };
      const { data, error } = await req.supabaseUser
        .from('news')
        .select(NEWS_SELECT)
        .eq('slug', slug)
        .eq('status', 'published')
        .limit(1)
        .maybeSingle();
      if (error) throw error;
      if (!data) throw app.httpErrors.notFound('news not found');
      return mapNews(data);
    },
  );

  // ---------- Related (by category, else by shared tags) ----------
  t.get(
    '/news/:id/related',
    {
      preValidation: app.requireAuth,
      schema: {
        tags: ['news'],
        summary: 'Related news',
        params: z.object({ id: z.string() }),
        querystring: z.object({ limit: z.coerce.number().int().min(1).max(20).default(3) }),
      },
    },
    async (req) => {
      const { id } = req.params as { id: string };
      const { limit } = req.query as { limit: number };
      const sb = req.supabaseUser;

      const { data: current } = await sb.from('news').select('id,category,news_news_tags(news_tags_id)').eq('id', id).maybeSingle();
      if (!current) return { data: [] };

      const categoryId = (current as any).category as string | null;
      let q = sb
        .from('news')
        .select(NEWS_SELECT)
        .neq('id', id)
        .eq('status', 'published')
        .order('publish_date', { ascending: false })
        .limit(limit);

      if (categoryId) {
        q = q.eq('category', categoryId);
      } else {
        const tagIds = ((current as any).news_news_tags ?? []).map((r: any) => r.news_tags_id).filter(Boolean);
        if (!tagIds.length) return { data: [] };
        const { data: tagRows } = await sb.from('news_news_tags').select('news_id').in('news_tags_id', tagIds);
        const ids = [...new Set((tagRows ?? []).map((r: any) => r.news_id))].filter((x) => x !== id);
        if (!ids.length) return { data: [] };
        q = q.in('id', ids);
      }

      const { data, error } = await q;
      if (error) return { data: [] };
      return { data: (data ?? []).map(mapNews) };
    },
  );

  // ---------- By id ----------
  t.get(
    '/news/:id',
    { preValidation: app.requireAuth, schema: { tags: ['news'], summary: 'Get news by id', params: z.object({ id: z.string() }) } },
    async (req) => {
      const { id } = req.params as { id: string };
      const { data, error } = await req.supabaseUser.from('news').select(NEWS_SELECT).eq('id', id).maybeSingle();
      if (error) throw error;
      if (!data) throw app.httpErrors.notFound('news not found');
      return mapNews(data);
    },
  );
}
