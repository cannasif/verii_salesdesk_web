import { type ReactElement, type ReactNode } from 'react';
import { Edit2, Trash2 } from 'lucide-react';
import { DataTableGrid, type DataTableGridColumn } from '@/components/shared';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import type { SalesDeskCustomerDto } from '../api/salesdesk-api';
import { SD_TABLE_ACTION_BUTTON } from '../lib/salesdesk-popup-styles';
import { SalesDeskMobileCardList } from './SalesDeskMobileCardList';

export type SalesDeskCustomerColumnKey =
  | 'id'
  | 'code'
  | 'name'
  | 'contactName'
  | 'phone'
  | 'email'
  | 'kind'
  | 'balance'
  | 'city';

interface SalesDeskCustomerTableProps {
  columns: DataTableGridColumn<SalesDeskCustomerColumnKey>[];
  visibleColumnKeys: SalesDeskCustomerColumnKey[];
  rows: SalesDeskCustomerDto[];
  sortBy: SalesDeskCustomerColumnKey;
  sortDirection: 'asc' | 'desc';
  onSort: (key: SalesDeskCustomerColumnKey) => void;
  renderSortIcon: (key: SalesDeskCustomerColumnKey) => ReactNode;
  renderCell: (row: SalesDeskCustomerDto, key: SalesDeskCustomerColumnKey, columnWidth?: number) => ReactNode;
  isLoading?: boolean;
  isError?: boolean;
  loadingText?: string;
  errorText?: string;
  emptyText?: string;
  onEdit: (customer: SalesDeskCustomerDto) => void;
  onDelete: (customer: SalesDeskCustomerDto) => void;
  pageSize: number;
  pageSizeOptions: readonly number[];
  onPageSizeChange: (size: number) => void;
  pageNumber: number;
  totalPages: number;
  hasPreviousPage: boolean;
  hasNextPage: boolean;
  onPreviousPage: () => void;
  onNextPage: () => void;
  previousLabel: string;
  nextLabel: string;
  paginationInfoText: string;
  onColumnOrderChange?: (newOrder: SalesDeskCustomerColumnKey[]) => void;
}

export function SalesDeskCustomerTable({
  columns,
  visibleColumnKeys,
  rows,
  sortBy,
  sortDirection,
  onSort,
  renderSortIcon,
  renderCell,
  isLoading = false,
  isError = false,
  loadingText = 'Yükleniyor...',
  errorText = 'Veri yüklenemedi.',
  emptyText = 'Kayıt bulunamadı.',
  onEdit,
  onDelete,
  pageSize,
  pageSizeOptions,
  onPageSizeChange,
  pageNumber,
  totalPages,
  hasPreviousPage,
  hasNextPage,
  onPreviousPage,
  onNextPage,
  previousLabel,
  nextLabel,
  paginationInfoText,
  onColumnOrderChange,
}: SalesDeskCustomerTableProps): ReactElement {
  const renderActionsCell = (customer: SalesDeskCustomerDto): ReactElement => (
    <div
      className="flex justify-end gap-2 opacity-100"
      data-skip-row-double-click
      data-no-drag-scroll
      onClick={(event) => event.stopPropagation()}
      onDoubleClick={(event) => event.stopPropagation()}
    >
      <Button
        variant="ghost"
        size="icon"
        onClick={() => onEdit(customer)}
        title="Düzenle"
        className={cn(
          SD_TABLE_ACTION_BUTTON,
          'text-blue-600 hover:bg-blue-50 hover:text-blue-700 dark:text-blue-400 dark:hover:bg-blue-500/10'
        )}
      >
        <Edit2 size={18} />
      </Button>
      <Button
        variant="ghost"
        size="icon"
        onClick={() => onDelete(customer)}
        title="Sil"
        className={cn(
          SD_TABLE_ACTION_BUTTON,
          'text-red-600 hover:bg-red-50 hover:text-red-700 dark:text-red-400 dark:hover:bg-red-500/10'
        )}
      >
        <Trash2 size={18} />
      </Button>
    </div>
  );

  const mobileView = (
    <SalesDeskMobileCardList
      columns={columns}
      visibleColumnKeys={visibleColumnKeys}
      rows={rows}
      rowKey={(row) => row.id}
      renderCell={(row, key) => renderCell(row, key)}
      primaryKey="name"
      renderActions={renderActionsCell}
      onRowActivate={onEdit}
      isLoading={isLoading}
      isError={isError}
      errorText={errorText}
      emptyText={emptyText}
      pageSize={pageSize}
    />
  );

  return (
    <DataTableGrid<SalesDeskCustomerDto, SalesDeskCustomerColumnKey>
      columns={columns}
      visibleColumnKeys={visibleColumnKeys}
      rows={rows}
      rowKey={(row) => row.id}
      renderCell={renderCell}
      sortBy={sortBy}
      sortDirection={sortDirection}
      onSort={onSort}
      renderSortIcon={renderSortIcon}
      isLoading={isLoading}
      isError={isError}
      loadingText={loadingText}
      errorText={errorText}
      emptyText={emptyText}
      minTableWidthClassName="min-w-[800px] lg:min-w-[1100px]"
      mobileView={mobileView}
      showActionsColumn
      actionsHeaderLabel="İşlemler"
      renderActionsCell={renderActionsCell}
      iconOnlyActions
      rowClassName="group"
      onRowDoubleClick={onEdit}
      pageSize={pageSize}
      pageSizeOptions={pageSizeOptions}
      onPageSizeChange={onPageSizeChange}
      pageNumber={pageNumber}
      totalPages={totalPages}
      hasPreviousPage={hasPreviousPage}
      hasNextPage={hasNextPage}
      onPreviousPage={onPreviousPage}
      onNextPage={onNextPage}
      previousLabel={previousLabel}
      nextLabel={nextLabel}
      paginationInfoText={paginationInfoText}
      centerColumnHeaders
      enableColumnDragAndDrop
      enableColumnResize
      onColumnOrderChange={onColumnOrderChange}
    />
  );
}
