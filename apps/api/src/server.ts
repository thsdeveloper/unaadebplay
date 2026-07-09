import Fastify from 'fastify';
import { serializerCompiler, validatorCompiler, type ZodTypeProvider } from 'fastify-type-provider-zod';
import envPlugin from './plugins/env';
import securityPlugin from './plugins/security';
import swaggerPlugin from './plugins/swagger';
import supabasePlugin from './plugins/supabase';
import authPlugin from './plugins/auth';
import { registerErrorHandler } from './lib/errors';
import { registerRoutes } from './modules';

export async function buildServer() {
  const app = Fastify({
    logger:
      process.env.NODE_ENV === 'production'
        ? true
        : { transport: { target: 'pino-pretty', options: { translateTime: 'HH:MM:ss', ignore: 'pid,hostname' } } },
  }).withTypeProvider<ZodTypeProvider>();

  // Zod validation + serialization for every route.
  app.setValidatorCompiler(validatorCompiler);
  app.setSerializerCompiler(serializerCompiler);
  registerErrorHandler(app);

  // Order matters: env first (others read app.env during their boot), then the rest.
  await app.register(envPlugin);
  await app.register(securityPlugin);
  await app.register(swaggerPlugin);
  await app.register(supabasePlugin);
  await app.register(authPlugin);
  await app.register(registerRoutes);

  return app;
}
