'use client';

import type { ReactNode } from 'react';
import { Controller, type Control, type UseFormRegister } from 'react-hook-form';
import type { FieldDef } from '@/lib/fields';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RelationSelect } from './RelationSelect';
import { ImageUpload } from './ImageUpload';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyControl = Control<any>;

export function FieldRenderer({
  field,
  control,
  register,
}: {
  field: FieldDef;
  control: AnyControl;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  register: UseFormRegister<any>;
}) {
  const { name, type, label, required } = field;

  const labelEl = (
    <Label htmlFor={name} className="text-sm">
      {label}
      {required && <span className="text-primary"> *</span>}
    </Label>
  );
  const wrap = (input: ReactNode) => (
    <div className="space-y-1.5">
      {labelEl}
      {input}
    </div>
  );

  switch (type) {
    case 'textarea':
      return wrap(<Textarea id={name} rows={4} {...register(name)} />);
    case 'json':
      return wrap(<Textarea id={name} rows={4} className="font-mono text-xs" placeholder="JSON" {...register(name)} />);
    case 'number':
      return wrap(<Input id={name} type="number" step="any" {...register(name)} />);
    case 'date':
      return wrap(<Input id={name} type="date" {...register(name)} />);
    case 'datetime':
      return wrap(<Input id={name} type="datetime-local" {...register(name)} />);
    case 'switch':
      return (
        <div className="flex items-center justify-between rounded-lg border p-3">
          <Label htmlFor={name}>{label}</Label>
          <Controller
            control={control}
            name={name}
            render={({ field: f }) => <Switch id={name} checked={!!f.value} onCheckedChange={f.onChange} />}
          />
        </div>
      );
    case 'color':
      return wrap(
        <Controller
          control={control}
          name={name}
          render={({ field: f }) => (
            <div className="flex gap-2">
              <input
                type="color"
                value={(f.value as string) || '#000000'}
                onChange={(e) => f.onChange(e.target.value)}
                className="h-9 w-12 cursor-pointer rounded-md border"
              />
              <Input value={(f.value as string) ?? ''} onChange={(e) => f.onChange(e.target.value)} placeholder="#RRGGBB" />
            </div>
          )}
        />,
      );
    case 'select':
      return wrap(
        <Controller
          control={control}
          name={name}
          render={({ field: f }) => (
            <Select value={(f.value as string) || undefined} onValueChange={f.onChange}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione…" />
              </SelectTrigger>
              <SelectContent>
                {field.options?.map((o) => (
                  <SelectItem key={o.value} value={o.value}>
                    {o.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        />,
      );
    case 'relation':
      return wrap(
        <Controller
          control={control}
          name={name}
          render={({ field: f }) => (
            <RelationSelect relation={field.relation!} value={(f.value as string) ?? ''} onChange={f.onChange} />
          )}
        />,
      );
    case 'image':
      return wrap(
        <Controller
          control={control}
          name={name}
          render={({ field: f }) => (
            <ImageUpload bucket={field.bucket} value={(f.value as string) ?? ''} onChange={f.onChange} />
          )}
        />,
      );
    default:
      return wrap(<Input id={name} {...register(name)} />);
  }
}
