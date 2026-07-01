import { type ReactElement, useCallback, useEffect, useMemo, useState } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  Edit3,
  Loader2,
  Plus,
  Trash2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { DataTableActionBar } from '@/components/shared';
import type { ColumnDef } from '@/components/shared/ColumnPreferencesPopover';
import { loadColumnPreferences, saveColumnPreferences } from '@/lib/column-preferences';
import type { FilterRow } from '@/lib/advanced-filter-types';
import type { GridExportColumn } from '@/lib/grid-export';
import {
  MANAGEMENT_DATA_GRID_CLASSNAME,
  MANAGEMENT_LIST_CARD_CLASSNAME,
  MANAGEMENT_LIST_CARD_CONTENT_CLASSNAME,
  MANAGEMENT_LIST_CARD_HEADER_CLASSNAME,
  MANAGEMENT_LIST_CARD_TITLE_CLASSNAME,
  MANAGEMENT_LIST_TABLE_SHELL_CLASSNAME,
  MANAGEMENT_TOOLBAR_OUTLINE_BUTTON_CLASSNAME,
  ADD_BUTTON_CLASS,
} from '@/lib/management-list-layout';
import { cn } from '@/lib/utils';
import { useAuthStore } from '@/stores/auth-store';
import type { SalesDeskCustomerDto } from '../api/salesdesk-api';
import { SD_PAGE_PULSE } from '../lib/salesdesk-popup-styles';
import { SalesDeskCustomerDeleteDialog } from './SalesDeskCustomerDeleteDialog';
import { SalesDeskCustomerForm } from './SalesDeskCustomerForm';
import {
  useCreateSalesDeskCustomer,
  useDeleteSalesDeskCustomer,
  useSalesDeskCustomerList,
  useSalesDeskCustomerStats,
  useUpdateSalesDeskCustomer,
} from '../hooks/useSalesDeskCustomers';
import {
  applySalesDeskCustomerFilters,
  SALES_DESK_CUSTOMER_FILTER_COLUMNS,
} from '../types/salesdesk-customer-filter.types';
import {
  formatCustomerBalance,
  SALES_DESK_CUSTOMER_KIND_LABELS,
  type SalesDeskCustomerFormValues,
} from '../types/customer-types';

const PAGE_KEY = 'salesdesk-customer-management';
const PAGE_SIZE_OPTIONS = [10, 20, 50] as const;

type CustomerColumnKey = 'code' | 'name' | 'contactName' | 'phone' | 'email' | 'kind' | 'balance' | 'city';

const BASE_COLUMNS: ColumnDef[] = [
  { key: 'code', label: 'Kod' },
  { key: 'name', label: 'Cari Adi' },
  { key: 'contactName', label: 'Yetkili' },
  { key: 'phone', label: 'Telefon' },
  { key: 'email', label: 'E-posta' },
  { key: 'kind', label: 'Tip' },
  { key: 'balance', label: 'Bakiye' },
  { key: 'city', label: 'Il' },
];

const DEFAULT_COLUMN_ORDER = BASE_COLUMNS.map((column) => column.key);

function KindBadge({ kind }: { kind: SalesDeskCustomerDto['kind'] }): ReactElement {
  const label = SALES_DESK_CUSTOMER_KIND_LABELS[kind];
  const tone =
    kind === 1
      ? 'border-emerald-400/50 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300'
      : kind === 2
        ? 'border-amber-400/50 bg-amber-500/10 text-amber-700 dark:text-amber-300'
        : 'border-[color-mix(in_srgb,var(--crm-brand-primary)_35%,transparent)] bg-[var(--crm-brand-soft)] text-[var(--crm-brand-on-soft)]';

  return <span className={`rounded-md border px-2 py-1 text-xs font-semibold ${tone}`}>{label}</span>;
}

function renderCustomerCell(row: SalesDeskCustomerDto, key: CustomerColumnKey): ReactElement | string {
  switch (key) {
    case 'code':
      return row.code;
    case 'name':
      return <span className="font-semibold text-slate-900 dark:text-white">{row.name}</span>;
    case 'contactName':
      return row.contactName || '-';
    case 'phone':
      return row.phone || '-';
    case 'email':
      return row.email || '-';
    case 'kind':
      return <KindBadge kind={row.kind} />;
    case 'balance':
      return formatCustomerBalance(row.balance);
    case 'city':
      return row.city || '-';
    default:
      return '-';
  }
}

export function SalesDeskCustomersPage(): ReactElement {
  const user = useAuthStore((state) => state.user);
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [pageNumber, setPageNumber] = useState(1);
  const [pageSize, setPageSize] = useState<number>(10);
  const [formOpen, setFormOpen] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<SalesDeskCustomerDto | null>(null);
  const [deletingCustomer, setDeletingCustomer] = useState<SalesDeskCustomerDto | null>(null);
  const [draftFilterRows, setDraftFilterRows] = useState<FilterRow[]>([]);
  const [appliedFilterRows, setAppliedFilterRows] = useState<FilterRow[]>([]);

  const initialColumnPrefs = useMemo(
    () => loadColumnPreferences(PAGE_KEY, user?.id, DEFAULT_COLUMN_ORDER, 'id', false),
    [user?.id]
  );
  const [visibleColumns, setVisibleColumns] = useState<string[]>(initialColumnPrefs.visibleKeys);
  const [columnOrder, setColumnOrder] = useState<string[]>(initialColumnPrefs.order);

  useEffect(() => {
    const timer = window.setTimeout(() => setDebouncedSearch(searchTerm.trim()), 300);
    return () => window.clearTimeout(timer);
  }, [searchTerm]);

  useEffect(() => {
    setPageNumber(1);
  }, [debouncedSearch, pageSize]);

  useEffect(() => {
    saveColumnPreferences(PAGE_KEY, user?.id, { visibleKeys: visibleColumns, order: columnOrder });
  }, [visibleColumns, columnOrder, user?.id]);

  const listParams = useMemo(
    () => ({
      pageNumber,
      pageSize,
      search: debouncedSearch || undefined,
      sortBy: 'Name',
      sortDirection: 'asc' as const,
    }),
    [pageNumber, pageSize, debouncedSearch]
  );

  const { data, isLoading, isFetching, isError, error, refetch } = useSalesDeskCustomerList(listParams);
  const { data: statsData } = useSalesDeskCustomerStats();
  const createCustomer = useCreateSalesDeskCustomer();
  const updateCustomer = useUpdateSalesDeskCustomer();
  const deleteCustomer = useDeleteSalesDeskCustomer();

  const customers = useMemo(() => {
    const rows = data?.data ?? [];
    if (appliedFilterRows.length === 0) return rows;
    return applySalesDeskCustomerFilters(rows, appliedFilterRows);
  }, [data?.data, appliedFilterRows]);

  const totalCount = data?.totalCount ?? 0;
  const totalPages = Math.max(1, data?.totalPages ?? 1);
  const startRow = totalCount === 0 ? 0 : (pageNumber - 1) * pageSize + 1;
  const endRow = totalCount === 0 ? 0 : Math.min(pageNumber * pageSize, totalCount);

  const statsRows = statsData?.data ?? [];
  const customerCount = statsData?.totalCount ?? totalCount;
  const musteriCount = statsRows.filter((item) => item.kind === 1 || item.kind === 3).length;
  const tedarikciCount = statsRows.filter((item) => item.kind === 2 || item.kind === 3).length;

  const appliedFilterCount = appliedFilterRows.filter((row) => row.value.trim()).length;

  const displayColumns = useMemo(
    () => columnOrder.filter((key) => visibleColumns.includes(key)) as CustomerColumnKey[],
    [columnOrder, visibleColumns]
  );

  const exportColumns: GridExportColumn[] = useMemo(
    () =>
      displayColumns.map((key) => ({
        key,
        label: BASE_COLUMNS.find((column) => column.key === key)?.label ?? key,
      })),
    [displayColumns]
  );

  const exportRows = useMemo(
    () =>
      customers.map((row) =>
        Object.fromEntries(
          displayColumns.map((key) => {
            if (key === 'kind') return [key, SALES_DESK_CUSTOMER_KIND_LABELS[row.kind]];
            if (key === 'balance') return [key, row.balance];
            const value = row[key as keyof SalesDeskCustomerDto];
            return [key, value ?? ''];
          })
        )
      ),
    [customers, displayColumns]
  );

  const handleCreateClick = (): void => {
    setEditingCustomer(null);
    setFormOpen(true);
  };

  const handleEditClick = (customer: SalesDeskCustomerDto): void => {
    setEditingCustomer(customer);
    setFormOpen(true);
  };

  const handleFormSubmit = async (values: SalesDeskCustomerFormValues): Promise<void> => {
    if (editingCustomer) {
      await updateCustomer.mutateAsync({ id: editingCustomer.id, values });
      return;
    }
    await createCustomer.mutateAsync(values);
  };

  const handleDeleteConfirm = async (): Promise<void> => {
    if (!deletingCustomer) return;
    await deleteCustomer.mutateAsync(deletingCustomer.id);
    setDeletingCustomer(null);
  };

  const handleRefresh = useCallback((): void => {
    void refetch();
  }, [refetch]);

  const isSaving = createCustomer.isPending || updateCustomer.isPending;

  return (
    <div className="relative w-full space-y-6">
      <div className="flex flex-col justify-between gap-6 pt-2 md:flex-row md:items-center">
        <div className="space-y-1">
          <h1 className="text-3xl font-extrabold tracking-tight text-zinc-900 transition-colors dark:text-white">
            Cari Yonetimi
          </h1>
          <p className="flex items-center gap-2 text-sm font-medium text-zinc-500 dark:text-muted-foreground">
            <span className={`h-2 w-2 animate-pulse rounded-full ${SD_PAGE_PULSE}`} />
            Gelismis filtre, sutun tercihi ve sayfalama ile cari listesi
          </p>
        </div>
        <Button onClick={handleCreateClick} variant="ghost" className={ADD_BUTTON_CLASS}>
          <Plus size={20} className="mr-2 stroke-[3px]" />
          Yeni Cari Ekle
        </Button>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        {[
          { label: 'Toplam Cari', value: customerCount },
          { label: 'Musteri', value: musteriCount },
          { label: 'Tedarikci', value: tedarikciCount },
        ].map((metric) => (
          <div key={metric.label} className="min-h-[116px] rounded-2xl border border-[var(--crm-app-border)] bg-[color-mix(in_srgb,var(--crm-app-panel-strong)_72%,transparent)] p-5 backdrop-blur-xl">
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">{metric.label}</p>
            <p className="mt-3 text-3xl font-semibold text-slate-900 dark:text-white">{metric.value}</p>
          </div>
        ))}
      </div>

      <Card className={MANAGEMENT_LIST_CARD_CLASSNAME}>
        <CardHeader className={MANAGEMENT_LIST_CARD_HEADER_CLASSNAME}>
          <CardTitle className={MANAGEMENT_LIST_CARD_TITLE_CLASSNAME}>Cari Listesi</CardTitle>
          <DataTableActionBar
            accentTone="brand"
            pageKey={PAGE_KEY}
            userId={user?.id}
            columns={BASE_COLUMNS}
            visibleColumns={visibleColumns}
            columnOrder={columnOrder}
            onVisibleColumnsChange={setVisibleColumns}
            onColumnOrderChange={setColumnOrder}
            exportFileName="salesdesk-cariler"
            exportColumns={exportColumns}
            exportRows={exportRows}
            filterColumns={SALES_DESK_CUSTOMER_FILTER_COLUMNS}
            defaultFilterColumn="name"
            draftFilterRows={draftFilterRows}
            onDraftFilterRowsChange={setDraftFilterRows}
            onApplyFilters={() => setAppliedFilterRows(draftFilterRows)}
            onClearFilters={() => {
              setDraftFilterRows([]);
              setAppliedFilterRows([]);
            }}
            translationNamespace="customer-management"
            appliedFilterCount={appliedFilterCount}
            searchValue={searchTerm}
            searchPlaceholder="Ara"
            onSearchChange={setSearchTerm}
            compactSearchOnMobile
            refresh={{
              onRefresh: handleRefresh,
              isLoading: isFetching,
            }}
            leftSlot={
              <select
                className={cn(
                  'h-9 rounded-lg border border-slate-300 bg-white px-3 text-xs text-slate-700 shadow-sm dark:border-white/15 dark:bg-transparent dark:text-slate-200 sm:text-sm',
                  MANAGEMENT_TOOLBAR_OUTLINE_BUTTON_CLASSNAME
                )}
                value={pageSize}
                onChange={(event) => setPageSize(Number(event.target.value))}
              >
                {PAGE_SIZE_OPTIONS.map((size) => (
                  <option key={size} value={size}>
                    {size} / sayfa
                  </option>
                ))}
              </select>
            }
          />
        </CardHeader>

        <CardContent className={MANAGEMENT_LIST_CARD_CONTENT_CLASSNAME}>
          {isError && (
            <div className="mb-4 rounded-lg border border-rose-400/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-700 dark:text-rose-200">
              {(error as Error)?.message || 'Cari listesi yuklenemedi. API baglantisini kontrol edin.'}
            </div>
          )}

          <div className={MANAGEMENT_LIST_TABLE_SHELL_CLASSNAME}>
            <div className={MANAGEMENT_DATA_GRID_CLASSNAME}>
              <Table containerClassName="min-w-[820px]">
                <TableHeader>
                  <TableRow>
                    {displayColumns.map((key) => (
                      <TableHead key={key}>
                        {BASE_COLUMNS.find((column) => column.key === key)?.label ?? key}
                      </TableHead>
                    ))}
                    <TableHead className="text-right">Islem</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isLoading ? (
                    <TableRow>
                      <TableCell colSpan={displayColumns.length + 1} className="py-10 text-center text-slate-500">
                        <Loader2 className="mx-auto mb-2 animate-spin" size={24} />
                        Yukleniyor...
                      </TableCell>
                    </TableRow>
                  ) : customers.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={displayColumns.length + 1} className="py-10 text-center text-slate-500">
                        Kayit bulunamadi.
                      </TableCell>
                    </TableRow>
                  ) : (
                    customers.map((customer) => (
                      <TableRow key={customer.id}>
                        {displayColumns.map((key) => (
                          <TableCell key={key}>{renderCustomerCell(customer, key)}</TableCell>
                        ))}
                        <TableCell>
                          <div className="flex justify-end gap-3 text-slate-500">
                            <button
                              type="button"
                              className="transition hover:text-[var(--crm-brand-accent)]"
                              onClick={() => handleEditClick(customer)}
                              aria-label="Duzenle"
                            >
                              <Edit3 size={16} />
                            </button>
                            <button
                              type="button"
                              className="transition hover:text-red-600 dark:hover:text-red-400"
                              onClick={() => setDeletingCustomer(customer)}
                              aria-label="Sil"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </div>

          <div className="mt-4 flex flex-col gap-3 text-sm text-slate-500 md:flex-row md:items-center md:justify-between">
            <p>{totalCount === 0 ? 'Kayit yok' : `${startRow}-${endRow} / ${totalCount} kayit`}</p>
            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                disabled={pageNumber <= 1}
                onClick={() => setPageNumber((current) => Math.max(1, current - 1))}
                className={MANAGEMENT_TOOLBAR_OUTLINE_BUTTON_CLASSNAME}
              >
                <ChevronLeft size={16} className="mr-1" />
                Onceki
              </Button>
              <span className="px-2 text-slate-700 dark:text-slate-300">
                {pageNumber} / {totalPages}
              </span>
              <Button
                type="button"
                variant="outline"
                size="sm"
                disabled={pageNumber >= totalPages}
                onClick={() => setPageNumber((current) => Math.min(totalPages, current + 1))}
                className={MANAGEMENT_TOOLBAR_OUTLINE_BUTTON_CLASSNAME}
              >
                Sonraki
                <ChevronRight size={16} className="ml-1" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <SalesDeskCustomerForm
        open={formOpen}
        onOpenChange={setFormOpen}
        onSubmit={handleFormSubmit}
        customer={editingCustomer}
        isLoading={isSaving}
      />

      <SalesDeskCustomerDeleteDialog
        customer={deletingCustomer}
        open={deletingCustomer != null}
        onOpenChange={(open) => !open && setDeletingCustomer(null)}
        onConfirm={handleDeleteConfirm}
        isDeleting={deleteCustomer.isPending}
      />
    </div>
  );
}
