# UNAADEB Play — Monorepo

Monorepo (pnpm + Turborepo) para a plataforma UNAADEB Play.

## Apps & packages

```
apps/
  mobile/   App Expo (React Native) — cliente final
  api/      Gateway Fastify — única porta de dados (valida JWT do Supabase, aplica RLS/service-role)
  admin/    Dashboard Next.js — administração de todos os recursos
packages/
  db-types/     Tipos gerados do Supabase (Database)
  types/        Interfaces de domínio compartilhadas
  validation/   Schemas zod (contratos da API)
  api-client/   SDK tipado para consumir a API
  config/       Presets de tsconfig/eslint/prettier
```

## Arquitetura

- **Identidade:** Supabase Auth (mobile via SecureStore + biometria; admin via `@supabase/ssr`). O JWT resultante é enviado à API como `Authorization: Bearer`.
- **Dados:** todo CRUD passa pela API Fastify. A API usa um client Supabase *user-scoped* por request (respeita RLS) e um client *service-role* para operações de admin.

## Comandos

```bash
pnpm install                # instala o workspace inteiro (node-linker=hoisted)
pnpm dev                    # turbo: sobe tudo em paralelo
pnpm --filter mobile start  # Expo dev server
pnpm --filter api dev       # Fastify
pnpm --filter admin dev     # Next.js
pnpm typecheck              # turbo typecheck em todos os pacotes
pnpm type-gen               # regenera @repo/db-types a partir do Supabase
```

Requer **Node 20+** e **pnpm 9+**.
