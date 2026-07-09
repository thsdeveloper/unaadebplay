import { z } from 'zod';

/**
 * Directus-style list query shared by mobile + admin + API.
 * The API translates `filter`/`sort` into PostgREST via the ported items translator.
 */
export const listQuerySchema = z.object({
  limit: z.coerce.number().int().min(1).max(1000).optional(),
  offset: z.coerce.number().int().min(0).optional(),
  page: z.coerce.number().int().min(1).optional(),
  sort: z.union([z.string(), z.array(z.string())]).optional(),
  search: z.string().optional(),
  // Directus-style filter object; arrives over the querystring as a JSON string.
  filter: z
    .preprocess((v) => {
      if (typeof v === 'string') {
        try {
          return JSON.parse(v);
        } catch {
          return undefined;
        }
      }
      return v;
    }, z.record(z.string(), z.any()).optional())
    .optional(),
});
export type ListQuery = z.infer<typeof listQuerySchema>;

export const idParamSchema = z.object({ id: z.string() });
export type IdParam = z.infer<typeof idParamSchema>;

export const listMetaSchema = z.object({ total: z.number().int() });

/** Envelope returned by every list endpoint: `{ data, meta: { total } }`. */
export function listResponseSchema<T extends z.ZodTypeAny>(row: T) {
  return z.object({ data: z.array(row), meta: listMetaSchema });
}
