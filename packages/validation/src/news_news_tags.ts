import { z } from 'zod';

// Row shape returned by the API (passthrough tolerates extra/embedded columns).
export const newsNewsTagsRowSchema = z
  .object({
    id: z.number(),
    news_id: z.string(),
    news_tags_id: z.string(),
  })
  .passthrough();

export const newsNewsTagsCreateSchema = z.object({
  news_id: z.string(),
  news_tags_id: z.string(),
});

export const newsNewsTagsUpdateSchema = newsNewsTagsCreateSchema.partial();

export const newsNewsTagsSchemas = {
  rowSchema: newsNewsTagsRowSchema,
  createSchema: newsNewsTagsCreateSchema,
  updateSchema: newsNewsTagsUpdateSchema,
};

export type NewsNewsTags = z.infer<typeof newsNewsTagsRowSchema>;
