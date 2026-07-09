import fp from 'fastify-plugin';
import cors from '@fastify/cors';
import helmet from '@fastify/helmet';
import rateLimit from '@fastify/rate-limit';
import sensible from '@fastify/sensible';

export default fp(
  async (app) => {
    const origins = app.env.CORS_ORIGINS;
    await app.register(cors, {
      origin: origins === '*' ? true : origins.split(',').map((o) => o.trim()),
      credentials: true,
    });
    await app.register(helmet, { contentSecurityPolicy: false });
    await app.register(sensible);
    await app.register(rateLimit, { max: 300, timeWindow: '1 minute' });
  },
  { name: 'security', dependencies: ['env'] },
);
