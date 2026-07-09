import fp from 'fastify-plugin';
import { loadEnv, type Env } from '../config/env.js';

declare module 'fastify' {
  interface FastifyInstance {
    env: Env;
  }
}

/** Loads + validates env once and decorates it on the app. Must register first. */
export default fp(
  async (app) => {
    app.decorate('env', loadEnv());
  },
  { name: 'env' },
);
