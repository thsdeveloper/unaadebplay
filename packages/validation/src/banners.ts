import { z } from 'zod';

// Row shape returned by the API (passthrough tolerates extra/embedded columns).
export const bannersRowSchema = z
  .object({
    action_label: z.string().nullable(),
    created_at: z.string(),
    description: z.string().nullable(),
    id: z.string(),
    image: z.string(),
    page_route: z.string().nullable(),
    params_id: z.string().nullable(),
    screen: z.string().nullable(),
    sort: z.number().nullable(),
    status: z.string(),
    title: z.string().nullable(),
  })
  .passthrough();

export const bannersCreateSchema = z.object({
  action_label: z.string().nullish(),
  description: z.string().nullish(),
  image: z.string(),
  page_route: z.string().nullish(),
  params_id: z.string().nullish(),
  screen: z.string().nullish(),
  sort: z.number().nullish(),
  status: z.string().optional(),
  title: z.string().nullish(),
});

export const bannersUpdateSchema = bannersCreateSchema.partial();

export const bannersSchemas = {
  rowSchema: bannersRowSchema,
  createSchema: bannersCreateSchema,
  updateSchema: bannersUpdateSchema,
};

export type Banner = z.infer<typeof bannersRowSchema>;
