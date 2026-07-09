import { z } from 'zod';

const EnvSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  PORT: z.coerce.number().default(3333),
  HOST: z.string().default('0.0.0.0'),
  SUPABASE_URL: z.string().url(),
  SUPABASE_PUBLISHABLE_KEY: z.string().min(1),
  SUPABASE_SECRET_KEY: z.string().min(1),
  SUPABASE_JWT_ISSUER: z.string().url().optional(),
  SUPABASE_JWKS_URL: z.string().url().optional(),
  CORS_ORIGINS: z.string().default('*'),
  // Opcional: token de acesso da conta Expo — só necessário se "Enhanced Security for
  // Push Notifications" estiver ativado na conta. O emissor (lib/push.ts) usa se presente.
  EXPO_ACCESS_TOKEN: z.string().optional(),
});

export type Env = Omit<z.infer<typeof EnvSchema>, 'SUPABASE_JWT_ISSUER' | 'SUPABASE_JWKS_URL'> & {
  SUPABASE_JWT_ISSUER: string;
  SUPABASE_JWKS_URL: string;
};

/** Parse + validate process.env, deriving JWT issuer/JWKS from SUPABASE_URL when absent. */
export function loadEnv(): Env {
  const parsed = EnvSchema.safeParse(process.env);
  if (!parsed.success) {
    const issues = parsed.error.issues.map((i) => `  - ${i.path.join('.') || '(root)'}: ${i.message}`).join('\n');
    throw new Error(`Invalid environment configuration:\n${issues}`);
  }
  const env = parsed.data;
  return {
    ...env,
    SUPABASE_JWT_ISSUER: env.SUPABASE_JWT_ISSUER ?? `${env.SUPABASE_URL}/auth/v1`,
    SUPABASE_JWKS_URL: env.SUPABASE_JWKS_URL ?? `${env.SUPABASE_URL}/auth/v1/.well-known/jwks.json`,
  };
}
