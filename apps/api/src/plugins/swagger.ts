import fp from 'fastify-plugin';
import swagger from '@fastify/swagger';
import swaggerUi from '@fastify/swagger-ui';
import { jsonSchemaTransform } from 'fastify-type-provider-zod';

export default fp(
  async (app) => {
    await app.register(swagger, {
      openapi: {
        info: {
          title: 'UNAADEB Play API',
          version: '1.0.0',
          description: 'Gateway Fastify — dados do app mobile + admin (valida JWT do Supabase, aplica RLS/service-role).',
        },
        components: {
          securitySchemes: {
            bearerAuth: { type: 'http', scheme: 'bearer', bearerFormat: 'JWT' },
          },
        },
        security: [{ bearerAuth: [] }],
      },
      transform: jsonSchemaTransform,
    });
    await app.register(swaggerUi, { routePrefix: '/docs' });
  },
  { name: 'swagger', dependencies: ['env'] },
);
