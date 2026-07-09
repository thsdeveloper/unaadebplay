import type { FastifyInstance } from 'fastify';
import type { ZodTypeProvider } from 'fastify-type-provider-zod';
import { z } from 'zod';
import { randomUUID } from 'node:crypto';

const signedUploadBody = z.object({
  bucket: z.enum(['images', 'avatars', 'audio']).default('images'),
  filename: z.string().min(1),
});

/** Admin media uploads: hand out a signed upload URL; the browser PUTs the file straight to Storage. */
export default async function storageRoutes(app: FastifyInstance) {
  const t = app.withTypeProvider<ZodTypeProvider>();

  t.post(
    '/storage/signed-upload',
    { preValidation: app.requireAdmin, schema: { tags: ['storage'], summary: 'Create a signed upload URL', body: signedUploadBody } },
    async (req) => {
      const { bucket, filename } = req.body;
      const safe = filename.replace(/[^a-zA-Z0-9._-]/g, '_');
      const path = `${new Date().toISOString().slice(0, 10)}/${randomUUID()}-${safe}`;

      const { data, error } = await app.supabaseAdmin.storage.from(bucket).createSignedUploadUrl(path);
      if (error) throw error;

      const publicUrl = app.supabaseAdmin.storage.from(bucket).getPublicUrl(path).data.publicUrl;
      return { bucket, path, token: data.token, signedUrl: data.signedUrl, publicUrl };
    },
  );

  // ---- User-scoped media (mobile) ------------------------------------------
  // The mobile proxies the file (base64) THROUGH the API instead of touching
  // Supabase Storage directly. The API writes it under the caller's own prefix
  // (`<userId>/…`), which also makes delete-ownership enforceable.

  const userUploadBody = z.object({
    bucket: z.enum(['images', 'avatars', 'audio']).default('images'),
    filename: z.string().min(1),
    contentType: z.string().min(1),
    contentBase64: z.string().min(1),
  });

  t.post(
    '/me/uploads',
    {
      preValidation: app.requireAuth,
      bodyLimit: 15 * 1024 * 1024, // ~15MB — cobre o base64 de imagens grandes
      schema: { tags: ['storage'], summary: 'Upload own media (proxied through the API)', body: userUploadBody },
    },
    async (req) => {
      const { bucket, filename, contentType, contentBase64 } = req.body;
      const userId = req.user!.id;
      const safe = filename.replace(/[^a-zA-Z0-9._-]/g, '_');
      const path = `${userId}/${randomUUID()}-${safe}`;

      const buffer = Buffer.from(contentBase64, 'base64');
      const { error } = await app.supabaseAdmin.storage.from(bucket).upload(path, buffer, { contentType, upsert: false });
      if (error) throw error;

      const publicUrl = app.supabaseAdmin.storage.from(bucket).getPublicUrl(path).data.publicUrl;
      return { bucket, path, publicUrl };
    },
  );

  const userDeleteQuery = z.object({
    bucket: z.enum(['images', 'avatars', 'audio']).default('images'),
    path: z.string().min(1),
  });

  t.delete(
    '/me/uploads',
    { preValidation: app.requireAuth, schema: { tags: ['storage'], summary: 'Delete own media', querystring: userDeleteQuery } },
    async (req) => {
      const { bucket, path } = req.query;
      const userId = req.user!.id;
      // Ownership: só objetos sob o prefixo do próprio usuário. Paths antigos (sem
      // prefixo) e URLs externas caem aqui como 403 → o cliente trata como best-effort.
      if (!path.startsWith(`${userId}/`)) throw app.httpErrors.forbidden('cannot delete this object');

      const { error } = await app.supabaseAdmin.storage.from(bucket).remove([path]);
      if (error) throw error;
      return { ok: true };
    },
  );
}
