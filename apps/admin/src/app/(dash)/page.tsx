'use client';

import Link from 'next/link';
import { useQueries } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { RESOURCES, RESOURCE_GROUPS } from '@/resources/registry';
import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

const METRIC_KEYS = ['news', 'events', 'congressos', 'profiles', 'sectors', 'banners', 'repertorios', 'notifications'];

export default function Dashboard() {
  const metrics = RESOURCES.filter((r) => METRIC_KEYS.includes(r.key));
  const results = useQueries({
    queries: metrics.map((r) => ({
      queryKey: [r.key, 'count'],
      queryFn: () => api.adminResource(r.key).list({ limit: 1 }),
      staleTime: 30_000,
    })),
  });

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <p className="text-sm text-muted-foreground">Visão geral do UNAADEB Play</p>
      </div>

      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        {metrics.map((r, i) => {
          const Icon = r.icon;
          const q = results[i];
          const total = q?.data?.meta.total;
          return (
            <Link key={r.key} href={`/${r.key}`}>
              <Card className="p-4 transition hover:border-primary/40 hover:shadow-sm">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">{r.label}</span>
                  <div className="flex h-8 w-8 items-center justify-center rounded-md bg-primary/10 text-primary">
                    <Icon className="h-4 w-4" />
                  </div>
                </div>
                <div className="mt-3 text-3xl font-bold tracking-tight">
                  {q?.isLoading ? <Skeleton className="h-8 w-12" /> : (total ?? '—')}
                </div>
              </Card>
            </Link>
          );
        })}
      </div>

      <div>
        <h2 className="mb-3 text-sm font-semibold text-muted-foreground">Todos os recursos</h2>
        <div className="space-y-4">
          {RESOURCE_GROUPS.map((g) => (
            <div key={g}>
              <div className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground/70">{g}</div>
              <div className="grid grid-cols-2 gap-2 md:grid-cols-4">
                {RESOURCES.filter((r) => r.group === g).map((r) => {
                  const Icon = r.icon;
                  return (
                    <Link
                      key={r.key}
                      href={`/${r.key}`}
                      className="flex items-center gap-2 rounded-lg border bg-card p-3 text-sm transition hover:border-primary/40 hover:bg-accent"
                    >
                      <Icon className="h-4 w-4 text-muted-foreground" />
                      {r.label}
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
