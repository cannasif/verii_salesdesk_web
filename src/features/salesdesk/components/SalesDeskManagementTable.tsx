import { type ReactElement, type ReactNode, useEffect, useMemo, useState } from 'react';
import { Edit2, Trash2 } from 'lucide-react';
import { DataTableGrid, type DataTableGridColumn } from '@/components/shared';
import { Button } from '@/components/ui/button';
import { arraysEqual } from '@/lib/utils';
import type { SalesDeskColumn } from './SalesDeskListLayout';

interface SalesDeskManagementTableProps<T extends { id: number }> {
  columns: SalesDeskColumn<T>[];
  rows: T[];
  isLoading?: boolean;
  isError?: boolean;
  errorText?: string;
  emptyText?: string;
  minTableWidthClassName?: string;
  onEdit?: (row: T) => void;
  onDelete?: (row: T) => void;
  pageSize: number;
  pageSizeOptions: readonly number[];
  onPageSizeChange: (size: number) => void;
  pageNumber: number;
  totalPages: number;
  hasPreviousPage?: boolean;
  hasNextPage?: boolean;
  onPageChange: (page: number) => void;
  totalCount: number;
  onColumnOrderChange?: (order: string[]) => void;
}

export function SalesDeskManagementTable<T extends { id: number }>({
  columns,
  rows,
  isLoading = false,
  isError = false,
  errorText = 'Liste yuklenemedi.',
  emptyText = 'Kayit bulunamadi.',
  minTableWidthClassName = 'min-w-[800px] lg:min-w-[1000px]',
  onEdit,
  onDelete,
  pageSize,
  pageSizeOptions,
  onPageSizeChange,
  pageNumber,
  totalPages,
  hasPreviousPage,
  hasNextPage,
  onPageChange,
  totalCount,
  onColumnOrderChange,
}: SalesDeskManagementTableProps<T>): ReactElement {
  const defaultOrder = useMemo(() => columns.map((column) => column.key), [columns]);
  const [internalColumnOrder, setInternalColumnOrder] = useState<string[]>(defaultOrder);

  useEffect(() => {
    setInternalColumnOrder((current) => (arraysEqual(current, defaultOrder) ? current : defaultOrder));
  }, [defaultOrder]);

  const orderedColumns = onColumnOrderChange
    ? columns
    : internalColumnOrder
        .map((key) => columns.find((column) => column.key === key))
        .filter((column): column is SalesDeskColumn<T> => column != null);

  const gridColumns: DataTableGridColumn<string>[] = orderedColumns.map((column) => ({
    key: column.key,
    label: column.header,
    sortable: false,
    cellClassName: column.cellClassName,
  }));

  const visibleKeys = orderedColumns.map((column) => column.key);

  const startRow = totalCount === 0 ? 0 : (pageNumber - 1) * pageSize + 1;
  const endRow = totalCount === 0 ? 0 : Math.min(pageNumber * pageSize, totalCount);

  const renderCell = (row: T, key: string): ReactNode => {
    const column = columns.find((item) => item.key === key);
    return column ? column.render(row) : '-';
  };

  const showActions = Boolean(onEdit || onDelete);

  const renderActionsCell = (row: T): ReactElement => (
    <div
      className="flex justify-end gap-2 opacity-100"
      data-skip-row-double-click
      data-no-drag-scroll
      onClick={(event) => event.stopPropagation()}
      onDoubleClick={(event) => event.stopPropagation()}
    >
      {onEdit ? (
        <Button
          variant="ghost"
          size="icon"
          onClick={() => onEdit(row)}
          title="Duzenle"
          className="h-8 w-8 text-blue-600 hover:bg-blue-50 hover:text-blue-700 dark:text-blue-400 dark:hover:bg-blue-500/10"
        >
          <Edit2 size={16} />
        </Button>
      ) : null}
      {onDelete ? (
        <Button
          variant="ghost"
          size="icon"
          onClick={() => onDelete(row)}
          title="Sil"
          className="h-8 w-8 text-red-600 hover:bg-red-50 hover:text-red-700 dark:text-red-400 dark:hover:bg-red-500/10"
        >
          <Trash2 size={16} />
        </Button>
      ) : null}
    </div>
  );

  return (
    <DataTableGrid<T, string>
      columns={gridColumns}
      visibleColumnKeys={visibleKeys}
      rows={rows}
      rowKey={(row) => row.id}
      renderCell={renderCell}
      isLoading={isLoading}
      isError={isError}
      errorText={errorText}
      emptyText={emptyText}
      minTableWidthClassName={minTableWidthClassName}
      showActionsColumn={showActions}
      actionsHeaderLabel="Islemler"
      renderActionsCell={showActions ? renderActionsCell : undefined}
      iconOnlyActions
      rowClassName="group"
      onRowDoubleClick={onEdit}
      pageSize={pageSize}
      pageSizeOptions={pageSizeOptions}
      onPageSizeChange={onPageSizeChange}
      pageNumber={pageNumber}
      totalPages={totalPages}
      hasPreviousPage={hasPreviousPage ?? pageNumber > 1}
      hasNextPage={hasNextPage ?? pageNumber < totalPages}
      onPreviousPage={() => onPageChange(Math.max(1, pageNumber - 1))}
      onNextPage={() => onPageChange(Math.min(totalPages, pageNumber + 1))}
      previousLabel="Onceki"
      nextLabel="Sonraki"
      paginationInfoText={totalCount === 0 ? 'Kayit yok' : `${startRow}–${endRow} / ${totalCount}`}
      centerColumnHeaders
      enableColumnDragAndDrop
      enableColumnResize
      onColumnOrderChange={(newOrder) => {
        if (onColumnOrderChange) {
          onColumnOrderChange(newOrder);
          return;
        }
        setInternalColumnOrder(newOrder);
      }}
    />
  );
}
