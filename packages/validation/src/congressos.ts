import { z } from 'zod';

// Row shape returned by the API (passthrough tolerates extra/embedded columns).
export const congressosRowSchema = z
  .object({
    created_at: z.string(),
    date_end: z.string(),
    date_start: z.string(),
    description: z.string().nullable(),
    id: z.string(),
    location: z.string().nullable(),
    location_url: z.string().nullable(),
    name: z.string(),
    poster: z.string().nullable(),
    primary_color: z.string().nullable(),
    second_color: z.string().nullable(),
    status: z.string(),
    status_hospedagem: z.boolean(),
    theme: z.string().nullable(),
    updated_at: z.string().nullable(),
  })
  .passthrough();

export const congressosCreateSchema = z.object({
  date_end: z.string(),
  date_start: z.string(),
  description: z.string().nullish(),
  location: z.string().nullish(),
  location_url: z.string().nullish(),
  name: z.string(),
  poster: z.string().nullish(),
  primary_color: z.string().nullish(),
  second_color: z.string().nullish(),
  status: z.string().optional(),
  status_hospedagem: z.boolean().optional(),
  theme: z.string().nullish(),
});

export const congressosUpdateSchema = congressosCreateSchema.partial();

export const congressosSchemas = {
  rowSchema: congressosRowSchema,
  createSchema: congressosCreateSchema,
  updateSchema: congressosUpdateSchema,
};

export type Congressos = z.infer<typeof congressosRowSchema>;
