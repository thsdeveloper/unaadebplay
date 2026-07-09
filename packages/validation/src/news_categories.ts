import { z } from 'zod';

// Row shape returned by the API (passthrough tolerates extra/embedded columns).
export const newsCategoriesRowSchema = z
  .object({
    color: z.string().nullable(),
    description: z.string().nullable(),
    icon: z.string().nullable(),
    id: z.string(),
    name: z.string(),
    slug: z.string(),
    sort: z.number().nullable(),
  })
  .passthrough();

export const newsCategoriesCreateSchema = z.object({
  color: z.string().nullish(),
  description: z.string().nullish(),
  icon: z.string().nullish(),
  name: z.string(),
  slug: z.string(),
  sort: z.number().nullish(),
});

export const newsCategoriesUpdateSchema = newsCategoriesCreateSchema.partial();

export const newsCategoriesSchemas = {
  rowSchema: newsCategoriesRowSchema,
  createSchema: newsCategoriesCreateSchema,
  updateSchema: newsCategoriesUpdateSchema,
};

export type NewsCategories = z.infer<typeof newsCategoriesRowSchema>;
