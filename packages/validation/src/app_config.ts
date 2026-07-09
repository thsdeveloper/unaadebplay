import { z } from 'zod';

// Row shape returned by the API (passthrough tolerates extra/embedded columns).
export const appConfigRowSchema = z
  .object({
    avatar_default: z.string().nullable(),
    id: z.number(),
    primary_color: z.string().nullable(),
    primary_dark_color: z.string().nullable(),
    primary_darker_color: z.string().nullable(),
    project_logo: z.string().nullable(),
    project_name: z.string(),
    secondary_color: z.string().nullable(),
    updated_at: z.string().nullable(),
  })
  .passthrough();

export const appConfigCreateSchema = z.object({
  avatar_default: z.string().nullish(),
  primary_color: z.string().nullish(),
  primary_dark_color: z.string().nullish(),
  primary_darker_color: z.string().nullish(),
  project_logo: z.string().nullish(),
  project_name: z.string().optional(),
  secondary_color: z.string().nullish(),
});

export const appConfigUpdateSchema = appConfigCreateSchema.partial();

export const appConfigSchemas = {
  rowSchema: appConfigRowSchema,
  createSchema: appConfigCreateSchema,
  updateSchema: appConfigUpdateSchema,
};

export type AppConfig = z.infer<typeof appConfigRowSchema>;
