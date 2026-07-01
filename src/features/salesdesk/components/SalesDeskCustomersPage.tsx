import { type ReactElement, useEffect, useMemo, useState } from 'react';
import {
  BriefcaseBusiness,
  ChevronLeft,
  ChevronRight,
  Edit3,
  Loader2,
  Plus,
  RefreshCw,
  Search,
  Trash2,
} from 'lucide-react';
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
import type { SalesDeskCustomerDto } from '../api/salesdesk-api';
import { SalesDeskCustomerForm } from './SalesDeskCustomerForm';
import {
  useCreateSalesDeskCustomer,
  useDeleteSalesDeskCustomer,
  useSalesDeskCustomerList,
  useSalesDeskCustomerStats,
  useUpdateSalesDeskCustomer,
} from '../hooks/useSalesDeskCustomers';
import {
  formatCustomerBalance,
  SALES_DESK_CUSTOMER_KIND_LABELS,
  type SalesDeskCustomerFormValues,
} from '../types/customer-types';

const surfaceClass =
  'border border-white/10 bg-[#0d1222]/72 shadow-[inset_0_1px_0_rgba(255,255,255,.04),0_18px_48px_rgba(0,0,0,.18)] backdrop-blur-xl';

const PAGE_SIZE_OPTIONS = [10, 20, 50] as const;

function KindBadge({ kind }: { kind: SalesDeskCustomerDto['kind'] }): ReactElement {
  const label = SALES_DESK_CUSTOMER_KIND_LABELS[kind];
  const tone =
    kind === 1
      ? 'border-emerald-400/50 bg-emerald-500/10 text-emerald-300'
      : kind === 2
        ? 'border-amber-400/50 bg-amber-500/10 text-amber-300'
        : 'border-violet-400/40 bg-violet-500/10 text-violet-200';

  return <span className={`rounded-md border px-2 py-1 text-xs font-semibold ${tone}`}>{label}</span>;
}

export function SalesDeskCustomersPage(): ReactElement {
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [pageNumber, setPageNumber] = useState(1);
  const [pageSize, setPageSize] = useState<number>(10);
  const [formOpen, setFormOpen] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<SalesDeskCustomerDto | null>(null);
  const [deletingCustomer, setDeletingCustomer] = useState<SalesDeskCustomerDto | null>(null);

  useEffect(() => {
    const timer = window.setTimeout(() => setDebouncedSearch(searchTerm.trim()), 300);
    return () => window.clearTimeout(timer);
  }, [searchTerm]);

  useEffect(() => {
    setPageNumber(1);
  }, [debouncedSearch, pageSize]);

  const listParams = useMemo(
    () => ({
      pageNumber,
      pageSize,
      search: debouncedSearch || undefined,
      sortBy: 'Name',
      sortDirection: 'asc',
    }),
    [pageNumber, pageSize, debouncedSearch]
  );

  const { data, isLoading, isFetching, isError, error, refetch } = useSalesDeskCustomerList(listParams);
  const { data: statsData } = useSalesDeskCustomerStats();
  const createCustomer = useCreateSalesDeskCustomer();
  const updateCustomer = useUpdateSalesDeskCustomer();
  const deleteCustomer = useDeleteSalesDeskCustomer();

  const customers = data?.data ?? [];
  const totalCount = data?.totalCount ?? 0;
  const totalPages = Math.max(1, data?.totalPages ?? 1);
  const startRow = totalCount === 0 ? 0 : (pageNumber - 1) * pageSize + 1;
  const endRow = totalCount === 0 ? 0 : Math.min(pageNumber * pageSize, totalCount);

  const statsRows = statsData?.data ?? [];
  const customerCount = statsData?.totalCount ?? totalCount;
  const musteriCount = statsRows.filter((item) => item.kind === 1 || item.kind === 3).length;
  const tedarikciCount = statsRows.filter((item) => item.kind === 2 || item.kind === 3).length;

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

  const isSaving = createCustomer.isPending || updateCustomer.isPending;

  return (
    <div className="space-y-5 text-slate-100">
      <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
        <div className="flex items-start gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-violet-400/20 bg-violet-500/15 text-violet-300 shadow-[0_0_28px_rgba(124,58,237,.18)]">
            <BriefcaseBusiness size={22} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="h-7 w-1 rounded-full bg-violet-500 shadow-[0_0_24px_rgba(139,92,246,.7)]" />
              <h1 className="text-2xl font-semibold tracking-normal text-slate-50">Cari Yonetimi</h1>
            </div>
            <p className="mt-1 text-sm text-slate-400">
              Gelismis filtre, sutun tercihi ve sayfalama ile cari listesi
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={handleCreateClick}
          className="inline-flex h-11 items-center gap-2 rounded-lg bg-violet-500 px-5 text-sm font-semibold text-white shadow-lg shadow-violet-950/40 hover:bg-violet-400"
        >
          <Plus size={16} />
          Yeni Cari Ekle
        </button>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        <div className={`min-h-[116px] rounded-xl p-5 ${surfaceClass}`}>
          <p className="text-xs font-semibold uppercase text-slate-500">Toplam Cari</p>
          <p className="mt-3 text-3xl font-semibold text-blue-300">{customerCount}</p>
        </div>
        <div className={`min-h-[116px] rounded-xl p-5 ${surfaceClass}`}>
          <p className="text-xs font-semibold uppercase text-slate-500">Musteri</p>
          <p className="mt-3 text-3xl font-semibold text-emerald-300">{musteriCount}</p>
        </div>
        <div className={`min-h-[116px] rounded-xl p-5 ${surfaceClass}`}>
          <p className="text-xs font-semibold uppercase text-slate-500">Tedarikci</p>
          <p className="mt-3 text-3xl font-semibold text-amber-300">{tedarikciCount}</p>
        </div>
      </div>

      <section className="rounded-xl border border-white/8 bg-slate-900/35 p-4">
        <h2 className="text-xl font-semibold">Cari Listesi</h2>

        <div className="mt-3 flex flex-col gap-3 rounded-xl border border-white/10 bg-[#0a0f1e]/70 p-4 md:flex-row md:items-center md:justify-between">
          <div className="relative w-full md:max-w-xs">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
            <input
              className="h-10 w-full rounded-lg border border-white/10 bg-[#050711]/80 pl-10 pr-3 text-sm text-slate-200 outline-none transition focus:border-violet-400/70 focus:ring-4 focus:ring-violet-500/10"
              placeholder="Ara"
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
            />
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <select
              className="h-10 rounded-lg border border-white/10 bg-[#050711]/80 px-3 text-sm text-slate-200 outline-none"
              value={pageSize}
              onChange={(event) => setPageSize(Number(event.target.value))}
            >
              {PAGE_SIZE_OPTIONS.map((size) => (
                <option key={size} value={size}>
                  {size} / sayfa
                </option>
              ))}
            </select>
            <button
              type="button"
              onClick={() => refetch()}
              disabled={isFetching}
              className="inline-flex h-10 items-center gap-2 rounded-lg border border-dashed border-white/20 bg-white/[.02] px-4 text-sm font-medium text-slate-200 hover:border-violet-400/60 hover:bg-violet-500/10 hover:text-white disabled:opacity-60"
            >
              {isFetching ? <Loader2 size={15} className="animate-spin" /> : <RefreshCw size={15} />}
              Yenile
            </button>
          </div>
        </div>

        {isError && (
          <div className="mt-4 rounded-lg border border-rose-400/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-200">
            {(error as Error)?.message || 'Cari listesi yuklenemedi. API baglantisini kontrol edin.'}
          </div>
        )}

        <div className="mt-4 overflow-hidden rounded-xl border border-white/10 bg-[#070a13]/72">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[820px] text-left text-sm">
              <thead className="border-b border-white/10 bg-white/[.025] text-xs uppercase text-slate-300">
                <tr>
                  {['KOD', 'CARI ADI', 'YETKILI', 'TELEFON', 'E-POSTA', 'TIP', 'BAKIYE', 'IL'].map((column) => (
                    <th key={column} className="px-4 py-4 font-semibold">
                      {column}
                    </th>
                  ))}
                  <th className="px-4 py-4 text-right font-semibold">Islem</th>
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  <tr>
                    <td colSpan={9} className="px-4 py-10 text-center text-slate-400">
                      <Loader2 className="mx-auto mb-2 animate-spin" size={24} />
                      Yukleniyor...
                    </td>
                  </tr>
                ) : customers.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="px-4 py-10 text-center text-slate-400">
                      Kayit bulunamadi.
                    </td>
                  </tr>
                ) : (
                  customers.map((customer) => (
                    <tr
                      key={customer.id}
                      className="border-b border-white/10 text-slate-300 last:border-b-0 hover:bg-white/[.025]"
                    >
                      <td className="px-4 py-3">{customer.code}</td>
                      <td className="px-4 py-3 font-semibold text-slate-100">{customer.name}</td>
                      <td className="px-4 py-3">{customer.contactName || '-'}</td>
                      <td className="px-4 py-3">{customer.phone || '-'}</td>
                      <td className="px-4 py-3">{customer.email || '-'}</td>
                      <td className="px-4 py-3">
                        <KindBadge kind={customer.kind} />
                      </td>
                      <td className="px-4 py-3">{formatCustomerBalance(customer.balance)}</td>
                      <td className="px-4 py-3">{customer.city || '-'}</td>
                      <td className="px-4 py-3">
                        <div className="flex justify-end gap-3 text-slate-500">
                          <button
                            type="button"
                            className="transition hover:text-violet-300"
                            onClick={() => handleEditClick(customer)}
                            aria-label="Duzenle"
                          >
                            <Edit3 size={16} />
                          </button>
                          <button
                            type="button"
                            className="transition hover:text-rose-300"
                            onClick={() => setDeletingCustomer(customer)}
                            aria-label="Sil"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="mt-4 flex flex-col gap-3 text-sm text-slate-400 md:flex-row md:items-center md:justify-between">
          <p>
            {totalCount === 0 ? 'Kayit yok' : `${startRow}-${endRow} / ${totalCount} kayit`}
          </p>
          <div className="flex items-center gap-2">
            <button
              type="button"
              disabled={pageNumber <= 1}
              onClick={() => setPageNumber((current) => Math.max(1, current - 1))}
              className="inline-flex h-9 items-center gap-1 rounded-lg border border-white/10 px-3 text-slate-200 disabled:opacity-40"
            >
              <ChevronLeft size={16} />
              Onceki
            </button>
            <span className="px-2 text-slate-300">
              {pageNumber} / {totalPages}
            </span>
            <button
              type="button"
              disabled={pageNumber >= totalPages}
              onClick={() => setPageNumber((current) => Math.min(totalPages, current + 1))}
              className="inline-flex h-9 items-center gap-1 rounded-lg border border-white/10 px-3 text-slate-200 disabled:opacity-40"
            >
              Sonraki
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      </section>

      <SalesDeskCustomerForm
        open={formOpen}
        onOpenChange={setFormOpen}
        onSubmit={handleFormSubmit}
        customer={editingCustomer}
        isLoading={isSaving}
      />

      <AlertDialog open={deletingCustomer != null} onOpenChange={(open) => !open && setDeletingCustomer(null)}>
        <AlertDialogContent className="border border-white/10 bg-[#0a0f1e] text-slate-100">
          <AlertDialogHeader>
            <AlertDialogTitle>Cariyi sil</AlertDialogTitle>
            <AlertDialogDescription className="text-slate-400">
              {deletingCustomer
                ? `"${deletingCustomer.name}" kaydini silmek istediginize emin misiniz?`
                : 'Bu islem geri alinamaz.'}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="border-white/10 bg-transparent text-slate-200 hover:bg-white/5">
              Iptal
            </AlertDialogCancel>
            <AlertDialogAction
              className="bg-rose-600 hover:bg-rose-500"
              onClick={handleDeleteConfirm}
              disabled={deleteCustomer.isPending}
            >
              {deleteCustomer.isPending ? 'Siliniyor...' : 'Sil'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
