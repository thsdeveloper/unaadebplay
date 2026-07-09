'use client';

import type { ColumnDef } from '@tanstack/react-table';
import { format } from 'date-fns';
import { MoreHorizontal, Pencil, Trash2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { mediaUrl } from '@/lib/media';
import { humanize } from '@/lib/utils';

export type Row = Record<string, unknown>;

const IMAGE_RE = /(image|avatar|poster|logo|cover|photo|thumbnail|banner)/i;
const DATE_RE = /(date|_at$|birthdate)/i;

function statusVariant(value: string): 'success' | 'secondary' | 'warning' | 'outline' {
  const s = value.toLowerCase();
  if (['active', 'published', 'approved', 'confirmed', 'ativo'].includes(s)) return 'success';
  if (['pending', 'draft', 'pendente'].includes(s)) return 'warning';
  if (['inactive', 'suspended', 'archived', 'inativo'].includes(s)) return 'secondary';
  return 'outline';
}

function Cell({ col, value }: { col: string; value: unknown }) {
  if (value === null || value === undefined || value === '') return <span className="text-muted-foreground">—</span>;
  if (IMAGE_RE.test(col) && typeof value === 'string') {
    const url = mediaUrl(value);
    return url ? (
      // eslint-disable-next-line @next/next/no-img-element
      <img src={url} alt="" className="h-9 w-9 rounded-md border object-cover" />
    ) : (
      <span className="text-muted-foreground">—</span>
    );
  }
  if (typeof value === 'boolean') return <Badge variant={value ? 'success' : 'secondary'}>{value ? 'Sim' : 'Não'}</Badge>;
  if (col === 'status' && typeof value === 'string') return <Badge variant={statusVariant(value)}>{value}</Badge>;
  if (DATE_RE.test(col) && typeof value === 'string') {
    try {
      return <span className="whitespace-nowrap text-sm">{format(new Date(value), 'dd/MM/yyyy')}</span>;
    } catch {
      return <span>{value}</span>;
    }
  }
  if (typeof value === 'object') return <span className="text-xs text-muted-foreground">{JSON.stringify(value).slice(0, 40)}…</span>;
  return <span className="block max-w-[280px] truncate">{String(value)}</span>;
}

export function buildColumns(
  columns: string[],
  handlers: { onEdit: (id: string) => void; onDelete: (id: string) => void },
): ColumnDef<Row>[] {
  const select: ColumnDef<Row> = {
    id: 'select',
    header: ({ table }) => (
      <Checkbox
        checked={table.getIsAllPageRowsSelected() || (table.getIsSomePageRowsSelected() && 'indeterminate')}
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        aria-label="Selecionar todos"
      />
    ),
    cell: ({ row }) => (
      <Checkbox checked={row.getIsSelected()} onCheckedChange={(value) => row.toggleSelected(!!value)} aria-label="Selecionar linha" />
    ),
    enableSorting: false,
  };

  const dataCols: ColumnDef<Row>[] = columns.map((col) => ({
    accessorKey: col,
    header: humanize(col),
    cell: ({ getValue }) => <Cell col={col} value={getValue()} />,
  }));

  const actions: ColumnDef<Row> = {
    id: 'actions',
    enableSorting: false,
    cell: ({ row }) => {
      const id = String(row.original.id);
      return (
        <div className="flex justify-end">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => handlers.onEdit(id)}>
                <Pencil className="mr-2 h-4 w-4" /> Editar
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handlers.onDelete(id)} className="text-destructive focus:text-destructive">
                <Trash2 className="mr-2 h-4 w-4" /> Excluir
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      );
    },
  };

  return [select, ...dataCols, actions];
}
