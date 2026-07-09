'use client';

import { useMemo } from 'react';
import { useForm } from 'react-hook-form';
import type { ZodTypeAny } from 'zod';
import { buildFields, cleanValues, type FieldOverride } from '@/lib/fields';
import { FieldRenderer } from './FieldRenderer';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface ResourceFormProps {
  schema: ZodTypeAny;
  overrides?: Record<string, FieldOverride>;
  defaultValues?: Record<string, unknown>;
  onSubmit: (data: Record<string, unknown>) => void | Promise<void>;
  submitting?: boolean;
  submitLabel?: string;
  onCancel?: () => void;
}

export function ResourceForm({
  schema,
  overrides,
  defaultValues,
  onSubmit,
  submitting,
  submitLabel = 'Salvar',
  onCancel,
}: ResourceFormProps) {
  const fields = useMemo(() => buildFields(schema, overrides ?? {}), [schema, overrides]);
  const { control, register, handleSubmit } = useForm({ defaultValues: defaultValues ?? {} });

  return (
    <form onSubmit={handleSubmit((data) => onSubmit(cleanValues(fields, data)))} className="space-y-6">
      <div className="grid grid-cols-1 gap-x-6 gap-y-5 md:grid-cols-2">
        {fields.map((f) => (
          <div key={f.name} className={cn(['textarea', 'json', 'image'].includes(f.type) && 'md:col-span-2')}>
            <FieldRenderer field={f} control={control} register={register} />
          </div>
        ))}
      </div>
      <div className="flex gap-2 border-t pt-4">
        <Button type="submit" disabled={submitting}>
          {submitting ? 'Salvando…' : submitLabel}
        </Button>
        {onCancel && (
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancelar
          </Button>
        )}
      </div>
    </form>
  );
}
