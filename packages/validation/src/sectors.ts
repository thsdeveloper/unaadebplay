import { z } from 'zod';

// Row shape returned by the API (passthrough tolerates extra/embedded columns).
export const sectorRowSchema = z
  .object({
    id: z.string(),
    name: z.string(),
    legacy_slug: z.string().nullable(),
    sort: z.number().nullable(),
    status: z.string(),
    created_at: z.string(),
    updated_at: z.string().nullable(),
  })
  .passthrough();

export const sectorCreateSchema = z.object({
  name: z.string().min(1),
  legacy_slug: z.string().nullish(),
  sort: z.number().int().nullish(),
  status: z.string().optional(),
});

export const sectorUpdateSchema = sectorCreateSchema.partial();

export const sectorsSchemas = {
  rowSchema: sectorRowSchema,
  createSchema: sectorCreateSchema,
  updateSchema: sectorUpdateSchema,
};

export type Sector = z.infer<typeof sectorRowSchema>;
