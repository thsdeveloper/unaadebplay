import { z } from 'zod';

// Row shape returned by the API (passthrough tolerates extra/embedded columns).
export const deviceTokensRowSchema = z
  .object({
    created_at: z.string(),
    id: z.string(),
    platform: z.string().nullable(),
    status: z.boolean(),
    token: z.string(),
    updated_at: z.string().nullable(),
    user_id: z.string(),
  })
  .passthrough();

export const deviceTokensCreateSchema = z.object({
  platform: z.string().nullish(),
  status: z.boolean().optional(),
  token: z.string(),
  user_id: z.string(),
});

export const deviceTokensUpdateSchema = deviceTokensCreateSchema.partial();

export const deviceTokensSchemas = {
  rowSchema: deviceTokensRowSchema,
  createSchema: deviceTokensCreateSchema,
  updateSchema: deviceTokensUpdateSchema,
};

export type DeviceTokens = z.infer<typeof deviceTokensRowSchema>;
