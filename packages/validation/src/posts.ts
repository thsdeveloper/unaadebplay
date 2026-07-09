import { z } from 'zod';

// Row shape returned by the API (passthrough tolerates extra/embedded columns).
export const postsRowSchema = z
  .object({
    content: z.string().nullable(),
    created_at: z.string(),
    created_by: z.string().nullable(),
    description: z.string().nullable(),
    id: z.string(),
    image: z.string().nullable(),
    sort: z.number().nullable(),
    status: z.string(),
    tags: z.array(z.string()).nullable(),
    title: z.string(),
    updated_at: z.string().nullable(),
    updated_by: z.string().nullable(),
  })
  .passthrough();

export const postsCreateSchema = z.object({
  content: z.string().nullish(),
  created_by: z.string().nullish(),
  description: z.string().nullish(),
  image: z.string().nullish(),
  sort: z.number().nullish(),
  status: z.string().optional(),
  tags: z.array(z.string()).nullish(),
  title: z.string(),
  updated_by: z.string().nullish(),
});

export const postsUpdateSchema = postsCreateSchema.partial();

export const postsSchemas = {
  rowSchema: postsRowSchema,
  createSchema: postsCreateSchema,
  updateSchema: postsUpdateSchema,
};

export type Post = z.infer<typeof postsRowSchema>;
