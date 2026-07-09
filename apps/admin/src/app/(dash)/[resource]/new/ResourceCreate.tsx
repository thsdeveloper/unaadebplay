'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';
import { getResource } from '@/resources/registry';
import { ResourceForm } from '@/components/form/ResourceForm';
import { api } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export function ResourceCreate({ resourceKey }: { resourceKey: string }) {
  const def = getResource(resourceKey);
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);

  if (!def) return null;

  async function onSubmit(data: Record<string, unknown>) {
    setSubmitting(true);
    try {
      await api.adminResource(resourceKey).create(data);
      toast.success(`${def!.label} criado com sucesso`);
      router.push(`/${resourceKey}`);
      router.refresh();
    } catch (e) {
      toast.error((e as Error).message);
      setSubmitting(false);
    }
  }

  return (
    <div className="mx-auto max-w-3xl space-y-4">
      <Button asChild variant="ghost" size="sm">
        <Link href={`/${resourceKey}`}>
          <ArrowLeft className="mr-1 h-4 w-4" /> {def.label}
        </Link>
      </Button>
      <Card>
        <CardHeader>
          <CardTitle>Novo — {def.label}</CardTitle>
        </CardHeader>
        <CardContent>
          <ResourceForm
            schema={def.createSchema}
            overrides={def.fields}
            onSubmit={onSubmit}
            submitting={submitting}
            submitLabel="Criar"
            onCancel={() => router.push(`/${resourceKey}`)}
          />
        </CardContent>
      </Card>
    </div>
  );
}
