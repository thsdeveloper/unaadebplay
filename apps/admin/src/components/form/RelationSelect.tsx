'use client';

import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import type { RelationRef } from '@/lib/fields';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export function RelationSelect({
  relation,
  value,
  onChange,
}: {
  relation: RelationRef;
  value: string;
  onChange: (v: string) => void;
}) {
  const { data, isLoading } = useQuery({
    queryKey: ['relation', relation.resource],
    queryFn: () => api.adminResource(relation.resource).list({ limit: 200, sort: relation.labelKey }),
    staleTime: 60_000,
  });
  const options = (data?.data ?? []) as Record<string, unknown>[];

  return (
    <Select value={value || undefined} onValueChange={onChange}>
      <SelectTrigger>
        <SelectValue placeholder={isLoading ? 'Carregando…' : 'Selecione…'} />
      </SelectTrigger>
      <SelectContent>
        {options.map((o) => (
          <SelectItem key={String(o.id)} value={String(o.id)}>
            {String(o[relation.labelKey] ?? o.id)}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
