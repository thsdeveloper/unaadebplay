import fp from 'fastify-plugin';
import { createRemoteJWKSet, jwtVerify, errors as joseErrors, type JWTPayload } from 'jose';
import type { FastifyReply, FastifyRequest } from 'fastify';

export interface AuthUser {
  id: string;
  email?: string;
  isAdmin?: boolean;
}

declare module 'fastify' {
  interface FastifyRequest {
    user?: AuthUser;
  }
  interface FastifyInstance {
    requireAuth: (req: FastifyRequest, reply: FastifyReply) => Promise<unknown>;
    requireAdmin: (req: FastifyRequest, reply: FastifyReply) => Promise<unknown>;
  }
}

export default fp(
  async (app) => {
    // Supabase issues asymmetric (ES256) tokens — verify against the JWKS endpoint.
    const JWKS = createRemoteJWKSet(new URL(app.env.SUPABASE_JWKS_URL));
    const verifyOpts = { issuer: app.env.SUPABASE_JWT_ISSUER, audience: 'authenticated' } as const;

    async function verify(token: string): Promise<JWTPayload> {
      try {
        return (await jwtVerify(token, JWKS, verifyOpts)).payload;
      } catch (err) {
        // On key rotation jose refetches the JWKS; retry once before failing.
        if (err instanceof joseErrors.JWKSNoMatchingKey) {
          return (await jwtVerify(token, JWKS, verifyOpts)).payload;
        }
        throw err;
      }
    }

    app.decorate('requireAuth', async (req: FastifyRequest, reply: FastifyReply) => {
      const header = req.headers.authorization;
      const token = header?.startsWith('Bearer ') ? header.slice(7) : undefined;
      if (!token) {
        return reply.code(401).send({ error: 'Unauthorized', message: 'Missing bearer token' });
      }
      try {
        const payload = await verify(token);
        req.user = { id: String(payload.sub), email: payload.email as string | undefined };
      } catch {
        return reply.code(401).send({ error: 'Unauthorized', message: 'Invalid or expired token' });
      }
    });

    // Admin gate: read the caller's own is_admin via their RLS-scoped client
    // (owner-SELECT is allowed), so the check needs no service-role key.
    app.decorate('requireAdmin', async (req: FastifyRequest, reply: FastifyReply) => {
      const authResult = await app.requireAuth(req, reply);
      if (reply.sent) return authResult;
      const { data, error } = await req.supabaseUser
        .from('profiles')
        .select('is_admin')
        .eq('id', req.user!.id)
        .maybeSingle();
      if (error || !data?.is_admin) {
        return reply.code(403).send({ error: 'Forbidden', message: 'Admin privileges required' });
      }
      req.user!.isAdmin = true;
    });
  },
  { name: 'auth', dependencies: ['env', 'supabase'] },
);
