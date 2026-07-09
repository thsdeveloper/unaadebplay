import { z } from 'zod';

// Row shape returned by the API (passthrough tolerates extra/embedded columns).
export const congressoProgramacaoRowSchema = z
  .object({
    congresso_id: z.string(),
    created_at: z.string(),
    day: z.string(), // YYYY-MM-DD
    description: z.string().nullable(),
    end_time: z.string().nullable(), // HH:MM[:SS]
    id: z.string(),
    location: z.string().nullable(),
    sort: z.number().nullable(),
    speaker: z.string().nullable(),
    start_time: z.string().nullable(), // HH:MM[:SS]
    status: z.string(),
    title: z.string(),
    type: z.string().nullable(),
    updated_at: z.string().nullable(),
  })
  .passthrough();

// Cadastro de um item da programação. `congresso_id`, `day` e `title` são obrigatórios;
// horários e metadados são opcionais (nem todo item tem hora exata). `type` classifica o
// item (louvor | preletor | intervalo | geral) → ícone/cor no app.
export const congressoProgramacaoCreateSchema = z.object({
  congresso_id: z.string(),
  status: z.string().optional(), // default 'published' no banco
  day: z.string(),
  start_time: z.string().nullish(),
  end_time: z.string().nullish(),
  title: z.string().min(1),
  description: z.string().nullish(),
  location: z.string().nullish(),
  speaker: z.string().nullish(),
  type: z.string().nullish(),
  sort: z.number().int().nullish(),
});

export const congressoProgramacaoUpdateSchema = congressoProgramacaoCreateSchema.partial();

export const congressoProgramacaoSchemas = {
  rowSchema: congressoProgramacaoRowSchema,
  createSchema: congressoProgramacaoCreateSchema,
  updateSchema: congressoProgramacaoUpdateSchema,
};

export type CongressoProgramacao = z.infer<typeof congressoProgramacaoRowSchema>;
