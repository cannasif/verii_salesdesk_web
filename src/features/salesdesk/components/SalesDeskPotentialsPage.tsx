import { type ReactElement, useEffect, useMemo, useState } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  Edit3,
  Loader2,
  Plus,
  RefreshCw,
  Search,
  Sparkles,
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
import type { SalesDeskPotentialCustomerDto, SalesDeskPotentialStatus } from '../api/salesdesk-api';
import { SalesDeskPotentialForm } from './SalesDeskPotentialForm';
import {
  useCreateSalesDeskPotential,
  useDeleteSalesDeskPotential,
  useSalesDeskPotentialList,
  useSalesDeskPotentialStats,
  useUpdateSalesDeskPotential,
} from '../hooks/useSalesDeskPotentials';
import {
  SALES_DESK_POTENTIAL_STATUS_LABELS,
  type SalesDeskPotentialFormValues,
} from '../types/potential-types';

const surfaceClass =
  'border border-white/10 bg-[#0d1222]/72 shadow-[inset_0_1px_0_rgba(255,255,255,.04),0_18px_48px_rgba(0,0,0,.18)] backdrop-blur-xl';

const PAGE_SIZE_OPTIONS = [10, 20, 50] as const;

function StatusBadge({ status }: { status: SalesDeskPotentialStatus }): ReactElement {
  const label = SALES_DESK_POTENTIAL_STATUS_LABELS[status];
  const tone =
    status === 2 || status === 4
      ? 'border-emerald-400/50 bg-emerald-500/10 text-emerald-300'
      : status === 3
        ? 'border-amber-400/50 bg-amber-500/10 text-amber-300'
        : status === 5
          ? 'border-cyan-400/50 bg-cyan-500/10 text-cyan-300'
          : status === 6
            ? 'border-rose-400/50 bg-rose-500/10 text-rose-300'
            : 'border-violet-400/40 bg-violet-500/10 text-violet-200';

  return <span className={`rounded-md border px-2 py-1 text-xs font-semibold ${tone}`}>{label}</span>;
}

export function SalesDeskPotentialsPage(): ReactElement {
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [pageNumber, setPageNumber] = useState(1);
  const [pageSize, setPageSize] = useState<number>(10);
  const [formOpen, setFormOpen] = useState(false);
  const [editingPotential, setEditingPotential] = useState<SalesDeskPotentialCustomerDto | null>(null);
  const [deletingPotential, setDeletingPotential] = useState<SalesDeskPotentialCustomerDto | null>(null);

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
      sortBy: 'CompanyName',
      sortDirection: 'asc',
    }),
    [pageNumber, pageSize, debouncedSearch]
  );

  const { data, isLoading, isFetching, isError, error, refetch } = useSalesDeskPotentialList(listParams);
  const { data: statsData } = useSalesDeskPotentialStats();
  const createPotential = useCreateSalesDeskPotential();
  const updatePotential = useUpdateSalesDeskPotential();
  const deletePotential = useDeleteSalesDeskPotential();

  const potentials = data?.data ?? [];
  const totalCount = data?.totalCount ?? 0;
  const totalPages = Math.max(1, data?.totalPages ?? 1);
  const startRow = totalCount === 0 ? 0 : (pageNumber - 1) * pageSize + 1;
  const endRow = totalCount === 0 ? 0 : Math.min(pageNumber * pageSize, totalCount);

  const statsRows = statsData?.data ?? [];
  const totalPotentialCount = statsData?.totalCount ?? totalCount;
  const waitingCount = statsRows.filter((item) => item.status === 1).length;
  const strongCount = statsRows.filter((item) => item.status === 4).length;

  const handleCreateClick = (): void => {
    setEditingPotential(null);
    setFormOpen(true);
  };

  const handleEditClick = (potential: SalesDeskPotentialCustomerDto): void => {
    setEditingPotential(potential);
    setFormOpen(true);
  };

  const handleFormSubmit = async (values: SalesDeskPotentialFormValues): Promise<void> => {
    if (editingPotential) {
      await updatePotential.mutateAsync({ id: editingPotential.id, values });
      return;
    }
    await createPotential.mutateAsync(values);
  };

  const handleDeleteConfirm = async (): Promise<void> => {
    if (!deletingPotential) return;
    await deletePotential.mutateAsync(deletingPotential.id);
    setDeletingPotential(null);
  };

  const isSaving = createPotential.isPending || updatePotential.isPending;

  return (
    <div className="space-y-5 text-slate-100">
      <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
        <div className="flex items-start gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-pink-400/20 bg-pink-500/15 text-pink-300 shadow-[0_0_28px_rgba(236,72,153,.18)]">
            <Sparkles size={22} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="h-7 w-1 rounded-full bg-pink-500 shadow-[0_0_24px_rgba(236,72,153,.7)]" />
              <h1 className="text-2xl font-semibold tracking-normal text-slate-50">Potansiyel Cariler</h1>
            </div>
            <p className="mt-1 text-sm text-slate-400">
              Gelismis filtre, sutun tercihi ve sayfalama ile potansiyel cari listesi
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={handleCreateClick}
          className="inline-flex h-11 items-center gap-2 rounded-lg bg-violet-500 px-5 text-sm font-semibold text-white shadow-lg shadow-violet-950/40 hover:bg-violet-400"
        >
          <Plus size={16} />
          Potansiyel Ekle
        </button>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        <div className={`min-h-[116px] rounded-xl p-5 ${surfaceClass}`}>
          <p className="text-xs font-semibold uppercase text-slate-500">Toplam Potansiyel</p>
          <p className="mt-3 text-3xl font-semibold text-blue-300">{totalPotentialCount}</p>
        </div>
        <div className={`min-h-[116px] rounded-xl p-5 ${surfaceClass}`}>
          <p className="text-xs font-semibold uppercase text-slate-500">Bekleyen</p>
          <p className="mt-3 text-3xl font-semibold text-violet-300">{waitingCount}</p>
        </div>
        <div className={`min-h-[116px] rounded-xl p-5 ${surfaceClass}`}>
          <p className="text-xs font-semibold uppercase text-slate-500">Guclu Aday</p>
          <p className="mt-3 text-3xl font-semibold text-emerald-300">{strongCount}</p>
        </div>
      </div>

      <section className="rounded-xl border border-white/8 bg-slate-900/35 p-4">
        <h2 className="text-xl font-semibold">Potansiyel Cari Listesi</h2>

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
            {(error as Error)?.message || 'Potansiyel cari listesi yuklenemedi. API baglantisini kontrol edin.'}
          </div>
        )}

        <div className="mt-4 overflow-hidden rounded-xl border border-white/10 bg-[#070a13]/72">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[820px] text-left text-sm">
              <thead className="border-b border-white/10 bg-white/[.025] text-xs uppercase text-slate-300">
                <tr>
                  {['KOD', 'CARI ADI', 'YETKILI', 'TELEFON', 'E-POSTA', 'DURUM', 'IL', 'ILCE'].map((column) => (
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
                ) : potentials.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="px-4 py-10 text-center text-slate-400">
                      Kayit bulunamadi.
                    </td>
                  </tr>
                ) : (
                  potentials.map((potential) => (
                    <tr
                      key={potential.id}
                      className="border-b border-white/10 text-slate-300 last:border-b-0 hover:bg-white/[.025]"
                    >
                      <td className="px-4 py-3">{potential.code}</td>
                      <td className="px-4 py-3 font-semibold text-slate-100">{potential.companyName}</td>
                      <td className="px-4 py-3">{potential.contactName || '-'}</td>
                      <td className="px-4 py-3">{potential.phone || '-'}</td>
                      <td className="px-4 py-3">{potential.email || '-'}</td>
                      <td className="px-4 py-3">
                        <StatusBadge status={potential.status} />
                      </td>
                      <td className="px-4 py-3">{potential.city || '-'}</td>
                      <td className="px-4 py-3">{potential.district || '-'}</td>
                      <td className="px-4 py-3">
                        <div className="flex justify-end gap-3 text-slate-500">
                          <button
                            type="button"
                            className="transition hover:text-violet-300"
                            onClick={() => handleEditClick(potential)}
                            aria-label="Duzenle"
                          >
                            <Edit3 size={16} />
                          </button>
                          <button
                            type="button"
                            className="transition hover:text-rose-300"
                            onClick={() => setDeletingPotential(potential)}
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
          <p>{totalCount === 0 ? 'Kayit yok' : `${startRow}-${endRow} / ${totalCount} kayit`}</p>
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

      <SalesDeskPotentialForm
        open={formOpen}
        onOpenChange={setFormOpen}
        onSubmit={handleFormSubmit}
        potential={editingPotential}
        isLoading={isSaving}
      />

      <AlertDialog open={deletingPotential != null} onOpenChange={(open) => !open && setDeletingPotential(null)}>
        <AlertDialogContent className="border border-white/10 bg-[#0a0f1e] text-slate-100">
          <AlertDialogHeader>
            <AlertDialogTitle>Potansiyel cariyi sil</AlertDialogTitle>
            <AlertDialogDescription className="text-slate-400">
              {deletingPotential
                ? `"${deletingPotential.companyName}" kaydini silmek istediginize emin misiniz?`
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
              disabled={deletePotential.isPending}
            >
              {deletePotential.isPending ? 'Siliniyor...' : 'Sil'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
