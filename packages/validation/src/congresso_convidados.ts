import { z } from 'zod';

// Row shape returned by the API (passthrough tolerates extra/embedded columns).
export const congressoConvidadosRowSchema = z
  .object({
    congresso_id: z.string(),
    id: z.number(),
    role: z.string().nullable(),
    user_id: z.string(),
  })
  .passthrough();

export const congressoConvidadosCreateSchema = z.object({
  congresso_id: z.string(),
  role: z.string().nullish(),
  user_id: z.string(),
});

export const congressoConvidadosUpdateSchema = congressoConvidadosCreateSchema.partial();

export const congressoConvidadosSchemas = {
  rowSchema: congressoConvidadosRowSchema,
  createSchema: congressoConvidadosCreateSchema,
  updateSchema: congressoConvidadosUpdateSchema,
};

export type CongressoConvidados = z.infer<typeof congressoConvidadosRowSchema>;
