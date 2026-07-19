import { type ReactElement, type ReactNode, useEffect, useMemo, useState } from 'react';
import { Copy, Edit2, Trash2 } from 'lucide-react';
import { DataTableGrid, type DataTableGridColumn } from '@/components/shared';
import { Button } from '@/components/ui/button';
import { cn, arraysEqual } from '@/lib/utils';
import type { SalesDeskColumn } from './SalesDeskListLayout';
import { SD_TABLE_ACTION_BUTTON } from '../lib/salesdesk-popup-styles';
import { copySalesDeskCellValue, resolveSalesDeskColumnCopyValue } from '../lib/salesdesk-cell-copy';
import { SalesDeskMobileCardList } from './SalesDeskMobileCardList';

interface SalesDeskManagementTableProps<T extends { id: number }> {
  columns: SalesDeskColumn<T>[];
  rows: T[];
  isLoading?: boolean;
  isError?: boolean;
  errorText?: string;
  emptyText?: string;
  minTableWidthClassName?: string;
  mobilePrimaryKey?: string;
  mobileDetailKeys?: string[];
  onEdit?: (row: T) => void;
  onDelete?: (row: T) => void;
  renderExtraActions?: (row: T) => ReactNode;
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
  enableCellCopyButton?: boolean;
}

export function SalesDeskManagementTable<T extends { id: number }>({
  columns,
  rows,
  isLoading = false,
  isError = false,
  errorText = 'Liste yuklenemedi.',
  emptyText = 'Kayit bulunamadi.',
  minTableWidthClassName = 'min-w-[800px] lg:min-w-[1000px]',
  mobilePrimaryKey,
  mobileDetailKeys,
  onEdit,
  onDelete,
  renderExtraActions,
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
  enableCellCopyButton = false,
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
    if (!column) return '-';

    const content = column.render(row);
    if (!enableCellCopyButton) return content;

    const copyText = resolveSalesDeskColumnCopyValue(row, column);
    if (!copyText) return content;

    return (
      <div className="flex min-w-0 items-center gap-0.5">
        <span className="min-w-0 flex-1 truncate">{content}</span>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          title="Kopyala"
          aria-label="Kopyala"
          data-skip-row-double-click
          data-no-drag-scroll
          className={cn(
            SD_TABLE_ACTION_BUTTON,
            'h-7 w-7 shrink-0 text-zinc-500 hover:bg-zinc-100 hover:text-zinc-800 dark:text-zinc-400 dark:hover:bg-white/10 dark:hover:text-zinc-100'
          )}
          onClick={(event) => {
            event.stopPropagation();
            void copySalesDeskCellValue(copyText, column.header);
          }}
        >
          <Copy size={14} />
        </Button>
      </div>
    );
  };

  const showActions = Boolean(onEdit || onDelete || renderExtraActions);

  const renderActionsCell = (row: T): ReactElement => (
    <div
      className="flex w-full flex-col items-end gap-2 md:flex-row md:flex-wrap md:justify-end md:gap-1"
      data-skip-row-double-click
      data-no-drag-scroll
      onClick={(event) => event.stopPropagation()}
      onDoubleClick={(event) => event.stopPropagation()}
    >
      {renderExtraActions ? (
        <div className="flex flex-wrap items-center justify-end gap-1">{renderExtraActions(row)}</div>
      ) : null}
      {onEdit || onDelete ? (
        <div className="inline-flex shrink-0 items-center gap-1">
          {onEdit ? (
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onEdit(row)}
              title="Duzenle"
              className={cn(
                SD_TABLE_ACTION_BUTTON,
                'text-blue-600 hover:bg-blue-50 hover:text-blue-700 dark:text-blue-400 dark:hover:bg-blue-500/10'
              )}
            >
              <Edit2 size={18} />
            </Button>
          ) : null}
          {onDelete ? (
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onDelete(row)}
              title="Sil"
              className={cn(
                SD_TABLE_ACTION_BUTTON,
                'text-red-600 hover:bg-red-50 hover:text-red-700 dark:text-red-400 dark:hover:bg-red-500/10'
              )}
            >
              <Trash2 size={18} />
            </Button>
          ) : null}
        </div>
      ) : null}
    </div>
  );

  const mobileView = (
    <SalesDeskMobileCardList
      columns={gridColumns}
      visibleColumnKeys={visibleKeys}
      rows={rows}
      rowKey={(row) => row.id}
      renderCell={renderCell}
      primaryKey={mobilePrimaryKey}
      detailKeys={mobileDetailKeys}
      renderActions={showActions ? renderActionsCell : undefined}
      onRowActivate={onEdit}
      isLoading={isLoading}
      isError={isError}
      errorText={errorText}
      emptyText={emptyText}
      pageSize={pageSize}
    />
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
      mobileView={mobileView}
      showActionsColumn={showActions}
      actionsHeaderLabel="Islemler"
      renderActionsCell={showActions ? renderActionsCell : undefined}
      initialActionsColumnWidth={renderExtraActions ? 320 : undefined}
      actionsCellClassName="crm-text-end align-middle overflow-visible"
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
