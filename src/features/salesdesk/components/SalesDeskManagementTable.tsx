import { type ReactElement, type ReactNode, useEffect, useMemo, useState } from 'react';
import { DataTableGrid, ManagementTableRowActions, type DataTableGridColumn } from '@/components/shared';
import { wrapTableCellWithCopy } from '@/components/shared/TableCellWithCopy';
import { arraysEqual } from '@/lib/utils';
import { MANAGEMENT_TABLE_ACTIONS_COLUMN_WIDTH } from '@/lib/management-table-actions';
import type { SalesDeskColumn } from './SalesDeskListLayout';
import { resolveSalesDeskColumnCopyValue } from '../lib/salesdesk-cell-copy';
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
  onDetail?: (row: T) => void;
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
  onDetail,
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
  enableCellCopyButton = true,
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

  const renderCellContent = (row: T, key: string): ReactNode => {
    const column = columns.find((item) => item.key === key);
    if (!column) return '-';
    return column.render(row);
  };

  const resolveCopyText = (row: T, key: string): string | null => {
    const column = columns.find((item) => item.key === key);
    if (!column) return null;
    return resolveSalesDeskColumnCopyValue(row, column);
  };

  const renderCell = (row: T, key: string): ReactNode => {
    const content = renderCellContent(row, key);
    if (!enableCellCopyButton) return content;
    return wrapTableCellWithCopy(content, resolveCopyText(row, key), columnHeaderFor(key), {
      centered: true,
    });
  };

  function columnHeaderFor(key: string): string | undefined {
    return columns.find((item) => item.key === key)?.header;
  }

  const showActions = Boolean(onDetail || onEdit || onDelete || renderExtraActions);
  const rowDetailHandler = onDetail ?? onEdit;

  const renderActionsCell = (row: T): ReactElement => (
    <ManagementTableRowActions
      onDetail={onDetail ? () => onDetail(row) : undefined}
      onEdit={onEdit ? () => onEdit(row) : undefined}
      onDelete={onDelete ? () => onDelete(row) : undefined}
      beforeActions={
        renderExtraActions ? (
          <div className="flex flex-row flex-nowrap items-center justify-end gap-1">{renderExtraActions(row)}</div>
        ) : undefined
      }
    />
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
      onRowActivate={rowDetailHandler}
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
      renderCell={renderCellContent}
      getCellCopyValue={(row, key) => resolveCopyText(row, key)}
      enableCellCopyButton={enableCellCopyButton}
      isLoading={isLoading}
      isError={isError}
      errorText={errorText}
      emptyText={emptyText}
      minTableWidthClassName={minTableWidthClassName}
      mobileView={mobileView}
      showActionsColumn={showActions}
      actionsHeaderLabel="Islemler"
      renderActionsCell={showActions ? renderActionsCell : undefined}
      initialActionsColumnWidth={
        renderExtraActions ? Math.max(MANAGEMENT_TABLE_ACTIONS_COLUMN_WIDTH, 320) : MANAGEMENT_TABLE_ACTIONS_COLUMN_WIDTH
      }
      actionsCellClassName="crm-text-end align-middle overflow-visible"
      iconOnlyActions
      rowClassName="group"
      onRowDoubleClick={rowDetailHandler}
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
