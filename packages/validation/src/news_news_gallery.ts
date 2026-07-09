import { z } from 'zod';

// Row shape returned by the API (passthrough tolerates extra/embedded columns).
export const newsNewsGalleryRowSchema = z
  .object({
    file_path: z.string(),
    id: z.number(),
    news_id: z.string(),
    sort: z.number().nullable(),
  })
  .passthrough();

export const newsNewsGalleryCreateSchema = z.object({
  file_path: z.string(),
  news_id: z.string(),
  sort: z.number().nullish(),
});

export const newsNewsGalleryUpdateSchema = newsNewsGalleryCreateSchema.partial();

export const newsNewsGallerySchemas = {
  rowSchema: newsNewsGalleryRowSchema,
  createSchema: newsNewsGalleryCreateSchema,
  updateSchema: newsNewsGalleryUpdateSchema,
};
