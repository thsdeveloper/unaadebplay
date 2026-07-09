import { z } from 'zod';

// Row shape returned by the API (passthrough tolerates extra/embedded columns).
export const subscribedHosRowSchema = z
  .object({
    accommodation: z.boolean(),
    allergies: z.boolean(),
    allergies_description: z.string().nullable(),
    blood_type: z.string().nullable(),
    blood_type_rh: z.string().nullable(),
    child_companion: z.boolean(),
    created_at: z.string(),
    created_by: z.string().nullable(),
    emergency_contact: z.string().nullable(),
    id: z.number(),
    member: z.string(),
    normas_cinco: z.boolean(),
    normas_dez: z.boolean(),
    normas_dois: z.boolean(),
    normas_nove: z.boolean(),
    normas_oito: z.boolean(),
    normas_quatro: z.boolean(),
    normas_seis: z.boolean(),
    normas_sete: z.boolean(),
    normas_tres: z.boolean(),
    normas_um: z.boolean(),
    payment: z.any(),
    payment_id: z.string().nullable(),
    payment_status: z.string().nullable(),
    take_medication: z.boolean(),
    take_medication_description: z.string().nullable(),
  })
  .passthrough();

export const subscribedHosCreateSchema = z.object({
  accommodation: z.boolean().optional(),
  allergies: z.boolean().optional(),
  allergies_description: z.string().nullish(),
  blood_type: z.string().nullish(),
  blood_type_rh: z.string().nullish(),
  child_companion: z.boolean().optional(),
  created_by: z.string().nullish(),
  emergency_contact: z.string().nullish(),
  member: z.string(),
  normas_cinco: z.boolean().optional(),
  normas_dez: z.boolean().optional(),
  normas_dois: z.boolean().optional(),
  normas_nove: z.boolean().optional(),
  normas_oito: z.boolean().optional(),
  normas_quatro: z.boolean().optional(),
  normas_seis: z.boolean().optional(),
  normas_sete: z.boolean().optional(),
  normas_tres: z.boolean().optional(),
  normas_um: z.boolean().optional(),
  payment: z.any(),
  payment_id: z.string().nullish(),
  payment_status: z.string().nullish(),
  take_medication: z.boolean().optional(),
  take_medication_description: z.string().nullish(),
});

export const subscribedHosUpdateSchema = subscribedHosCreateSchema.partial();

export const subscribedHosSchemas = {
  rowSchema: subscribedHosRowSchema,
  createSchema: subscribedHosCreateSchema,
  updateSchema: subscribedHosUpdateSchema,
};

export type SubscribedHos = z.infer<typeof subscribedHosRowSchema>;
