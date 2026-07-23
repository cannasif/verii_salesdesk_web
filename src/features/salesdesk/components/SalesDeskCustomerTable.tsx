import { type ReactElement, type ReactNode } from 'react';
import { DataTableGrid, ManagementTableRowActions, type DataTableGridColumn } from '@/components/shared';
import { MANAGEMENT_TABLE_ACTIONS_COLUMN_WIDTH } from '@/lib/management-table-actions';
import type { SalesDeskCustomerDto } from '../api/salesdesk-api';
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
  onDetail: (customer: SalesDeskCustomerDto) => void;
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
  onDetail,
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
    <ManagementTableRowActions
      onDetail={() => onDetail(customer)}
      onEdit={() => onEdit(customer)}
      onDelete={() => onDelete(customer)}
    />
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
      onRowActivate={onDetail}
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
      initialActionsColumnWidth={MANAGEMENT_TABLE_ACTIONS_COLUMN_WIDTH}
      iconOnlyActions
      rowClassName="group"
      onRowDoubleClick={onDetail}
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
