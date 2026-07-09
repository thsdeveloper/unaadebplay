import * as v from '@repo/validation';
import type { CrudSchemas } from '../lib/crud';

export interface ResourceDef {
  table: string;
  schemas: CrudSchemas;
  /** Expose RLS-scoped reads at `/<table>` for the mobile app. */
  mobileRead: boolean;
  /** Expose RLS-scoped writes at `/<table>` (RLS enforces ownership). */
  mobileWrite?: boolean;
}

/**
 * Every table gets full admin CRUD at `/admin/<table>` (service-role).
 * `mobileRead` exposes RLS-scoped GET reads at `/<table>`; `mobileWrite` exposes
 * RLS-scoped POST/PATCH/DELETE at `/<table>` for owner-scoped mutations
 * (subscriptions, device tokens, own notifications). RLS is the guard.
 */
export const RESOURCES: ResourceDef[] = [
  { table: 'sectors', schemas: v.sectorsSchemas, mobileRead: true },
  { table: 'app_config', schemas: v.appConfigSchemas, mobileRead: true },
  { table: 'banners', schemas: v.bannersSchemas, mobileRead: true },
  { table: 'congressos', schemas: v.congressosSchemas, mobileRead: true },
  { table: 'congresso_convidados', schemas: v.congressoConvidadosSchemas, mobileRead: true },
  // Programação: CRUD admin em /admin/congresso_programacao; a leitura mobile é servida
  // pelo endpoint dedicado ordenado GET /congressos/:id/programacao (mobileRead: false).
  { table: 'congresso_programacao', schemas: v.congressoProgramacaoSchemas, mobileRead: false },
  { table: 'events', schemas: v.eventsSchemas, mobileRead: true },
  { table: 'event_subscriptions', schemas: v.eventSubscriptionsSchemas, mobileRead: true, mobileWrite: true },
  { table: 'hospedagem', schemas: v.hospedagemSchemas, mobileRead: true },
  { table: 'subscribed_hos', schemas: v.subscribedHosSchemas, mobileRead: true, mobileWrite: true },
  // news reads are served by the dedicated news module (rich embeds); generic only mounts /admin/news.
  { table: 'news', schemas: v.newsSchemas, mobileRead: false },
  { table: 'news_categories', schemas: v.newsCategoriesSchemas, mobileRead: true },
  { table: 'news_tags', schemas: v.newsTagsSchemas, mobileRead: true },
  { table: 'news_news_tags', schemas: v.newsNewsTagsSchemas, mobileRead: true },
  { table: 'news_news_gallery', schemas: v.newsNewsGallerySchemas, mobileRead: true },
  { table: 'posts', schemas: v.postsSchemas, mobileRead: true },
  { table: 'repertorios', schemas: v.repertoriosSchemas, mobileRead: true },
  { table: 'translations', schemas: v.translationsSchemas, mobileRead: true },
  { table: 'notifications', schemas: v.notificationsSchemas, mobileRead: true, mobileWrite: true },
  { table: 'device_tokens', schemas: v.deviceTokensSchemas, mobileRead: true, mobileWrite: true },
  { table: 'profiles', schemas: v.profilesSchemas, mobileRead: true },
];
