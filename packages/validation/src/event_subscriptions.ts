import { z } from 'zod';

// Row shape returned by the API (passthrough tolerates extra/embedded columns).
export const eventSubscriptionsRowSchema = z
  .object({
    created_at: z.string(),
    event_id: z.string(),
    id: z.string(),
    user_id: z.string(),
  })
  .passthrough();

export const eventSubscriptionsCreateSchema = z.object({
  event_id: z.string(),
  user_id: z.string(),
});

export const eventSubscriptionsUpdateSchema = eventSubscriptionsCreateSchema.partial();

export const eventSubscriptionsSchemas = {
  rowSchema: eventSubscriptionsRowSchema,
  createSchema: eventSubscriptionsCreateSchema,
  updateSchema: eventSubscriptionsUpdateSchema,
};

export type EventSubscription = z.infer<typeof eventSubscriptionsRowSchema>;
