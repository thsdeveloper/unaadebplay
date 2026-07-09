import { z } from 'zod';

// Row shape returned by the API (passthrough tolerates extra/embedded columns).
export const notificationsRowSchema = z
  .object({
    body: z.string().nullable(),
    created_at: z.string(),
    data: z.any(),
    deleted_at: z.string().nullable(),
    id: z.string(),
    read: z.boolean(),
    read_at: z.string().nullable(),
    status: z.boolean(),
    title: z.string().nullable(),
    type: z.string().nullable(),
    updated_at: z.string().nullable(),
    user_id: z.string(),
  })
  .passthrough();

export const notificationsCreateSchema = z.object({
  body: z.string().nullish(),
  data: z.any(),
  deleted_at: z.string().nullish(),
  read: z.boolean().optional(),
  read_at: z.string().nullish(),
  status: z.boolean().optional(),
  title: z.string().nullish(),
  type: z.string().nullish(),
  user_id: z.string(),
});

export const notificationsUpdateSchema = notificationsCreateSchema.partial();

export const notificationsSchemas = {
  rowSchema: notificationsRowSchema,
  createSchema: notificationsCreateSchema,
  updateSchema: notificationsUpdateSchema,
};

export type Notification = z.infer<typeof notificationsRowSchema>;
