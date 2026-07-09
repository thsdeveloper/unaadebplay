import type { ZodTypeAny } from 'zod';
import * as v from '@repo/validation';
import type { LucideIcon } from 'lucide-react';
import {
  Newspaper, FolderTree, Tag, Link2, Images, Image, Music, MessageSquare,
  Calendar, CalendarCheck, CalendarClock, Building2, UserPlus, BedDouble, ClipboardList,
  Users, Network, Settings, Languages, Bell, Smartphone, FileText, Cog,
} from 'lucide-react';
import type { FieldOverride } from '@/lib/fields';

export type ResourceGroup = 'Conteúdo' | 'Eventos' | 'Pessoas' | 'Sistema';

export interface ResourceDef {
  key: string;
  label: string;
  group: ResourceGroup;
  icon: LucideIcon;
  /** Columns shown in the list table. Omit to auto-derive from the data. */
  columns?: string[];
  createSchema: ZodTypeAny;
  updateSchema: ZodTypeAny;
  /** Per-field form overrides (type/label/options). Relations & images are auto-detected. */
  fields?: Record<string, FieldOverride>;
}

const status = (...vals: string[]): Record<string, FieldOverride> => ({
  status: { type: 'select', options: vals.map((val) => ({ value: val, label: val[0].toUpperCase() + val.slice(1) })) },
});

export const RESOURCE_GROUPS: ResourceGroup[] = ['Conteúdo', 'Eventos', 'Pessoas', 'Sistema'];

export const GROUP_ICONS: Record<ResourceGroup, LucideIcon> = {
  'Conteúdo': FileText,
  'Eventos': Calendar,
  'Pessoas': Users,
  'Sistema': Cog,
};

export const RESOURCES: ResourceDef[] = [
  // ----- Conteúdo -----
  { key: 'news', label: 'Notícias', group: 'Conteúdo', icon: Newspaper, columns: ['featured_image', 'title', 'status', 'slug', 'publish_date'], createSchema: v.newsSchemas.createSchema, updateSchema: v.newsSchemas.updateSchema, fields: status('draft', 'published', 'archived') },
  { key: 'news_categories', label: 'Categorias', group: 'Conteúdo', icon: FolderTree, columns: ['name', 'slug', 'sort'], createSchema: v.newsCategoriesSchemas.createSchema, updateSchema: v.newsCategoriesSchemas.updateSchema },
  { key: 'news_tags', label: 'Tags', group: 'Conteúdo', icon: Tag, columns: ['name', 'slug'], createSchema: v.newsTagsSchemas.createSchema, updateSchema: v.newsTagsSchemas.updateSchema },
  { key: 'news_news_tags', label: 'Notícia ↔ Tag', group: 'Conteúdo', icon: Link2, createSchema: v.newsNewsTagsSchemas.createSchema, updateSchema: v.newsNewsTagsSchemas.updateSchema },
  { key: 'news_news_gallery', label: 'Galeria', group: 'Conteúdo', icon: Images, columns: ['file_path', 'news_id', 'sort'], createSchema: v.newsNewsGallerySchemas.createSchema, updateSchema: v.newsNewsGallerySchemas.updateSchema },
  {
    key: 'banners',
    label: 'Banners',
    group: 'Conteúdo',
    icon: Image,
    columns: ['image', 'title', 'status', 'sort'],
    createSchema: v.bannersSchemas.createSchema,
    updateSchema: v.bannersSchemas.updateSchema,
    fields: {
      // A RLS de banners só expõe status='published' ao app — use Publicado p/ ir ao ar.
      status: { type: 'select', label: 'Status', options: [{ value: 'published', label: 'Publicado' }, { value: 'draft', label: 'Rascunho' }] },
      image: { label: 'Imagem / cartaz do banner' },
      title: { label: 'Título' },
      description: { label: 'Descrição' },
      action_label: { label: 'Texto do botão (ex.: Saiba mais)' },
      page_route: {
        type: 'select',
        label: 'Abrir ao tocar',
        options: [
          { value: '/(tabs)/(events)/event', label: 'Um evento' },
          { value: '/(tabs)/(home)/(congresso)', label: 'Um congresso' },
          { value: '/(tabs)/(events)', label: 'Lista de eventos' },
        ],
      },
      params_id: { type: 'relation', label: 'Evento de destino', relation: { resource: 'events', labelKey: 'title' } },
      screen: { hidden: true },
      sort: { label: 'Ordem' },
    },
  },
  { key: 'repertorios', label: 'Repertórios', group: 'Conteúdo', icon: Music, columns: ['image_cover', 'title', 'artist', 'status', 'sort'], createSchema: v.repertoriosSchemas.createSchema, updateSchema: v.repertoriosSchemas.updateSchema, fields: status('active', 'inactive') },
  { key: 'posts', label: 'Posts', group: 'Conteúdo', icon: MessageSquare, createSchema: v.postsSchemas.createSchema, updateSchema: v.postsSchemas.updateSchema },

  // ----- Eventos -----
  { key: 'events', label: 'Eventos', group: 'Eventos', icon: Calendar, columns: ['image_cover', 'title', 'status', 'start_date_time', 'location'], createSchema: v.eventsSchemas.createSchema, updateSchema: v.eventsSchemas.updateSchema, fields: status('active', 'inactive') },
  { key: 'event_subscriptions', label: 'Inscrições', group: 'Eventos', icon: CalendarCheck, columns: ['event_id', 'user_id', 'created_at'], createSchema: v.eventSubscriptionsSchemas.createSchema, updateSchema: v.eventSubscriptionsSchemas.updateSchema },
  {
    key: 'congressos',
    label: 'Congressos',
    group: 'Eventos',
    icon: Building2,
    columns: ['poster', 'name', 'date_start', 'date_end', 'location', 'status'],
    createSchema: v.congressosSchemas.createSchema,
    updateSchema: v.congressosSchemas.updateSchema,
    fields: {
      ...status('active', 'inactive'),
      location: { label: 'Local (endereço)' },
      location_url: { label: 'Link do mapa (opcional)' },
    },
  },
  { key: 'congresso_convidados', label: 'Convidados', group: 'Eventos', icon: UserPlus, columns: ['congresso_id', 'user_id', 'role'], createSchema: v.congressoConvidadosSchemas.createSchema, updateSchema: v.congressoConvidadosSchemas.updateSchema },
  {
    key: 'congresso_programacao',
    label: 'Programação',
    group: 'Eventos',
    icon: CalendarClock,
    columns: ['congresso_id', 'day', 'start_time', 'title', 'type', 'sort'],
    createSchema: v.congressoProgramacaoSchemas.createSchema,
    updateSchema: v.congressoProgramacaoSchemas.updateSchema,
    fields: {
      ...status('published', 'draft'),
      day: { type: 'date', label: 'Dia' },
      start_time: { label: 'Início (HH:MM)' },
      end_time: { label: 'Fim (HH:MM)' },
      sort: { label: 'Ordem' },
      type: {
        type: 'select',
        label: 'Tipo',
        options: [
          { value: 'geral', label: 'Geral' },
          { value: 'preletor', label: 'Preleção' },
          { value: 'louvor', label: 'Louvor' },
          { value: 'intervalo', label: 'Intervalo' },
        ],
      },
    },
  },
  { key: 'hospedagem', label: 'Hospedagem', group: 'Eventos', icon: BedDouble, createSchema: v.hospedagemSchemas.createSchema, updateSchema: v.hospedagemSchemas.updateSchema },
  { key: 'subscribed_hos', label: 'Inscrições Hosp.', group: 'Eventos', icon: ClipboardList, createSchema: v.subscribedHosSchemas.createSchema, updateSchema: v.subscribedHosSchemas.updateSchema },

  // ----- Pessoas -----
  { key: 'profiles', label: 'Usuários', group: 'Pessoas', icon: Users, columns: ['avatar', 'first_name', 'last_name', 'email', 'status', 'is_admin'], createSchema: v.profilesSchemas.createSchema, updateSchema: v.profilesSchemas.updateSchema, fields: status('active', 'suspended', 'pending') },
  { key: 'sectors', label: 'Setores', group: 'Pessoas', icon: Network, columns: ['name', 'status', 'sort'], createSchema: v.sectorsSchemas.createSchema, updateSchema: v.sectorsSchemas.updateSchema, fields: status('active', 'inactive') },

  // ----- Sistema -----
  { key: 'app_config', label: 'Configuração', group: 'Sistema', icon: Settings, columns: ['project_logo', 'project_name'], createSchema: v.appConfigSchemas.createSchema, updateSchema: v.appConfigSchemas.updateSchema },
  { key: 'translations', label: 'Traduções', group: 'Sistema', icon: Languages, columns: ['key', 'language', 'value'], createSchema: v.translationsSchemas.createSchema, updateSchema: v.translationsSchemas.updateSchema },
  { key: 'notifications', label: 'Notificações', group: 'Sistema', icon: Bell, columns: ['title', 'type', 'status', 'user_id'], createSchema: v.notificationsSchemas.createSchema, updateSchema: v.notificationsSchemas.updateSchema },
  { key: 'device_tokens', label: 'Device Tokens', group: 'Sistema', icon: Smartphone, columns: ['token', 'platform', 'status', 'user_id'], createSchema: v.deviceTokensSchemas.createSchema, updateSchema: v.deviceTokensSchemas.updateSchema },
];

export function getResource(key: string): ResourceDef | undefined {
  return RESOURCES.find((r) => r.key === key);
}
