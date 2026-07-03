import { type ReactElement, type ReactNode, useEffect, useMemo, useState } from 'react';
import { Plus } from 'lucide-react';
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
import { DataTableActionBar, ManagementDataTableChrome } from '@/components/shared';
import { loadColumnPreferences, saveColumnPreferences } from '@/lib/column-preferences';
import { applyFilterRowsClient, type FilterColumnConfig, type FilterRow } from '@/lib/advanced-filter-types';
import { PAGE_SIZE_OPTIONS } from '../lib/salesdesk-shared';
import { salesDeskMetricsToKpiItems } from '../lib/salesdesk-kpi-utils';
import {
  buildSalesDeskExportData,
  salesDeskColumnsToColumnDefs,
  salesDeskColumnsToFilterColumns,
} from '../lib/salesdesk-list-toolbar-utils';
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
} from '@/lib/management-list-layout';
import { arraysEqual } from '@/lib/utils';
import { useAuthStore } from '@/stores/auth-store';

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
  filterType?: FilterColumnConfig['type'];
  exportValue?: (row: T) => string | number | boolean | null | undefined;
}

interface SalesDeskListLayoutProps<T extends { id: number }> {
  pageKey: string;
  title: string;
  subtitle: string;
  tableTitle: string;
  actionLabel: string;
  exportFileName?: string;
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
  headerActions?: ReactNode;
  filterColumns?: readonly FilterColumnConfig[];
  defaultFilterColumn?: string;
  hideToolbar?: boolean;
}

function loadSalesDeskColumnPrefs(pageKey: string, userId: number | undefined, defaultOrder: string[]) {
  return loadColumnPreferences(pageKey, userId, defaultOrder, 'id', false);
}

export function SalesDeskListLayout<T extends { id: number }>({
  pageKey,
  title,
  subtitle,
  tableTitle,
  actionLabel,
  exportFileName,
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
  headerActions,
  filterColumns,
  defaultFilterColumn,
  hideToolbar = false,
}: SalesDeskListLayoutProps<T>): ReactElement {
  const user = useAuthStore((state) => state.user);
  const showTableLoading = Boolean(isLoading && !isError);
  const defaultColumnKeys = useMemo(() => columns.map((column) => column.key), [columns]);
  const columnDefs = useMemo(() => salesDeskColumnsToColumnDefs(columns), [columns]);
  const resolvedFilterColumns = useMemo(
    () => filterColumns ?? salesDeskColumnsToFilterColumns(columns),
    [columns, filterColumns]
  );
  const resolvedDefaultFilterColumn = defaultFilterColumn ?? columns[0]?.key ?? 'id';
  const resolvedExportFileName = exportFileName ?? pageKey;

  const [visibleColumns, setVisibleColumns] = useState<string[]>(() =>
    loadSalesDeskColumnPrefs(pageKey, user?.id, defaultColumnKeys).visibleKeys
  );
  const [columnOrder, setColumnOrder] = useState<string[]>(() =>
    loadSalesDeskColumnPrefs(pageKey, user?.id, defaultColumnKeys).order
  );
  const [draftFilterRows, setDraftFilterRows] = useState<FilterRow[]>([]);
  const [appliedFilterRows, setAppliedFilterRows] = useState<FilterRow[]>([]);

  useEffect(() => {
    const prefs = loadSalesDeskColumnPrefs(pageKey, user?.id, defaultColumnKeys);
    setVisibleColumns((current) => (arraysEqual(current, prefs.visibleKeys) ? current : prefs.visibleKeys));
    setColumnOrder((current) => (arraysEqual(current, prefs.order) ? current : prefs.order));
  }, [defaultColumnKeys, pageKey, user?.id]);

  useEffect(() => {
    saveColumnPreferences(pageKey, user?.id, { visibleKeys: visibleColumns, order: columnOrder });
  }, [columnOrder, pageKey, user?.id, visibleColumns]);

  const filteredRows = useMemo(() => {
    if (appliedFilterRows.length === 0) return rows;
    return applyFilterRowsClient(rows, appliedFilterRows, resolvedFilterColumns);
  }, [appliedFilterRows, resolvedFilterColumns, rows]);

  const orderedVisibleColumnKeys = useMemo(
    () => columnOrder.filter((key) => visibleColumns.includes(key)),
    [columnOrder, visibleColumns]
  );

  const visibleTableColumns = useMemo(
    () =>
      orderedVisibleColumnKeys
        .map((key) => columns.find((column) => column.key === key))
        .filter((column): column is SalesDeskColumn<T> => column != null),
    [columns, orderedVisibleColumnKeys]
  );

  const { exportColumns, exportRows } = useMemo(
    () => buildSalesDeskExportData(filteredRows, orderedVisibleColumnKeys, columns),
    [columns, filteredRows, orderedVisibleColumnKeys]
  );

  const appliedFilterCount = appliedFilterRows.filter((row) => row.value.trim()).length;

  const handleColumnOrderChange = (newVisibleOrder: string[]): void => {
    setColumnOrder((currentOrder) => {
      const hiddenColumns = currentOrder.filter((key) => !visibleColumns.includes(key));
      return [...newVisibleOrder, ...hiddenColumns];
    });
  };

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
        {headerActions ?? (
          !hideAddButton ? (
            <Button onClick={onAdd} variant="ghost" className={ADD_BUTTON_CLASS}>
              <Plus size={20} className="mr-2 stroke-[3px]" />
              {actionLabel}
            </Button>
          ) : null
        )}
      </div>

      {metrics.length > 0 ? (
        <SalesDeskKpiCards isLoading={showTableLoading} items={salesDeskMetricsToKpiItems(metrics)} />
      ) : null}

      <Card className={MANAGEMENT_LIST_CARD_CLASSNAME}>
        <CardHeader className={MANAGEMENT_LIST_CARD_HEADER_CLASSNAME}>
          <CardTitle className={MANAGEMENT_LIST_CARD_TITLE_CLASSNAME}>{tableTitle}</CardTitle>
          {!hideToolbar ? (
            <DataTableActionBar
              accentTone="brand"
              pageKey={pageKey}
              userId={user?.id}
              columns={columnDefs}
              visibleColumns={visibleColumns}
              columnOrder={columnOrder}
              onVisibleColumnsChange={setVisibleColumns}
              onColumnOrderChange={handleColumnOrderChange}
              exportFileName={resolvedExportFileName}
              exportColumns={exportColumns}
              exportRows={exportRows}
              filterColumns={resolvedFilterColumns}
              defaultFilterColumn={resolvedDefaultFilterColumn}
              draftFilterRows={draftFilterRows}
              onDraftFilterRowsChange={setDraftFilterRows}
              onApplyFilters={() => setAppliedFilterRows(draftFilterRows)}
              onClearFilters={() => {
                setDraftFilterRows([]);
                setAppliedFilterRows([]);
              }}
              translationNamespace="common"
              appliedFilterCount={appliedFilterCount}
              searchValue={searchTerm}
              searchPlaceholder="Ara"
              onSearchChange={onSearchChange}
              compactSearchOnMobile
              refresh={{
                onRefresh,
                isLoading: isFetching,
              }}
            />
          ) : null}
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
                columns={visibleTableColumns}
                rows={filteredRows}
                isLoading={showTableLoading}
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
                onColumnOrderChange={handleColumnOrderChange}
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
