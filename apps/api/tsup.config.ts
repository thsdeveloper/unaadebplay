import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['src/index.ts'],
  format: ['esm'],
  target: 'node20',
  clean: true,
  sourcemap: true,
  // Bundle the raw-TS workspace packages into the output.
  noExternal: [/^@repo\//],
});
