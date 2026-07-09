import { z } from 'zod';

// Row shape returned by the API (passthrough tolerates extra/embedded columns).
export const newsTagsRowSchema = z
  .object({
    id: z.string(),
    name: z.string(),
    slug: z.string(),
  })
  .passthrough();

export const newsTagsCreateSchema = z.object({
  name: z.string(),
  slug: z.string(),
});

export const newsTagsUpdateSchema = newsTagsCreateSchema.partial();

export const newsTagsSchemas = {
  rowSchema: newsTagsRowSchema,
  createSchema: newsTagsCreateSchema,
  updateSchema: newsTagsUpdateSchema,
};

export type NewsTags = z.infer<typeof newsTagsRowSchema>;
