import { z } from 'zod';

// Row shape returned by the API (passthrough tolerates extra/embedded columns).
export const eventsRowSchema = z
  .object({
    created_at: z.string(),
    created_by: z.string().nullable(),
    description: z.string().nullable(),
    end_date_time: z.string().nullable(),
    event_type: z.string(),
    id: z.string(),
    image_cover: z.string().nullable(),
    location: z.string(),
    organizer: z.string().nullable(),
    organizer_contact_info: z.string().nullable(),
    sort: z.number().nullable(),
    start_date_time: z.string(),
    status: z.string().nullable(),
    subtitle: z.string().nullable(),
    title: z.string(),
    updated_at: z.string().nullable(),
    updated_by: z.string().nullable(),
  })
  .passthrough();

export const eventsCreateSchema = z.object({
  created_by: z.string().nullish(),
  description: z.string().nullish(),
  end_date_time: z.string().nullish(),
  event_type: z.string().optional(),
  image_cover: z.string().nullish(),
  location: z.string(),
  organizer: z.string().nullish(),
  organizer_contact_info: z.string().nullish(),
  sort: z.number().nullish(),
  start_date_time: z.string(),
  status: z.string().nullish(),
  subtitle: z.string().nullish(),
  title: z.string(),
  updated_by: z.string().nullish(),
});

export const eventsUpdateSchema = eventsCreateSchema.partial();

export const eventsSchemas = {
  rowSchema: eventsRowSchema,
  createSchema: eventsCreateSchema,
  updateSchema: eventsUpdateSchema,
};

export type Event = z.infer<typeof eventsRowSchema>;
