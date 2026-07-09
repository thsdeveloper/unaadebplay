'use client';

import {
  flexRender,
  getCoreRowModel,
  useReactTable,
  type ColumnDef,
  type SortingState,
  type RowSelectionState,
  type OnChangeFn,
} from '@tanstack/react-table';
import { ArrowDown, ArrowUp, ArrowUpDown } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';

interface DataTableProps<T> {
  columns: ColumnDef<T>[];
  data: T[];
  loading?: boolean;
  sorting: SortingState;
  onSortingChange: OnChangeFn<SortingState>;
  rowSelection: RowSelectionState;
  onRowSelectionChange: OnChangeFn<RowSelectionState>;
  getRowId?: (row: T) => string;
  emptyMessage?: string;
}

export function DataTable<T>({
  columns,
  data,
  loading,
  sorting,
  onSortingChange,
  rowSelection,
  onRowSelectionChange,
  getRowId,
  emptyMessage,
}: DataTableProps<T>) {
  const table = useReactTable({
    data,
    columns,
    state: { sorting, rowSelection },
    onSortingChange,
    onRowSelectionChange,
    getCoreRowModel: getCoreRowModel(),
    manualSorting: true,
    enableRowSelection: true,
    getRowId,
  });

  return (
    <div className="overflow-hidden rounded-lg border bg-card">
      <Table>
        <TableHeader>
          {table.getHeaderGroups().map((hg) => (
            <TableRow key={hg.id} className="hover:bg-transparent">
              {hg.headers.map((h) => {
                const canSort = h.column.getCanSort();
                const sorted = h.column.getIsSorted();
                return (
                  <TableHead
                    key={h.id}
                    className={cn('whitespace-nowrap', canSort && 'cursor-pointer select-none')}
                    onClick={canSort ? h.column.getToggleSortingHandler() : undefined}
                  >
                    <div className="flex items-center gap-1.5">
                      {flexRender(h.column.columnDef.header, h.getContext())}
                      {canSort &&
                        (sorted === 'asc' ? (
                          <ArrowUp className="h-3.5 w-3.5" />
                        ) : sorted === 'desc' ? (
                          <ArrowDown className="h-3.5 w-3.5" />
                        ) : (
                          <ArrowUpDown className="h-3.5 w-3.5 opacity-30" />
                        ))}
                    </div>
                  </TableHead>
                );
              })}
            </TableRow>
          ))}
        </TableHeader>
        <TableBody>
          {loading ? (
            Array.from({ length: 8 }).map((_, i) => (
              <TableRow key={i}>
                {columns.map((_, j) => (
                  <TableCell key={j}>
                    <Skeleton className="h-5 w-full" />
                  </TableCell>
                ))}
              </TableRow>
            ))
          ) : table.getRowModel().rows.length ? (
            table.getRowModel().rows.map((row) => (
              <TableRow key={row.id} data-state={row.getIsSelected() ? 'selected' : undefined}>
                {row.getVisibleCells().map((cell) => (
                  <TableCell key={cell.id}>{flexRender(cell.column.columnDef.cell, cell.getContext())}</TableCell>
                ))}
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={columns.length} className="h-32 text-center text-sm text-muted-foreground">
                {emptyMessage ?? 'Nenhum registro encontrado.'}
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}
