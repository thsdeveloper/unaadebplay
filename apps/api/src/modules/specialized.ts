import type { FastifyInstance } from 'fastify';
import type { ZodTypeProvider } from 'fastify-type-provider-zod';
import type { Json } from '@repo/db-types';
import { z } from 'zod';
import { sendPushToUsers } from '../lib/push';

// Columns a member may change on their own profile (role/status/is_admin/email excluded;
// also enforced by DB grants + the is_admin trigger).
const PROFILE_UPDATABLE = [
  'first_name', 'last_name', 'phone', 'gender', 'birthdate', 'sector', 'avatar', 'cover_image',
  'responsible_name', 'responsible_phone', 'responsible_email', 'location', 'title',
  'description', 'language', 'theme',
  'instagram', 'linkedin', 'tiktok', 'whatsapp', 'social_visibility',
] as const;

const meUpdateSchema = z.object({
  first_name: z.string().optional(),
  last_name: z.string().optional(),
  phone: z.string().nullish(),
  gender: z.string().nullish(),
  birthdate: z.string().nullish(),
  sector: z.string().nullish(),
  avatar: z.string().nullish(),
  cover_image: z.string().nullish(),
  responsible_name: z.string().nullish(),
  responsible_phone: z.string().nullish(),
  responsible_email: z.string().nullish(),
  location: z.string().nullish(),
  title: z.string().nullish(),
  description: z.string().nullish(),
  language: z.string().nullish(),
  theme: z.string().nullish(),
  instagram: z.string().nullish(),
  linkedin: z.string().nullish(),
  tiktok: z.string().nullish(),
  whatsapp: z.string().nullish(),
  social_visibility: z
    .object({
      instagram: z.boolean(),
      linkedin: z.boolean(),
      tiktok: z.boolean(),
      whatsapp: z.boolean(),
    })
    .partial()
    .nullish(),
});

const directoryQuerySchema = z.object({
  search: z.string().optional(),
  sector: z.string().optional(),
  role: z.string().optional(),
  status: z.string().optional(),
  limit: z.coerce.number().int().min(1).max(200).optional(),
  offset: z.coerce.number().int().min(0).optional(),
});

/** Mobile-specific endpoints backed by RPCs and owner-scoped profile access. */
export default async function specializedRoutes(app: FastifyInstance) {
  const t = app.withTypeProvider<ZodTypeProvider>();

  // Public, non-PII member directory (SECURITY DEFINER RPC).
  t.get(
    '/users',
    { preValidation: app.requireAuth, schema: { tags: ['users'], summary: 'Public member directory', querystring: directoryQuerySchema } },
    async (req) => {
      const { search, sector, role, status, limit, offset } = req.query;
      const { data, error } = await req.supabaseUser.rpc('get_public_profiles', {
        p_search: search ?? null,
        p_sector: sector ?? null,
        p_role: role ?? null,
        p_status: status ?? null,
        p_limit: limit ?? null,
        p_offset: offset ?? null,
      });
      if (error) throw error;
      return { data: data ?? [] };
    },
  );

  // Home leadership preview: members with a distinct title, diverse (pseudo-random) order.
  // Registered before '/users/:id' so the static path wins (find-my-way prioritizes it anyway).
  t.get(
    '/users/leadership',
    { preValidation: app.requireAuth, schema: { tags: ['users'], summary: 'Home leadership preview', querystring: z.object({ limit: z.coerce.number().int().min(1).max(50).optional() }) } },
    async (req) => {
      const { data, error } = await req.supabaseUser.rpc('get_home_leadership', { p_limit: req.query.limit ?? 12 });
      if (error) throw error;
      return { data: data ?? [] };
    },
  );

  // Single public profile by id (non-PII).
  t.get(
    '/users/:id',
    { preValidation: app.requireAuth, schema: { tags: ['users'], summary: 'Public profile by id', params: z.object({ id: z.string() }) } },
    async (req) => {
      const { data, error } = await req.supabaseUser.rpc('get_public_profiles', { p_ids: [req.params.id], p_status: null });
      if (error) throw error;
      const row = (data ?? [])[0];
      if (!row) throw app.httpErrors.notFound('user not found');
      return row;
    },
  );

  // Seguir um usuário (idempotente: ON CONFLICT DO NOTHING via unique). RLS: follower = caller.
  t.post(
    '/users/:id/follow',
    { preValidation: app.requireAuth, schema: { tags: ['users'], summary: 'Follow a user', params: z.object({ id: z.string().uuid() }) } },
    async (req) => {
      if (req.params.id === req.user!.id) throw app.httpErrors.badRequest('Você não pode seguir a si mesmo.');
      const { error } = await req.supabaseUser
        .from('follows')
        .upsert(
          { follower_id: req.user!.id, following_id: req.params.id },
          { onConflict: 'follower_id,following_id', ignoreDuplicates: true },
        );
      if (error) throw error;
      return { following: true };
    },
  );

  // Deixar de seguir.
  t.delete(
    '/users/:id/follow',
    { preValidation: app.requireAuth, schema: { tags: ['users'], summary: 'Unfollow a user', params: z.object({ id: z.string().uuid() }) } },
    async (req) => {
      const { error } = await req.supabaseUser
        .from('follows')
        .delete()
        .eq('follower_id', req.user!.id)
        .eq('following_id', req.params.id);
      if (error) throw error;
      return { following: false };
    },
  );

  // Listas de follow (perfis públicos). RLS follows_public_read permite ler as relações;
  // os PERFIS vêm do RPC não-PII get_public_profiles por ids.
  const followListQuery = z.object({
    limit: z.coerce.number().int().min(1).max(200).optional(),
    offset: z.coerce.number().int().min(0).optional(),
  });

  async function fetchFollowProfiles(
    req: { supabaseUser: FastifyInstance['supabaseAdmin']; params: { id: string }; query: { limit?: number; offset?: number } },
    selectCol: 'follower_id' | 'following_id',
    matchCol: 'following_id' | 'follower_id',
  ) {
    const offset = req.query.offset ?? 0;
    const limit = req.query.limit ?? 100;
    const { data: rows, error } = await req.supabaseUser
      .from('follows')
      .select(selectCol)
      .eq(matchCol, req.params.id)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);
    if (error) throw error;
    const ids = (rows ?? []).map((r) => (r as Record<string, string>)[selectCol]);
    if (!ids.length) return { data: [] };
    const { data, error: e2 } = await req.supabaseUser.rpc('get_public_profiles', { p_ids: ids, p_status: null });
    if (e2) throw e2;
    return { data: data ?? [] };
  }

  // Seguidores: quem segue :id.
  t.get(
    '/users/:id/followers',
    { preValidation: app.requireAuth, schema: { tags: ['users'], summary: 'Followers of a user', params: z.object({ id: z.string().uuid() }), querystring: followListQuery } },
    async (req) => fetchFollowProfiles(req as never, 'follower_id', 'following_id'),
  );

  // Seguindo: quem :id segue.
  t.get(
    '/users/:id/following',
    { preValidation: app.requireAuth, schema: { tags: ['users'], summary: 'Users a user follows', params: z.object({ id: z.string().uuid() }), querystring: followListQuery } },
    async (req) => fetchFollowProfiles(req as never, 'following_id', 'follower_id'),
  );

  // Liderança pública de um setor (coordenador + líder). PÚBLICO (sem auth) porque é usado
  // no CADASTRO, antes do login. Retorna SOMENTE campos não-PII (o mesmo conjunto do
  // get_public_profiles), via supabaseAdmin — profiles não tem leitura anônima por RLS.
  t.get(
    '/sectors/:id/leadership',
    { schema: { tags: ['sectors'], summary: 'Public sector leadership (coordinator + leader)', params: z.object({ id: z.string().uuid() }) } },
    async (req) => {
      const { data: sector, error } = await app.supabaseAdmin
        .from('sectors')
        .select('id, name, coordinator_id, leader_id')
        .eq('id', req.params.id)
        .maybeSingle();
      if (error) throw error;
      if (!sector) return { sectorName: null, coordinator: null, leader: null };

      const ids = [sector.coordinator_id, sector.leader_id].filter(Boolean) as string[];
      let profiles: any[] = [];
      if (ids.length) {
        const { data } = await app.supabaseAdmin
          .from('profiles')
          .select('id, first_name, last_name, avatar, title')
          .in('id', ids);
        profiles = data ?? [];
      }
      const byId = (id?: string | null) => (id ? profiles.find((p) => p.id === id) ?? null : null);
      return { sectorName: sector.name, coordinator: byId(sector.coordinator_id), leader: byId(sector.leader_id) };
    },
  );

  // Lista PÚBLICA de setores (não-PII) para o CADASTRO, que é PRÉ-LOGIN. O GET /sectors
  // genérico exige auth (crud mobileRead) → barraria o signup; por isso esta rota dedicada
  // via supabaseAdmin (sectors não tem leitura anônima por RLS). Só setores ativos.
  t.get(
    '/public/sectors',
    { schema: { tags: ['sectors'], summary: 'Public active sectors list (signup)' } },
    async () => {
      const { data, error } = await app.supabaseAdmin
        .from('sectors')
        .select('id, name, status, sort, coordinator_id, leader_id')
        .eq('status', 'active')
        .order('sort', { ascending: true });
      if (error) throw error;
      return { data: data ?? [] };
    },
  );

  // Traduções PÚBLICAS (strings de UI). O app precisa delas ANTES do login (a própria tela
  // de login usa t('login_title')), então não pode usar o GET /translations autenticado
  // (dava "Missing bearer token" no boot). Não-sensível → supabaseAdmin, público.
  t.get(
    '/public/translations',
    { schema: { tags: ['translations'], summary: 'Public UI translations (pre-login)', querystring: z.object({ language: z.string().optional() }) } },
    async (req) => {
      let query = app.supabaseAdmin
        .from('translations')
        .select('id, language, key, value, updated_at', { count: 'exact' });
      if (req.query.language) query = query.eq('language', req.query.language);
      const { data, count, error } = await query.order('updated_at', { ascending: false }).limit(2000);
      if (error) throw error;
      return { data: data ?? [], meta: { total: count ?? (data?.length ?? 0) } };
    },
  );

  // Config/branding PÚBLICO (cores, nome, logo). O app aplica o tema ANTES do login, então
  // não pode usar o GET /app_config autenticado. app_config só tem branding (sem segredos).
  t.get(
    '/public/config',
    { schema: { tags: ['config'], summary: 'Public app config / branding (pre-login)' } },
    async () => {
      const { data, error } = await app.supabaseAdmin
        .from('app_config')
        .select('*')
        .order('id', { ascending: true })
        .limit(1);
      if (error) throw error;
      return { data: data ?? [] };
    },
  );

  // Checa se um email já tem conta. PÚBLICO (usado no cadastro, pré-login) para oferecer
  // "fazer login" em vez de duplicar. Retorna só um boolean (nenhum dado do perfil).
  // NOTA: é um oráculo de enumeração — aceitável para este app; mitigado pelo rate-limit global.
  t.get(
    '/auth/email-exists',
    { schema: { tags: ['auth'], summary: 'Check if an email is already registered', querystring: z.object({ email: z.string().email() }) } },
    async (req) => {
      const email = (req.query.email as string).trim().toLowerCase();
      // .eq (não .ilike): emails são lowercase no banco; ilike trataria '_' como wildcard
      // (caractere válido em email) → falso positivo.
      const { data, error } = await app.supabaseAdmin
        .from('profiles')
        .select('id')
        .eq('email', email)
        .limit(1);
      if (error) throw error;
      return { exists: (data?.length ?? 0) > 0 };
    },
  );

  // Own profile.
  t.get('/me', { preValidation: app.requireAuth, schema: { tags: ['users'], summary: 'Get own profile' } }, async (req) => {
    const { data, error } = await req.supabaseUser.from('profiles').select('*').eq('id', req.user!.id).maybeSingle();
    if (error) throw error;
    if (!data) throw app.httpErrors.notFound('profile not found');
    return data;
  });

  // Update own profile (whitelisted).
  t.patch(
    '/me',
    { preValidation: app.requireAuth, schema: { tags: ['users'], summary: 'Update own profile', body: meUpdateSchema } },
    async (req) => {
      const body = req.body as Record<string, unknown>;
      const patch: Record<string, unknown> = {};
      for (const key of PROFILE_UPDATABLE) {
        if (key in body) patch[key] = body[key];
      }
      const { data, error } = await req.supabaseUser
        .from('profiles')
        .update(patch as never)
        .eq('id', req.user!.id)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
  );

  // Deactivate own account (SECURITY DEFINER RPC).
  t.delete('/me', { preValidation: app.requireAuth, schema: { tags: ['users'], summary: 'Deactivate own account' } }, async (req, reply) => {
    const { error } = await req.supabaseUser.rpc('deactivate_my_account');
    if (error) throw error;
    reply.code(204);
    return null;
  });

  // Increment a news article's view counter.
  t.post(
    '/news/:id/views',
    { preValidation: app.requireAuth, schema: { tags: ['news'], summary: 'Increment news views', params: z.object({ id: z.string() }) } },
    async (req) => {
      const { error } = await req.supabaseUser.rpc('increment_news_views', { p_id: req.params.id });
      if (error) throw error;
      return { ok: true };
    },
  );

  // ── Presença no congresso ──────────────────────────────────────────────────
  // Confirmação individual do próprio usuário (own-row) + total de confirmados
  // (contagem agregada, sem PII). Escritas usam service-role escopado ao
  // req.user.id; a RLS own-row da tabela é defesa em profundidade.
  const presencaParams = z.object({ id: z.string().uuid() });

  const countConfirmados = async (congressoId: string): Promise<number> => {
    const { count, error } = await app.supabaseAdmin
      .from('congresso_presencas')
      .select('id', { count: 'exact', head: true })
      .eq('congresso_id', congressoId);
    if (error) throw error;
    return count ?? 0;
  };

  // Status da presença do usuário atual + total de confirmados.
  t.get(
    '/congressos/:id/presenca',
    { preValidation: app.requireAuth, schema: { tags: ['congressos'], summary: 'Status de presença + total', params: presencaParams } },
    async (req) => {
      const congressoId = req.params.id;
      const [own, total] = await Promise.all([
        app.supabaseAdmin
          .from('congresso_presencas')
          .select('id')
          .eq('congresso_id', congressoId)
          .eq('user_id', req.user!.id)
          .maybeSingle(),
        countConfirmados(congressoId),
      ]);
      if (own.error) throw own.error;
      return { confirmed: !!own.data, total };
    },
  );

  // Confirmar presença (idempotente: ON CONFLICT DO NOTHING via unique constraint).
  t.post(
    '/congressos/:id/presenca',
    { preValidation: app.requireAuth, schema: { tags: ['congressos'], summary: 'Confirmar presença', params: presencaParams } },
    async (req) => {
      const congressoId = req.params.id;
      const { error } = await app.supabaseAdmin
        .from('congresso_presencas')
        .upsert(
          { congresso_id: congressoId, user_id: req.user!.id },
          { onConflict: 'congresso_id,user_id', ignoreDuplicates: true },
        );
      if (error) throw error;
      return { confirmed: true, total: await countConfirmados(congressoId) };
    },
  );

  // Cancelar presença.
  t.delete(
    '/congressos/:id/presenca',
    { preValidation: app.requireAuth, schema: { tags: ['congressos'], summary: 'Cancelar presença', params: presencaParams } },
    async (req) => {
      const congressoId = req.params.id;
      const { error } = await app.supabaseAdmin
        .from('congresso_presencas')
        .delete()
        .eq('congresso_id', congressoId)
        .eq('user_id', req.user!.id);
      if (error) throw error;
      return { confirmed: false, total: await countConfirmados(congressoId) };
    },
  );

  // Programação (agenda) do congresso — itens publicados, ordenados por dia → hora → sort.
  // Leitura via req.supabaseUser: a RLS já restringe a itens status='published'.
  t.get(
    '/congressos/:id/programacao',
    { preValidation: app.requireAuth, schema: { tags: ['congressos'], summary: 'Programação do congresso', params: presencaParams } },
    async (req) => {
      const { data, error } = await req.supabaseUser
        .from('congresso_programacao')
        .select('id, day, start_time, end_time, title, description, location, speaker, type, sort')
        .eq('congresso_id', req.params.id)
        .eq('status', 'published')
        .order('day', { ascending: true })
        .order('start_time', { ascending: true, nullsFirst: false })
        .order('sort', { ascending: true, nullsFirst: false });
      if (error) throw error;
      return { data: data ?? [] };
    },
  );

  // ── Push: cria a notificação (aparece na lista in-app) E dispara o push remoto ──
  // Expo Push → APNs (iOS: entrega real requer conta Apple paga) / FCM (Android). Admin-only.
  const sendPushBody = z.object({
    title: z.string().min(1),
    body: z.string().min(1),
    data: z.record(z.any()).optional(),
    type: z.string().optional(),
    target: z.enum(['all', 'users']).default('users'),
    user_ids: z.array(z.string().uuid()).optional(),
  });

  t.post(
    '/admin/notifications/send',
    { preValidation: app.requireAdmin, schema: { tags: ['notifications'], summary: 'Criar notificação + enviar push (admin)', body: sendPushBody } },
    async (req) => {
      const { title, body, data, type, target, user_ids } = req.body;

      // Resolve os usuários-alvo.
      let userIds: string[];
      if (target === 'all') {
        const { data: profs, error } = await app.supabaseAdmin.from('profiles').select('id').eq('status', 'active');
        if (error) throw error;
        userIds = (profs ?? []).map((p) => p.id);
      } else {
        userIds = user_ids ?? [];
        if (userIds.length === 0) throw app.httpErrors.badRequest('Informe user_ids quando target = "users".');
      }

      const empty = { recipients: 0, valid: 0, sent: 0, errors: 0, deactivated: 0 };
      if (userIds.length === 0) return { created: 0, push: empty };

      // 1) Persiste uma notificação por usuário (a lista in-app funciona mesmo sem push remoto).
      const rows = userIds.map((uid) => ({
        user_id: uid,
        title,
        body,
        data: (data ?? null) as Json,
        type: type ?? null,
        status: true,
        read: false,
      }));
      const { error: insErr } = await app.supabaseAdmin.from('notifications').insert(rows);
      if (insErr) throw insErr;

      // 2) Dispara o push. Não derruba a request se a entrega falhar (o resultado vai no resumo).
      const push = await sendPushToUsers(app, userIds, { title, body, data });

      return { created: userIds.length, push };
    },
  );
}
