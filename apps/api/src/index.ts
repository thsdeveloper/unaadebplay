import 'dotenv/config';
import { buildServer } from './server';

async function main() {
  const app = await buildServer();
  await app.ready();
  await app.listen({ port: app.env.PORT, host: app.env.HOST });
  app.log.info(`UNAADEB Play API on http://${app.env.HOST}:${app.env.PORT} — docs at /docs`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
