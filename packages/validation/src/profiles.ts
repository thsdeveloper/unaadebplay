import { z } from 'zod';

// Row shape returned by the API (passthrough tolerates extra/embedded columns).
export const profilesRowSchema = z
  .object({
    avatar: z.string().nullable(),
    birthdate: z.string().nullable(),
    created_at: z.string(),
    description: z.string().nullable(),
    email: z.string(),
    first_name: z.string().nullable(),
    gender: z.string().nullable(),
    id: z.string(),
    is_admin: z.boolean(),
    language: z.string().nullable(),
    last_access: z.string().nullable(),
    last_name: z.string().nullable(),
    location: z.string().nullable(),
    phone: z.string().nullable(),
    responsible_email: z.string().nullable(),
    responsible_name: z.string().nullable(),
    responsible_phone: z.string().nullable(),
    role: z.string().nullable(),
    sector: z.string().nullable(),
    status: z.string(),
    tags: z.array(z.string()).nullable(),
    theme: z.string().nullable(),
    title: z.string().nullable(),
    updated_at: z.string().nullable(),
  })
  .passthrough();

export const profilesCreateSchema = z.object({
  avatar: z.string().nullish(),
  birthdate: z.string().nullish(),
  description: z.string().nullish(),
  email: z.string(),
  first_name: z.string().nullish(),
  gender: z.string().nullish(),
  language: z.string().nullish(),
  last_name: z.string().nullish(),
  location: z.string().nullish(),
  phone: z.string().nullish(),
  responsible_email: z.string().nullish(),
  responsible_name: z.string().nullish(),
  responsible_phone: z.string().nullish(),
  role: z.string().nullish(),
  sector: z.string().nullish(),
  status: z.string().optional(),
  tags: z.array(z.string()).nullish(),
  theme: z.string().nullish(),
  title: z.string().nullish(),
});

export const profilesUpdateSchema = profilesCreateSchema.partial();

export const profilesSchemas = {
  rowSchema: profilesRowSchema,
  createSchema: profilesCreateSchema,
  updateSchema: profilesUpdateSchema,
};

export type Profile = z.infer<typeof profilesRowSchema>;
