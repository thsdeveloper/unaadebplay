import fp from 'fastify-plugin';
import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '@repo/db-types';

export type DbClient = SupabaseClient<Database>;

declare module 'fastify' {
  interface FastifyInstance {
    /** Service-role client — BYPASSES RLS. Only ever used behind `requireAdmin`. */
    supabaseAdmin: DbClient;
  }
  interface FastifyRequest {
    /** Per-request client scoped to the caller's JWT — RLS is ENFORCED. */
    supabaseUser: DbClient;
  }
}

export default fp(
  async (app) => {
    const { SUPABASE_URL, SUPABASE_SECRET_KEY, SUPABASE_PUBLISHABLE_KEY } = app.env;

    const admin = createClient<Database>(SUPABASE_URL, SUPABASE_SECRET_KEY, {
      auth: { persistSession: false, autoRefreshToken: false },
    });
    app.decorate('supabaseAdmin', admin);

    app.decorateRequest('supabaseUser', null as unknown as DbClient);
    app.addHook('onRequest', async (req) => {
      const header = req.headers.authorization;
      const token = header?.startsWith('Bearer ') ? header.slice(7) : undefined;
      req.supabaseUser = createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
        global: { headers: token ? { Authorization: `Bearer ${token}` } : {} },
        auth: { persistSession: false, autoRefreshToken: false },
      });
    });
  },
  { name: 'supabase', dependencies: ['env'] },
);
