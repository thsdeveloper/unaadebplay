import type { FastifyInstance } from 'fastify';
import healthRoutes from './health/routes';
import { registerResource } from '../lib/crud';
import { RESOURCES } from './resources';
import specializedRoutes from './specialized';
import storageRoutes from './storage';
import newsRoutes from './news';

export async function registerRoutes(app: FastifyInstance) {
  await app.register(healthRoutes);
  for (const r of RESOURCES) {
    registerResource(app, {
      table: r.table,
      mobileRead: r.mobileRead,
      mobileWrite: r.mobileWrite,
      ...r.schemas,
    });
  }

  await app.register(newsRoutes);
  await app.register(specializedRoutes);
  await app.register(storageRoutes);
}
