import { type ReactElement } from 'react';
import type { TFunction } from 'i18next';
import { DataTableGrid, ManagementDataTableChrome, ManagementTableRowActions, type DataTableGridColumn } from '@/components/shared';
import { SalesDeskMobileCardList } from '@/features/salesdesk/components/SalesDeskMobileCardList';
import type { UserDto } from '../types/user-types';
import { MANAGEMENT_LIST_ID_COLUMN_DEF } from '@/lib/management-list-layout';
import { MANAGEMENT_TABLE_ACTIONS_COLUMN_WIDTH } from '@/lib/management-table-actions';

type UserColumnKey = keyof UserDto | 'status';

export interface ColumnDef<T> {
  key: keyof T | 'status';
  label: string;
  className?: string;
  headClassName?: string;
}

const SORT_MAP: Record<string, string> = {
  id: 'Id',
  username: 'Username',
  email: 'Email',
  fullName: 'FullName',
  managerFullName: 'ManagerFullName',
  role: 'Role',
  status: 'IsActive',
  creationTime: 'CreationTime',
};

export const getColumnsConfig = (t: TFunction): ColumnDef<UserDto>[] => [
  {
    key: 'id',
    label: t('userManagement.table.id'),
    ...MANAGEMENT_LIST_ID_COLUMN_DEF,
  },
  { key: 'username', label: t('userManagement.table.username'), className: 'min-w-[120px]' },
  { key: 'email', label: t('userManagement.table.email'), className: 'min-w-[180px]' },
  { key: 'fullName', label: t('userManagement.table.fullName'), className: 'min-w-[140px]' },
  { key: 'managerFullName', label: t('userManagement.table.manager'), className: 'min-w-[160px]' },
  { key: 'role', label: t('userManagement.table.role'), className: 'w-[120px]' },
  { key: 'status', label: t('userManagement.table.status'), className: 'w-[140px]' },
  { key: 'creationTime', label: t('userManagement.table.createdDate'), className: 'w-[120px]' },
];

interface UserTableProps {
  onEdit?: (user: UserDto) => void;
  onDelete?: (user: UserDto) => void;
  toolbar?: React.ReactNode;
  columns: DataTableGridColumn<UserColumnKey>[];
  visibleColumnKeys: UserColumnKey[];
  rows: UserDto[];
  rowKey: (row: UserDto) => string | number;
  renderCell: (row: UserDto, key: UserColumnKey) => React.ReactNode;
  sortBy: UserColumnKey;
  sortDirection: 'asc' | 'desc';
  onSortChange: (sortBy: string, sortDirection: 'asc' | 'desc') => void;
  renderSortIcon: (key: UserColumnKey) => React.ReactNode;
  isLoading?: boolean;
  loadingText?: string;
  errorText?: string;
  emptyText?: string;
  minTableWidthClassName?: string;
  showActionsColumn?: boolean;
  actionsHeaderLabel?: string;
  rowClassName?: string | ((row: UserDto) => string | undefined);
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
  disablePaginationButtons?: boolean;
  onColumnOrderChange?: (newOrder: string[]) => void;
}

export function UserTable({
  onEdit,
  onDelete,
  toolbar,
  columns,
  visibleColumnKeys,
  rows,
  rowKey,
  renderCell,
  sortBy,
  sortDirection,
  onSortChange,
  renderSortIcon,
  isLoading = false,
  loadingText = 'Loading...',
  errorText = 'An error occurred.',
  emptyText = 'No data.',
  minTableWidthClassName = 'min-w-[900px] lg:min-w-[1100px]',
  showActionsColumn = true,
  actionsHeaderLabel = '',
  rowClassName,
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
  disablePaginationButtons = false,
  onColumnOrderChange,
}: UserTableProps): ReactElement {

  const handleSort = (key: UserColumnKey): void => {
    const backendSortBy = SORT_MAP[key as string] ?? key;
    const newDirection = sortBy === key && sortDirection === 'asc' ? 'desc' : 'asc';
    onSortChange(backendSortBy, newDirection);
  };

  const renderActionsCell = (user: UserDto): ReactElement => (
    <ManagementTableRowActions
      onDetail={onEdit ? () => onEdit(user) : undefined}
      onEdit={onEdit ? () => onEdit(user) : undefined}
      onDelete={onDelete ? () => onDelete(user) : undefined}
      showEdit={Boolean(onEdit)}
      showDelete={Boolean(onDelete)}
    />
  );

  const mobileView = (
    <SalesDeskMobileCardList
      columns={columns.map((column) => ({ key: column.key, label: column.label }))}
      visibleColumnKeys={visibleColumnKeys}
      rows={rows}
      rowKey={rowKey}
      renderCell={renderCell}
      primaryKey="fullName"
      detailKeys={['username', 'email', 'role', 'status']}
      renderActions={onEdit || onDelete ? renderActionsCell : undefined}
      isLoading={isLoading}
      isError={false}
      errorText={errorText}
      emptyText={emptyText}
      pageSize={pageSize}
    />
  );

  return (
    <ManagementDataTableChrome>
    <DataTableGrid<UserDto, UserColumnKey>
      toolbar={toolbar}
      columns={columns}
      visibleColumnKeys={visibleColumnKeys}
      rows={rows}
      rowKey={rowKey}
      renderCell={renderCell}
      sortBy={sortBy}
      sortDirection={sortDirection}
      onSort={handleSort}
      renderSortIcon={renderSortIcon}
      isLoading={isLoading}
      isError={false}
      loadingText={loadingText}
      errorText={errorText}
      emptyText={emptyText}
      minTableWidthClassName={minTableWidthClassName}
      showActionsColumn={showActionsColumn}
      actionsHeaderLabel={actionsHeaderLabel}
      renderActionsCell={renderActionsCell}
      initialActionsColumnWidth={MANAGEMENT_TABLE_ACTIONS_COLUMN_WIDTH}
      mobileView={mobileView}
      rowClassName={rowClassName}
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
      disablePaginationButtons={disablePaginationButtons}
      centerColumnHeaders
      onColumnOrderChange={onColumnOrderChange}
    />
    </ManagementDataTableChrome>
  );
}
