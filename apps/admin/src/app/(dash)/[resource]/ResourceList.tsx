'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { RowSelectionState, SortingState } from '@tanstack/react-table';
import { Plus, Search, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { api } from '@/lib/api';
import { getResource } from '@/resources/registry';
import { DataTable } from '@/components/data-table/DataTable';
import { buildColumns, type Row } from '@/components/data-table/columns';
import { ConfirmDialog } from '@/components/ConfirmDialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

const PAGE_SIZE = 20;

export function ResourceList({ resourceKey }: { resourceKey: string }) {
  const def = getResource(resourceKey);
  const router = useRouter();
  const qc = useQueryClient();
  const res = api.adminResource(resourceKey);

  const [page, setPage] = useState(1);
  const [sorting, setSorting] = useState<SortingState>([]);
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({});
  const [search, setSearch] = useState('');
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [confirmBulk, setConfirmBulk] = useState(false);

  const sortParam = sorting[0] ? `${sorting[0].desc ? '-' : ''}${sorting[0].id}` : '-id';

  const { data, isLoading, isFetching } = useQuery({
    queryKey: [resourceKey, 'list', page, sortParam],
    queryFn: () => res.list({ limit: PAGE_SIZE, offset: (page - 1) * PAGE_SIZE, sort: sortParam }),
    placeholderData: (prev) => prev,
  });

  const del = useMutation({
    mutationFn: (id: string) => res.remove(id),
    onSuccess: () => {
      toast.success('Registro excluído');
      qc.invalidateQueries({ queryKey: [resourceKey] });
    },
    onError: (e) => toast.error((e as Error).message),
    onSettled: () => setDeleteId(null),
  });

  const bulkDel = useMutation({
    mutationFn: (ids: string[]) => Promise.all(ids.map((id) => res.remove(id))),
    onSuccess: (_r, ids) => {
      toast.success(`${ids.length} registros excluídos`);
      setRowSelection({});
      qc.invalidateQueries({ queryKey: [resourceKey] });
    },
    onError: (e) => toast.error((e as Error).message),
    onSettled: () => setConfirmBulk(false),
  });

  const rows = (data?.data ?? []) as Row[];
  const total = data?.meta.total ?? 0;
  const pages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  const filtered = useMemo(() => {
    if (!search.trim()) return rows;
    const q = search.toLowerCase();
    return rows.filter((r) => Object.values(r).some((v) => v != null && String(v).toLowerCase().includes(q)));
  }, [rows, search]);

  const columns = useMemo(
    () =>
      buildColumns(def?.columns ?? (rows[0] ? Object.keys(rows[0]).filter((k) => k !== 'id').slice(0, 6) : []), {
        onEdit: (id) => router.push(`/${resourceKey}/${id}`),
        onDelete: (id) => setDeleteId(id),
      }),
    [def, rows, resourceKey, router],
  );

  const selectedIds = Object.keys(rowSelection).filter((k) => rowSelection[k]);

  if (!def) return null;
  const Icon = def.icon;

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <Icon className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-xl font-semibold">{def.label}</h1>
            <p className="text-sm text-muted-foreground">
              {total} {total === 1 ? 'registro' : 'registros'}
            </p>
          </div>
        </div>
        <Button asChild>
          <Link href={`/${resourceKey}/new`}>
            <Plus className="mr-1.5 h-4 w-4" /> Novo
          </Link>
        </Button>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <div className="relative max-w-xs flex-1">
          <Search className="absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input placeholder="Buscar nesta página…" value={search} onChange={(e) => setSearch(e.target.value)} className="pl-8" />
        </div>
        {selectedIds.length > 0 && (
          <Button variant="destructive" size="sm" onClick={() => setConfirmBulk(true)}>
            <Trash2 className="mr-1.5 h-4 w-4" /> Excluir {selectedIds.length}
          </Button>
        )}
        {isFetching && !isLoading && <span className="text-xs text-muted-foreground">Atualizando…</span>}
      </div>

      <DataTable
        columns={columns}
        data={filtered}
        loading={isLoading}
        sorting={sorting}
        onSortingChange={setSorting}
        rowSelection={rowSelection}
        onRowSelectionChange={setRowSelection}
        getRowId={(r) => String((r as Row).id)}
        emptyMessage={`Nenhum registro em ${def.label}.`}
      />

      <div className="flex items-center justify-between text-sm text-muted-foreground">
        <span>
          Página {page} de {pages}
        </span>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>
            Anterior
          </Button>
          <Button variant="outline" size="sm" disabled={page >= pages} onClick={() => setPage((p) => p + 1)}>
            Próxima
          </Button>
        </div>
      </div>

      <ConfirmDialog
        open={!!deleteId}
        onOpenChange={(o) => !o && setDeleteId(null)}
        title="Excluir registro?"
        description="Essa ação não pode ser desfeita."
        loading={del.isPending}
        onConfirm={() => deleteId && del.mutate(deleteId)}
      />
      <ConfirmDialog
        open={confirmBulk}
        onOpenChange={setConfirmBulk}
        title={`Excluir ${selectedIds.length} registros?`}
        description="Essa ação não pode ser desfeita."
        loading={bulkDel.isPending}
        onConfirm={() => bulkDel.mutate(selectedIds)}
      />
    </div>
  );
}
