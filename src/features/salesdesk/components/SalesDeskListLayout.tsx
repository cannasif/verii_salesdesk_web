import { type ReactElement, type ReactNode } from 'react';
import { Loader2, Plus, RefreshCw, Search } from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ManagementDataTableChrome } from '@/components/shared';
import { PAGE_SIZE_OPTIONS } from '../lib/salesdesk-shared';
import { salesDeskMetricsToKpiItems } from '../lib/salesdesk-kpi-utils';
import { SalesDeskKpiCards } from './SalesDeskKpiCards';
import { SalesDeskManagementTable } from './SalesDeskManagementTable';
import { SD_PAGE_PULSE, SD_SECONDARY_BUTTON, SD_SURFACE_DIALOG } from '../lib/salesdesk-popup-styles';
import {
  ADD_BUTTON_CLASS,
  MANAGEMENT_LIST_CARD_CLASSNAME,
  MANAGEMENT_LIST_CARD_CONTENT_CLASSNAME,
  MANAGEMENT_LIST_CARD_HEADER_CLASSNAME,
  MANAGEMENT_LIST_CARD_TITLE_CLASSNAME,
  MANAGEMENT_LIST_TABLE_SHELL_CLASSNAME,
  MANAGEMENT_TOOLBAR_OUTLINE_BUTTON_CLASSNAME,
} from '@/lib/management-list-layout';
import { cn } from '@/lib/utils';

export interface SalesDeskMetric {
  label: string;
  value: string | number;
  tone?: 'blue' | 'green' | 'yellow' | 'red' | 'violet' | 'pink' | 'cyan';
}

export interface SalesDeskColumn<T> {
  key: string;
  header: string;
  render: (row: T) => ReactNode;
  cellClassName?: string;
}

interface SalesDeskListLayoutProps<T extends { id: number }> {
  title: string;
  subtitle: string;
  tableTitle: string;
  actionLabel: string;
  icon?: ReactNode;
  metrics?: SalesDeskMetric[];
  columns: SalesDeskColumn<T>[];
  rows: T[];
  isLoading?: boolean;
  isFetching?: boolean;
  isError?: boolean;
  error?: Error | null;
  searchTerm: string;
  onSearchChange: (value: string) => void;
  pageSize: number;
  onPageSizeChange: (value: number) => void;
  pageNumber: number;
  totalPages: number;
  totalCount: number;
  hasPreviousPage?: boolean;
  hasNextPage?: boolean;
  onPageChange: (page: number) => void;
  onRefresh: () => void;
  onAdd: () => void;
  onEdit?: (row: T) => void;
  onDeleteRequest?: (row: T) => void;
  deletingRow?: T | null;
  onDeleteConfirm?: () => void | Promise<void>;
  onDeleteCancel?: () => void;
  isDeleting?: boolean;
  deleteLabel?: (row: T) => string;
  formDialog?: ReactNode;
  emptyMessage?: string;
  minTableWidthClassName?: string;
  hideAddButton?: boolean;
}

export function SalesDeskListLayout<T extends { id: number }>({
  title,
  subtitle,
  tableTitle,
  actionLabel,
  metrics = [],
  columns,
  rows,
  isLoading,
  isFetching,
  isError,
  error,
  searchTerm,
  onSearchChange,
  pageSize,
  onPageSizeChange,
  pageNumber,
  totalPages,
  totalCount,
  hasPreviousPage,
  hasNextPage,
  onPageChange,
  onRefresh,
  onAdd,
  onEdit,
  onDeleteRequest,
  deletingRow,
  onDeleteConfirm,
  onDeleteCancel,
  isDeleting,
  deleteLabel,
  formDialog,
  emptyMessage = 'Kayit bulunamadi.',
  minTableWidthClassName,
  hideAddButton = false,
}: SalesDeskListLayoutProps<T>): ReactElement {
  return (
    <div className="relative w-full space-y-6">
      <div className="flex flex-col justify-between gap-6 pt-2 md:flex-row md:items-center">
        <div className="space-y-1">
          <h1 className="text-3xl font-extrabold tracking-tight text-zinc-900 transition-colors dark:text-white">
            {title}
          </h1>
          <p className="flex items-center gap-2 text-sm font-medium text-zinc-500 dark:text-muted-foreground">
            <span className={`h-2 w-2 animate-pulse rounded-full ${SD_PAGE_PULSE}`} />
            {subtitle}
          </p>
        </div>
        {!hideAddButton ? (
          <Button onClick={onAdd} variant="ghost" className={ADD_BUTTON_CLASS}>
            <Plus size={20} className="mr-2 stroke-[3px]" />
            {actionLabel}
          </Button>
        ) : null}
      </div>

      {metrics.length > 0 ? (
        <SalesDeskKpiCards isLoading={isLoading} items={salesDeskMetricsToKpiItems(metrics)} />
      ) : null}

      <Card className={MANAGEMENT_LIST_CARD_CLASSNAME}>
        <CardHeader className={MANAGEMENT_LIST_CARD_HEADER_CLASSNAME}>
          <CardTitle className={MANAGEMENT_LIST_CARD_TITLE_CLASSNAME}>{tableTitle}</CardTitle>
          <div className="flex flex-col gap-3 lg:flex-row lg:flex-wrap lg:items-center lg:justify-between">
            <div className="group/search relative w-full lg:max-w-[240px]">
              <Search
                className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--crm-app-text-muted)] transition-colors group-focus-within/search:text-[var(--crm-brand-primary)]"
                aria-hidden
              />
              <input
                type="search"
                value={searchTerm}
                onChange={(event) => onSearchChange(event.target.value)}
                placeholder="Ara"
                className={cn(
                  'h-9 w-full rounded-lg border border-[var(--crm-app-border)] bg-[var(--crm-app-panel)] py-0 pl-9 pr-3 text-sm text-slate-100 shadow-sm placeholder:text-[var(--crm-app-text-muted)]',
                  'focus:border-[var(--crm-brand-primary)] focus:outline-none focus:ring-[3px] focus:ring-[var(--crm-brand-ring)]'
                )}
              />
            </div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={onRefresh}
              disabled={isFetching}
              className={MANAGEMENT_TOOLBAR_OUTLINE_BUTTON_CLASSNAME}
            >
              {isFetching ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <RefreshCw className="mr-2 h-4 w-4" />
              )}
              Yenile
            </Button>
          </div>
        </CardHeader>

        <CardContent className={MANAGEMENT_LIST_CARD_CONTENT_CLASSNAME}>
          {isError ? (
            <div className="mb-4 rounded-lg border border-rose-400/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-200">
              {error?.message || 'Liste yuklenemedi. API baglantisini kontrol edin.'}
            </div>
          ) : null}

          <div className={MANAGEMENT_LIST_TABLE_SHELL_CLASSNAME}>
            <ManagementDataTableChrome>
              <SalesDeskManagementTable
                columns={columns}
                rows={rows}
                isLoading={isLoading}
                isError={isError}
                errorText={error?.message || 'Liste yuklenemedi.'}
                emptyText={emptyMessage}
                minTableWidthClassName={minTableWidthClassName}
                onEdit={onEdit}
                onDelete={onDeleteRequest}
                pageSize={pageSize}
                pageSizeOptions={PAGE_SIZE_OPTIONS}
                onPageSizeChange={onPageSizeChange}
                pageNumber={pageNumber}
                totalPages={totalPages}
                hasPreviousPage={hasPreviousPage}
                hasNextPage={hasNextPage}
                onPageChange={onPageChange}
                totalCount={totalCount}
              />
            </ManagementDataTableChrome>
          </div>
        </CardContent>
      </Card>

      {formDialog}

      {onDeleteConfirm && onDeleteCancel ? (
        <AlertDialog open={deletingRow != null} onOpenChange={(open) => !open && onDeleteCancel()}>
          <AlertDialogContent className={`w-[90%] max-w-md gap-0 overflow-hidden rounded-2xl p-0 sm:w-full ${SD_SURFACE_DIALOG}`}>
            <AlertDialogHeader className="px-6 pb-4 pt-8 text-center sm:text-left">
              <AlertDialogTitle className="text-lg font-semibold text-slate-900 dark:text-white">
                Kaydi sil
              </AlertDialogTitle>
              <AlertDialogDescription className="text-sm text-[var(--crm-app-text-muted)]">
                {deletingRow
                  ? `"${deleteLabel?.(deletingRow) ?? deletingRow.id}" kaydini silmek istediginize emin misiniz?`
                  : 'Bu islem geri alinamaz.'}
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter className="flex flex-row justify-end gap-2 border-t border-[var(--crm-app-border)] bg-[var(--crm-app-dialog-footer)] px-6 py-4">
              <AlertDialogCancel className={SD_SECONDARY_BUTTON}>Iptal</AlertDialogCancel>
              <AlertDialogAction
                className="h-10 rounded-lg bg-rose-600 px-5 text-sm font-semibold text-white hover:bg-rose-500"
                onClick={onDeleteConfirm}
                disabled={isDeleting}
              >
                {isDeleting ? 'Siliniyor...' : 'Sil'}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      ) : null}
    </div>
  );
}
