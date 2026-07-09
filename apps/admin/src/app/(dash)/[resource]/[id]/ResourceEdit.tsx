'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';
import { getResource } from '@/resources/registry';
import { ResourceForm } from '@/components/form/ResourceForm';
import { api } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

export function ResourceEdit({ resourceKey, id }: { resourceKey: string; id: string }) {
  const def = getResource(resourceKey);
  const router = useRouter();
  const res = api.adminResource(resourceKey);
  const { data, isLoading, error } = useQuery({ queryKey: [resourceKey, 'detail', id], queryFn: () => res.get(id) });
  const [submitting, setSubmitting] = useState(false);

  if (!def) return null;

  async function onSubmit(payload: Record<string, unknown>) {
    setSubmitting(true);
    try {
      await res.update(id, payload);
      toast.success(`${def!.label} atualizado`);
      router.push(`/${resourceKey}`);
      router.refresh();
    } catch (e) {
      toast.error((e as Error).message);
      setSubmitting(false);
    }
  }

  const defaults =
    data && typeof data === 'object'
      ? Object.fromEntries(Object.entries(data as Record<string, unknown>).map(([k, v]) => [k, v ?? '']))
      : {};

  return (
    <div className="mx-auto max-w-3xl space-y-4">
      <Button asChild variant="ghost" size="sm">
        <Link href={`/${resourceKey}`}>
          <ArrowLeft className="mr-1 h-4 w-4" /> {def.label}
        </Link>
      </Button>
      <Card>
        <CardHeader>
          <CardTitle>Editar — {def.label}</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-4">
              {Array.from({ length: 6 }).map((_, i) => (
                <Skeleton key={i} className="h-10 w-full" />
              ))}
            </div>
          ) : error ? (
            <p className="py-6 text-sm text-destructive">{(error as Error).message}</p>
          ) : (
            <ResourceForm
              schema={def.updateSchema}
              overrides={def.fields}
              defaultValues={defaults}
              onSubmit={onSubmit}
              submitting={submitting}
              submitLabel="Salvar alterações"
              onCancel={() => router.push(`/${resourceKey}`)}
            />
          )}
        </CardContent>
      </Card>
    </div>
  );
}
