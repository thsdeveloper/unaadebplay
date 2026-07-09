import { z } from 'zod';

// Row shape returned by the API (passthrough tolerates extra/embedded columns).
export const hospedagemRowSchema = z
  .object({
    anfitriao: z.string().nullable(),
    comodidades: z.any(),
    created_at: z.string(),
    created_by: z.string().nullable(),
    custo: z.number().nullable(),
    descricao: z.string().nullable(),
    disponibilidade: z.string().nullable(),
    id: z.number(),
    regras: z.string().nullable(),
    status: z.string().nullable(),
    tipo: z.any(),
    titulo: z.string().nullable(),
    updated_at: z.string().nullable(),
    vagas_disponiveis: z.number().nullable(),
    vagas_ocupadas: z.number().nullable(),
  })
  .passthrough();

export const hospedagemCreateSchema = z.object({
  anfitriao: z.string().nullish(),
  comodidades: z.any(),
  created_by: z.string().nullish(),
  custo: z.number().nullish(),
  descricao: z.string().nullish(),
  disponibilidade: z.string().nullish(),
  regras: z.string().nullish(),
  status: z.string().nullish(),
  tipo: z.any(),
  titulo: z.string().nullish(),
  vagas_disponiveis: z.number().nullish(),
  vagas_ocupadas: z.number().nullish(),
});

export const hospedagemUpdateSchema = hospedagemCreateSchema.partial();

export const hospedagemSchemas = {
  rowSchema: hospedagemRowSchema,
  createSchema: hospedagemCreateSchema,
  updateSchema: hospedagemUpdateSchema,
};

export type Hospedagem = z.infer<typeof hospedagemRowSchema>;
