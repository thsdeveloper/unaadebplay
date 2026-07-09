import { z } from 'zod';

// Row shape returned by the API (passthrough tolerates extra/embedded columns).
export const newsRowSchema = z
  .object({
    author: z.string().nullable(),
    category: z.string().nullable(),
    content: z.string(),
    created_at: z.string(),
    created_by: z.string().nullable(),
    excerpt: z.string().nullable(),
    featured: z.boolean().nullable(),
    featured_image: z.string().nullable(),
    id: z.string(),
    meta_description: z.string().nullable(),
    meta_title: z.string().nullable(),
    publish_date: z.string(),
    reading_time: z.number().nullable(),
    slug: z.string(),
    status: z.string(),
    title: z.string(),
    updated_at: z.string().nullable(),
    updated_by: z.string().nullable(),
    views_count: z.number().nullable(),
  })
  .passthrough();

export const newsCreateSchema = z.object({
  author: z.string().nullish(),
  category: z.string().nullish(),
  content: z.string(),
  created_by: z.string().nullish(),
  excerpt: z.string().nullish(),
  featured: z.boolean().nullish(),
  featured_image: z.string().nullish(),
  meta_description: z.string().nullish(),
  meta_title: z.string().nullish(),
  publish_date: z.string().optional(),
  reading_time: z.number().nullish(),
  slug: z.string(),
  status: z.string().optional(),
  title: z.string(),
  updated_by: z.string().nullish(),
  views_count: z.number().nullish(),
});

export const newsUpdateSchema = newsCreateSchema.partial();

export const newsSchemas = {
  rowSchema: newsRowSchema,
  createSchema: newsCreateSchema,
  updateSchema: newsUpdateSchema,
};

export type News = z.infer<typeof newsRowSchema>;
