import { z } from 'zod';

// Row shape returned by the API (passthrough tolerates extra/embedded columns).
export const repertoriosRowSchema = z
  .object({
    artist: z.string(),
    category: z.array(z.string()).nullable(),
    color: z.string().nullable(),
    content: z.string().nullable(),
    created_at: z.string(),
    id: z.string(),
    image_cover: z.string(),
    mp3: z.string(),
    sort: z.number().nullable(),
    status: z.string(),
    title: z.string().nullable(),
    updated_at: z.string().nullable(),
  })
  .passthrough();

export const repertoriosCreateSchema = z.object({
  artist: z.string(),
  category: z.array(z.string()).nullish(),
  color: z.string().nullish(),
  content: z.string().nullish(),
  image_cover: z.string(),
  mp3: z.string(),
  sort: z.number().nullish(),
  status: z.string().optional(),
  title: z.string().nullish(),
});

export const repertoriosUpdateSchema = repertoriosCreateSchema.partial();

export const repertoriosSchemas = {
  rowSchema: repertoriosRowSchema,
  createSchema: repertoriosCreateSchema,
  updateSchema: repertoriosUpdateSchema,
};

export type Repertorio = z.infer<typeof repertoriosRowSchema>;
