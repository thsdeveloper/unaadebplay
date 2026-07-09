import type { FastifyInstance } from 'fastify';
import type { ZodTypeProvider } from 'fastify-type-provider-zod';
import { z } from 'zod';
import { listQuerySchema, idParamSchema, listResponseSchema } from '@repo/validation';
import { listItems, getItemById, createItem, updateItem, deleteItem } from './items';

export interface CrudSchemas {
  rowSchema: z.ZodTypeAny;
  createSchema: z.ZodTypeAny;
  updateSchema: z.ZodTypeAny;
}

export interface ResourceOptions extends CrudSchemas {
  table: string;
  /** Also expose RLS-scoped GET list/detail at `/<table>` for the mobile app. */
  mobileRead?: boolean;
  /** Also expose RLS-scoped POST/PATCH/DELETE at `/<table>` (RLS enforces ownership). */
  mobileWrite?: boolean;
  tags?: string[];
}

/**
 * Mounts a resource's HTTP surface:
 *   Admin (requireAdmin, service-role — bypasses RLS, full visibility + writes):
 *     GET/POST /admin/:table · GET/PATCH/DELETE /admin/:table/:id
 *   Mobile (requireAuth, per-request user client — RLS enforced) when `mobileRead`:
 *     GET /:table · GET /:table/:id
 */
export function registerResource(app: FastifyInstance, opts: ResourceOptions) {
  const t = app.withTypeProvider<ZodTypeProvider>();
  const { table, rowSchema, createSchema, updateSchema } = opts;
  const tags = opts.tags ?? [table];
  const adminTags = [...tags, 'admin'];
  const listResp = listResponseSchema(rowSchema);
  const admin = `/admin/${table}`;

  // ---------- Admin CRUD (service-role) ----------
  t.get(
    admin,
    {
      preValidation: app.requireAdmin,
      schema: { tags: adminTags, summary: `List ${table} (admin)`, querystring: listQuerySchema, response: { 200: listResp } },
    },
    async (req) => {
      const { data, count } = await listItems(app.supabaseAdmin, table, req.query);
      return { data, meta: { total: count } };
    },
  );

  t.get(
    `${admin}/:id`,
    {
      preValidation: app.requireAdmin,
      schema: { tags: adminTags, summary: `Get ${table} (admin)`, params: idParamSchema, response: { 200: rowSchema } },
    },
    async (req) => {
      const data = await getItemById(app.supabaseAdmin, table, req.params.id);
      if (!data) throw app.httpErrors.notFound(`${table} not found`);
      return data;
    },
  );

  t.post(
    admin,
    {
      preValidation: app.requireAdmin,
      schema: { tags: adminTags, summary: `Create ${table}`, body: createSchema, response: { 201: rowSchema } },
    },
    async (req, reply) => {
      const data = await createItem(app.supabaseAdmin, table, req.body);
      reply.code(201);
      return data;
    },
  );

  t.patch(
    `${admin}/:id`,
    {
      preValidation: app.requireAdmin,
      schema: { tags: adminTags, summary: `Update ${table}`, params: idParamSchema, body: updateSchema, response: { 200: rowSchema } },
    },
    async (req) => updateItem(app.supabaseAdmin, table, req.params.id, req.body),
  );

  t.delete(
    `${admin}/:id`,
    {
      preValidation: app.requireAdmin,
      schema: { tags: adminTags, summary: `Delete ${table}`, params: idParamSchema, response: { 204: z.null() } },
    },
    async (req, reply) => {
      await deleteItem(app.supabaseAdmin, table, req.params.id);
      reply.code(204);
      return null;
    },
  );

  // ---------- Mobile reads (RLS) ----------
  if (opts.mobileRead) {
    t.get(
      `/${table}`,
      {
        preValidation: app.requireAuth,
        schema: { tags, summary: `List ${table}`, querystring: listQuerySchema, response: { 200: listResp } },
      },
      async (req) => {
        const { data, count } = await listItems(req.supabaseUser, table, req.query);
        return { data, meta: { total: count } };
      },
    );

    t.get(
      `/${table}/:id`,
      {
        preValidation: app.requireAuth,
        schema: { tags, summary: `Get ${table} by id`, params: idParamSchema, response: { 200: rowSchema } },
      },
      async (req) => {
        const data = await getItemById(req.supabaseUser, table, req.params.id);
        if (!data) throw app.httpErrors.notFound(`${table} not found`);
        return data;
      },
    );
  }

  // ---------- Mobile writes (RLS enforces ownership) ----------
  if (opts.mobileWrite) {
    t.post(
      `/${table}`,
      {
        preValidation: app.requireAuth,
        schema: { tags, summary: `Create ${table} (self)`, body: createSchema, response: { 201: rowSchema } },
      },
      async (req, reply) => {
        const data = await createItem(req.supabaseUser, table, req.body);
        reply.code(201);
        return data;
      },
    );

    t.patch(
      `/${table}/:id`,
      {
        preValidation: app.requireAuth,
        schema: { tags, summary: `Update ${table} (self)`, params: idParamSchema, body: updateSchema, response: { 200: rowSchema } },
      },
      async (req) => updateItem(req.supabaseUser, table, req.params.id, req.body),
    );

    t.delete(
      `/${table}/:id`,
      {
        preValidation: app.requireAuth,
        schema: { tags, summary: `Delete ${table} (self)`, params: idParamSchema, response: { 204: z.null() } },
      },
      async (req, reply) => {
        await deleteItem(req.supabaseUser, table, req.params.id);
        reply.code(204);
        return null;
      },
    );
  }
}
