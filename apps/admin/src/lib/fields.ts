import type { ZodTypeAny } from 'zod';
import { humanize } from '@/lib/utils';

export type FieldType =
  | 'text'
  | 'textarea'
  | 'number'
  | 'switch'
  | 'date'
  | 'datetime'
  | 'select'
  | 'relation'
  | 'image'
  | 'json'
  | 'color';

export interface RelationRef {
  resource: string;
  labelKey: string;
}

export interface FieldOption {
  value: string;
  label: string;
}

export interface FieldOverride {
  type?: FieldType;
  label?: string;
  options?: FieldOption[];
  relation?: RelationRef;
  bucket?: 'images' | 'avatars' | 'audio';
  hidden?: boolean;
}

export interface FieldDef {
  name: string;
  label: string;
  type: FieldType;
  required: boolean;
  options?: FieldOption[];
  relation?: RelationRef;
  bucket?: 'images' | 'avatars' | 'audio';
}

/** Foreign-key columns → the resource + label column to resolve them against. */
export const RELATIONS: Record<string, RelationRef> = {
  sector: { resource: 'sectors', labelKey: 'name' },
  category: { resource: 'news_categories', labelKey: 'name' },
  news_id: { resource: 'news', labelKey: 'title' },
  news_tags_id: { resource: 'news_tags', labelKey: 'name' },
  congresso_id: { resource: 'congressos', labelKey: 'name' },
  event_id: { resource: 'events', labelKey: 'title' },
  user_id: { resource: 'profiles', labelKey: 'email' },
  created_by: { resource: 'profiles', labelKey: 'email' },
  updated_by: { resource: 'profiles', labelKey: 'email' },
  author: { resource: 'profiles', labelKey: 'email' },
  member: { resource: 'profiles', labelKey: 'email' },
};

const IMAGE_RE = /(image|avatar|poster|logo|cover|photo|thumbnail|banner)/i;
const TEXTAREA_RE = /(content|description|excerpt|body|meta_description|bio|message|observ)/i;
const COLOR_RE = /color/i;
const DATE_RE = /(birthdate|_date$|date_start|date_end|publish_date)/i;
const DATETIME_RE = /(start_date_time|end_date_time|_at$|datetime)/i;

function unwrap(t: any): { base: any; optional: boolean } {
  let optional = false;
  let cur = t;
  while (cur?._def?.typeName === 'ZodEffects') cur = cur._def.schema;
  while (cur?._def) {
    const tn = cur._def.typeName;
    if (tn === 'ZodOptional' || tn === 'ZodNullable') {
      optional = true;
      cur = cur._def.innerType;
    } else if (tn === 'ZodDefault') {
      cur = cur._def.innerType;
    } else break;
  }
  return { base: cur, optional };
}

function detectType(name: string, base: any): FieldType {
  const tn = base?._def?.typeName;
  if (tn === 'ZodBoolean') return 'switch';
  if (RELATIONS[name]) return 'relation';
  if (IMAGE_RE.test(name)) return 'image';
  if (COLOR_RE.test(name)) return 'color';
  if (DATETIME_RE.test(name)) return 'datetime';
  if (DATE_RE.test(name)) return 'date';
  if (tn === 'ZodNumber') return 'number';
  if (tn === 'ZodArray' || tn === 'ZodAny' || tn === 'ZodRecord' || tn === 'ZodObject') return 'json';
  if (TEXTAREA_RE.test(name)) return 'textarea';
  return 'text';
}

/** Build renderable form fields from a Zod object schema + optional per-field overrides. */
export function buildFields(schema: ZodTypeAny, overrides: Record<string, FieldOverride> = {}): FieldDef[] {
  let s: any = schema;
  while (s?._def?.typeName === 'ZodEffects') s = s._def.schema;
  if (s?._def?.typeName !== 'ZodObject') return [];
  const shape = s.shape as Record<string, ZodTypeAny>;

  return Object.entries(shape)
    .map(([name, zt]) => {
      const ov = overrides[name] ?? {};
      if (ov.hidden) return null;
      const { base, optional } = unwrap(zt);
      const type = ov.type ?? detectType(name, base);
      const def: FieldDef = {
        name,
        label: ov.label ?? humanize(name),
        type,
        required: !optional,
        options: ov.options,
        relation: ov.relation ?? (type === 'relation' ? RELATIONS[name] : undefined),
        bucket: ov.bucket ?? (name.includes('avatar') ? 'avatars' : 'images'),
      };
      return def;
    })
    .filter((f): f is FieldDef => f !== null);
}

/** Coerce raw form values into an API payload, dropping empty optionals. */
export function cleanValues(fields: FieldDef[], raw: Record<string, unknown>): Record<string, unknown> {
  const out: Record<string, unknown> = {};
  for (const f of fields) {
    const value = raw[f.name];
    const isEmpty = value === '' || value === undefined || value === null;
    if (isEmpty && f.type !== 'switch') continue;
    switch (f.type) {
      case 'number': {
        const n = Number(value);
        if (!Number.isNaN(n)) out[f.name] = n;
        break;
      }
      case 'switch':
        out[f.name] = Boolean(value);
        break;
      case 'json':
        try {
          out[f.name] = typeof value === 'string' ? JSON.parse(value) : value;
        } catch {
          out[f.name] = value;
        }
        break;
      default:
        out[f.name] = value;
    }
  }
  return out;
}
