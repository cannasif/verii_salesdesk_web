import { type ReactElement, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { ArrowDown, ArrowUp, ArrowUpDown, Building2, Plus, Truck, UsersRound } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { DataTableActionBar, ManagementDataTableChrome, type DataTableGridColumn } from '@/components/shared';
import type { ColumnDef } from '@/components/shared/ColumnPreferencesPopover';
import { loadColumnPreferences, saveColumnPreferences } from '@/lib/column-preferences';
import type { FilterRow } from '@/lib/advanced-filter-types';
import type { GridExportColumn } from '@/lib/grid-export';
import {
  MANAGEMENT_LIST_CARD_CLASSNAME,
  MANAGEMENT_LIST_CARD_CONTENT_CLASSNAME,
  MANAGEMENT_LIST_CARD_HEADER_CLASSNAME,
  MANAGEMENT_LIST_CARD_TITLE_CLASSNAME,
  MANAGEMENT_LIST_ID_COLUMN_CELL_CLASSNAME,
  MANAGEMENT_LIST_ID_COLUMN_HEAD_CLASSNAME,
  MANAGEMENT_LIST_TABLE_SHELL_CLASSNAME,
} from '@/lib/management-list-layout';
import { loadTableSortPreference, saveTableSortPreference } from '@/lib/table-sort-preferences';
import { arraysEqual } from '@/lib/utils';
import { useAuthStore } from '@/stores/auth-store';
import type { SalesDeskCustomerDto } from '../api/salesdesk-api';
import { SD_PAGE_ADD_BUTTON, SD_PAGE_HEADER_ROW, SD_PAGE_PULSE, SD_PAGE_TITLE } from '../lib/salesdesk-popup-styles';
import { SalesDeskCustomerDeleteDialog } from './SalesDeskCustomerDeleteDialog';
import { SalesDeskCustomerForm } from './SalesDeskCustomerForm';
import { SalesDeskKpiCards } from './SalesDeskKpiCards';
import {
  SalesDeskCustomerTable,
  type SalesDeskCustomerColumnKey,
} from './SalesDeskCustomerTable';
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

const DEFAULT_SORT_BY: SalesDeskCustomerColumnKey = 'name';
const DEFAULT_SORT_DIRECTION: 'asc' | 'desc' = 'asc';

const SORT_API_FIELD: Record<SalesDeskCustomerColumnKey, string> = {
  id: 'Id',
  code: 'Code',
  name: 'Name',
  contactName: 'ContactName',
  phone: 'Phone',
  email: 'Email',
  kind: 'Kind',
  balance: 'Balance',
  city: 'City',
};

const BASE_COLUMNS: ColumnDef[] = [
  { key: 'id', label: 'ID' },
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

function renderCustomerCell(row: SalesDeskCustomerDto, key: SalesDeskCustomerColumnKey): ReactElement | string {
  switch (key) {
    case 'id':
      return <span className="tabular-nums">{row.id}</span>;
    case 'code':
      return row.code;
    case 'name':
      return <span className="font-bold text-slate-900 dark:text-white">{row.name}</span>;
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

  const defaultColumnKeys = DEFAULT_COLUMN_ORDER;
  const [sortBy, setSortBy] = useState<SalesDeskCustomerColumnKey>(() => {
    const prefs = loadTableSortPreference(
      PAGE_KEY,
      user?.id,
      { sortBy: DEFAULT_SORT_BY, sortDirection: DEFAULT_SORT_DIRECTION },
      defaultColumnKeys
    );
    return prefs.sortBy as SalesDeskCustomerColumnKey;
  });
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>(() => {
    const prefs = loadTableSortPreference(
      PAGE_KEY,
      user?.id,
      { sortBy: DEFAULT_SORT_BY, sortDirection: DEFAULT_SORT_DIRECTION },
      defaultColumnKeys
    );
    return prefs.sortDirection;
  });

  const [visibleColumns, setVisibleColumns] = useState<string[]>(() =>
    loadColumnPreferences(PAGE_KEY, user?.id, DEFAULT_COLUMN_ORDER, 'id', true).visibleKeys
  );
  const [columnOrder, setColumnOrder] = useState<string[]>(() =>
    loadColumnPreferences(PAGE_KEY, user?.id, DEFAULT_COLUMN_ORDER, 'id', true).order
  );

  const prevParamsRef = useRef({ pageSize, debouncedSearch, appliedFilterRows, sortBy, sortDirection });

  useEffect(() => {
    const timer = window.setTimeout(() => setDebouncedSearch(searchTerm.trim()), 700);
    return () => window.clearTimeout(timer);
  }, [searchTerm]);

  useEffect(() => {
    const prefs = loadColumnPreferences(PAGE_KEY, user?.id, DEFAULT_COLUMN_ORDER, 'id', true);
    setVisibleColumns((current) => (arraysEqual(current, prefs.visibleKeys) ? current : prefs.visibleKeys));
    setColumnOrder((current) => (arraysEqual(current, prefs.order) ? current : prefs.order));
  }, [user?.id]);

  useEffect(() => {
    saveColumnPreferences(PAGE_KEY, user?.id, { visibleKeys: visibleColumns, order: columnOrder });
  }, [visibleColumns, columnOrder, user?.id]);

  useEffect(() => {
    const paramsChanged =
      prevParamsRef.current.pageSize !== pageSize ||
      prevParamsRef.current.debouncedSearch !== debouncedSearch ||
      prevParamsRef.current.sortBy !== sortBy ||
      prevParamsRef.current.sortDirection !== sortDirection ||
      JSON.stringify(prevParamsRef.current.appliedFilterRows) !== JSON.stringify(appliedFilterRows);

    if (paramsChanged) {
      setPageNumber((current) => (current === 1 ? current : 1));
      prevParamsRef.current = { pageSize, debouncedSearch, appliedFilterRows, sortBy, sortDirection };
    }
  }, [pageSize, debouncedSearch, appliedFilterRows, sortBy, sortDirection]);

  const listParams = useMemo(
    () => ({
      pageNumber,
      pageSize,
      search: debouncedSearch || undefined,
      sortBy: SORT_API_FIELD[sortBy],
      sortDirection,
    }),
    [pageNumber, pageSize, debouncedSearch, sortBy, sortDirection]
  );

  const { data, isLoading, isFetching, isError, error, refetch } = useSalesDeskCustomerList(listParams);
  const { data: statsData, isLoading: statsLoading } = useSalesDeskCustomerStats();
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

  const kpiShareHint = (count: number): string | undefined =>
    customerCount > 0 ? `%${Math.round((count / customerCount) * 100)} pay` : undefined;

  const appliedFilterCount = appliedFilterRows.filter((row) => row.value.trim()).length;

  const orderedVisibleColumns = useMemo(
    () => columnOrder.filter((key) => visibleColumns.includes(key)) as SalesDeskCustomerColumnKey[],
    [columnOrder, visibleColumns]
  );

  const gridColumns = useMemo<DataTableGridColumn<SalesDeskCustomerColumnKey>[]>(
    () =>
      BASE_COLUMNS.map((column) => ({
        key: column.key as SalesDeskCustomerColumnKey,
        label: column.label,
        sortable: true,
        headClassName: column.key === 'id' ? MANAGEMENT_LIST_ID_COLUMN_HEAD_CLASSNAME : undefined,
        cellClassName: column.key === 'id' ? MANAGEMENT_LIST_ID_COLUMN_CELL_CLASSNAME : undefined,
      })),
    []
  );

  const exportColumns: GridExportColumn[] = useMemo(
    () =>
      orderedVisibleColumns.map((key) => ({
        key,
        label: BASE_COLUMNS.find((column) => column.key === key)?.label ?? key,
      })),
    [orderedVisibleColumns]
  );

  const exportRows = useMemo(
    () =>
      customers.map((row) =>
        Object.fromEntries(
          orderedVisibleColumns.map((key) => {
            if (key === 'kind') return [key, SALES_DESK_CUSTOMER_KIND_LABELS[row.kind]];
            if (key === 'balance') return [key, row.balance];
            const value = row[key as keyof SalesDeskCustomerDto];
            return [key, value ?? ''];
          })
        )
      ),
    [customers, orderedVisibleColumns]
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

  const handleSort = useCallback(
    (key: SalesDeskCustomerColumnKey): void => {
      let nextBy: SalesDeskCustomerColumnKey = sortBy;
      let nextDir: 'asc' | 'desc' = sortDirection;
      if (sortBy === key) {
        nextDir = sortDirection === 'asc' ? 'desc' : 'asc';
        setSortDirection(nextDir);
      } else {
        nextBy = key;
        nextDir = 'asc';
        setSortBy(key);
        setSortDirection('asc');
      }
      saveTableSortPreference(PAGE_KEY, user?.id, {
        sortBy: nextBy,
        sortDirection: nextDir,
      });
    },
    [sortBy, sortDirection, user?.id]
  );

  const renderSortIcon = useCallback(
    (key: SalesDeskCustomerColumnKey): ReactElement => {
      if (sortBy !== key) {
        return <ArrowUpDown className="h-3.5 w-3.5 text-muted-foreground/70" />;
      }
      return sortDirection === 'asc' ? (
        <ArrowUp className="h-3.5 w-3.5 text-foreground" />
      ) : (
        <ArrowDown className="h-3.5 w-3.5 text-foreground" />
      );
    },
    [sortBy, sortDirection]
  );

  const isSaving = createCustomer.isPending || updateCustomer.isPending;

  return (
    <div className="relative w-full space-y-6">
      <div className={SD_PAGE_HEADER_ROW}>
        <div className="space-y-1">
          <h1 className={SD_PAGE_TITLE}>Cari Yonetimi</h1>
          <p className="flex items-center gap-2 text-sm font-medium text-zinc-500 dark:text-muted-foreground">
            <span className={`h-2 w-2 animate-pulse rounded-full ${SD_PAGE_PULSE}`} />
            Gelismis filtre, sutun tercihi ve sayfalama ile cari listesi
          </p>
        </div>
        <Button onClick={handleCreateClick} className={SD_PAGE_ADD_BUTTON}>
          <Plus size={20} className="mr-2 stroke-[3px]" />
          Yeni Cari Ekle
        </Button>
      </div>

      <SalesDeskKpiCards
        isLoading={statsLoading}
        items={[
          {
            key: 'total',
            label: 'Toplam Cari',
            value: customerCount,
            hint: 'Sistemdeki tum cari kayitlari',
            tone: 'brand',
            icon: UsersRound,
          },
          {
            key: 'musteri',
            label: 'Musteri',
            value: musteriCount,
            hint: kpiShareHint(musteriCount),
            tone: 'emerald',
            icon: Building2,
          },
          {
            key: 'tedarikci',
            label: 'Tedarikci',
            value: tedarikciCount,
            hint: kpiShareHint(tedarikciCount),
            tone: 'amber',
            icon: Truck,
          },
        ]}
      />

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
          />
        </CardHeader>

        <CardContent className={MANAGEMENT_LIST_CARD_CONTENT_CLASSNAME}>
          <div className={MANAGEMENT_LIST_TABLE_SHELL_CLASSNAME}>
            <ManagementDataTableChrome>
              <SalesDeskCustomerTable
                columns={gridColumns}
                visibleColumnKeys={orderedVisibleColumns}
                rows={customers}
                sortBy={sortBy}
                sortDirection={sortDirection}
                onSort={handleSort}
                renderSortIcon={renderSortIcon}
                renderCell={renderCustomerCell}
                isLoading={isLoading && !isError}
                isError={isError}
                loadingText="Yukleniyor..."
                errorText={(error as Error)?.message || 'Cari listesi yuklenemedi. API baglantisini kontrol edin.'}
                emptyText="Kayit bulunamadi."
                onEdit={handleEditClick}
                onDelete={setDeletingCustomer}
                pageSize={pageSize}
                pageSizeOptions={PAGE_SIZE_OPTIONS}
                onPageSizeChange={(size) => {
                  setPageSize(size);
                  setPageNumber(1);
                }}
                pageNumber={pageNumber}
                totalPages={totalPages}
                hasPreviousPage={data?.hasPreviousPage ?? pageNumber > 1}
                hasNextPage={data?.hasNextPage ?? pageNumber < totalPages}
                onPreviousPage={() => setPageNumber((current) => Math.max(1, current - 1))}
                onNextPage={() => setPageNumber((current) => Math.min(totalPages, current + 1))}
                previousLabel="Onceki"
                nextLabel="Sonraki"
                paginationInfoText={
                  totalCount === 0 ? 'Kayit yok' : `${startRow}–${endRow} / ${totalCount}`
                }
                onColumnOrderChange={(newVisibleOrder) => {
                  setColumnOrder((currentOrder) => {
                    const hiddenCols = currentOrder.filter((key) => !newVisibleOrder.includes(key as SalesDeskCustomerColumnKey));
                    const finalOrder = [...newVisibleOrder, ...hiddenCols];
                    saveColumnPreferences(PAGE_KEY, user?.id, { visibleKeys: visibleColumns, order: finalOrder });
                    return finalOrder;
                  });
                }}
              />
            </ManagementDataTableChrome>
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
