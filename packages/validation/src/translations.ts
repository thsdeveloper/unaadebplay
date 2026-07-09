import { z } from 'zod';

// Row shape returned by the API (passthrough tolerates extra/embedded columns).
export const translationsRowSchema = z
  .object({
    id: z.string(),
    key: z.string(),
    language: z.string(),
    updated_at: z.string(),
    value: z.string(),
  })
  .passthrough();

export const translationsCreateSchema = z.object({
  key: z.string(),
  language: z.string(),
  value: z.string(),
});

export const translationsUpdateSchema = translationsCreateSchema.partial();

export const translationsSchemas = {
  rowSchema: translationsRowSchema,
  createSchema: translationsCreateSchema,
  updateSchema: translationsUpdateSchema,
};

export type Translations = z.infer<typeof translationsRowSchema>;
