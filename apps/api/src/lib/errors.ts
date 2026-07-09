import type { FastifyInstance } from 'fastify';
import { hasZodFastifySchemaValidationErrors } from 'fastify-type-provider-zod';

// Postgrest / Postgres error codes → HTTP status.
const PG_STATUS: Record<string, number> = {
  '42501': 403, // insufficient_privilege (RLS denied)
  '23505': 409, // unique_violation
  '23503': 409, // foreign_key_violation
  '23502': 400, // not_null_violation
  '22P02': 400, // invalid_text_representation
  PGRST116: 404, // no rows returned
  PGRST301: 401, // JWT invalid
};

export function registerErrorHandler(app: FastifyInstance) {
  app.setErrorHandler((error, req, reply) => {
    // Zod request-validation errors from fastify-type-provider-zod.
    if (hasZodFastifySchemaValidationErrors(error)) {
      return reply.code(400).send({
        error: 'Bad Request',
        message: 'Request validation failed',
        details: error.validation,
      });
    }

    const err = error as { code?: string; message?: string; statusCode?: number };

    // Supabase / Postgrest errors carry a string `code`.
    if (err.code && PG_STATUS[err.code]) {
      const status = PG_STATUS[err.code];
      return reply.code(status).send({
        error: status >= 500 ? 'Internal Server Error' : 'Error',
        message: err.message ?? 'Database error',
        code: err.code,
      });
    }

    const status = err.statusCode ?? 500;
    if (status >= 500) {
      req.log.error({ err: error }, 'Unhandled error');
      return reply.code(500).send({ error: 'Internal Server Error', message: 'Something went wrong' });
    }
    return reply.code(status).send({ error: 'Error', message: err.message ?? 'Request failed' });
  });
}
