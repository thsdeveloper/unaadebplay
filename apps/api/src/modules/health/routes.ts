import type { FastifyInstance } from 'fastify';
import type { ZodTypeProvider } from 'fastify-type-provider-zod';
import { z } from 'zod';

export default async function healthRoutes(app: FastifyInstance) {
  const t = app.withTypeProvider<ZodTypeProvider>();
  t.get(
    '/health',
    {
      schema: {
        tags: ['system'],
        summary: 'Health check',
        response: { 200: z.object({ ok: z.boolean(), ts: z.string() }) },
      },
    },
    async () => ({ ok: true, ts: new Date().toISOString() }),
  );
}
