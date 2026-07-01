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

import { surfaceClass } from '../lib/salesdesk-shared';
import {
  SD_ADD_BUTTON,
  SD_FORM_INPUT,
  SD_PAGE_ICON_BOX,
  SD_PAGE_TITLE_BAR,
  SD_SECONDARY_BUTTON,
  SD_SURFACE_DIALOG,
  SD_TABLE_SHELL,
} from '../lib/salesdesk-popup-styles';
import {
  MANAGEMENT_LIST_CARD_CLASSNAME,
  MANAGEMENT_TOOLBAR_OUTLINE_BUTTON_CLASSNAME,
} from '@/lib/management-list-layout';

const PAGE_SIZE_OPTIONS = [10, 20, 50] as const;

function StatusBadge({ status }: { status: SalesDeskPotentialStatus }): ReactElement {
  const label = SALES_DESK_POTENTIAL_STATUS_LABELS[status];
  const tone =
    status === 2 || status === 4
      ? 'border-emerald-400/50 bg-emerald-500/10 text-emerald-300'
      : status === 3
        ? 'border-amber-400/50 bg-amber-500/10 text-amber-300'
        : status === 5
          ? 'border-[color-mix(in_srgb,var(--crm-brand-primary)_35%,transparent)] bg-[var(--crm-brand-soft)] text-[var(--crm-brand-on-soft)]'
          : status === 6
            ? 'border-rose-400/50 bg-rose-500/10 text-rose-300'
            : 'border-[color-mix(in_srgb,var(--crm-brand-primary)_35%,transparent)] bg-[var(--crm-brand-soft)] text-[var(--crm-brand-on-soft)]';

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
          <div className={SD_PAGE_ICON_BOX}>
            <Sparkles size={22} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className={SD_PAGE_TITLE_BAR} />
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
          className={SD_ADD_BUTTON}
        >
          <Plus size={16} />
          Potansiyel Ekle
        </button>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        <div className={`min-h-[116px] rounded-xl p-5 ${surfaceClass}`}>
          <p className="text-xs font-semibold uppercase text-slate-500">Toplam Potansiyel</p>
          <p className="mt-3 text-3xl font-semibold text-[var(--crm-brand-on-soft)]">{totalPotentialCount}</p>
        </div>
        <div className={`min-h-[116px] rounded-xl p-5 ${surfaceClass}`}>
          <p className="text-xs font-semibold uppercase text-slate-500">Bekleyen</p>
          <p className="mt-3 text-3xl font-semibold text-[var(--crm-brand-on-soft)]">{waitingCount}</p>
        </div>
        <div className={`min-h-[116px] rounded-xl p-5 ${surfaceClass}`}>
          <p className="text-xs font-semibold uppercase text-slate-500">Guclu Aday</p>
          <p className="mt-3 text-3xl font-semibold text-emerald-300">{strongCount}</p>
        </div>
      </div>

      <section className={`rounded-xl p-4 ${MANAGEMENT_LIST_CARD_CLASSNAME}`}>
        <h2 className="text-xl font-semibold text-slate-900 dark:text-white">Potansiyel Cari Listesi</h2>

        <div className="mt-3 flex flex-col gap-3 rounded-xl border border-[var(--crm-app-border)] bg-[var(--crm-app-list-card-header)] p-4 md:flex-row md:items-center md:justify-between">
          <div className="relative w-full md:max-w-xs">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--crm-app-text-muted)]" size={16} />
            <input
              className={`h-10 w-full pl-10 pr-3 ${SD_FORM_INPUT}`}
              placeholder="Ara"
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
            />
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <select
              className={`h-10 px-3 text-sm ${SD_FORM_INPUT} ${MANAGEMENT_TOOLBAR_OUTLINE_BUTTON_CLASSNAME}`}
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
              className={`inline-flex h-10 items-center gap-2 px-4 text-sm font-medium disabled:opacity-60 ${MANAGEMENT_TOOLBAR_OUTLINE_BUTTON_CLASSNAME} border-dashed hover:border-[var(--crm-brand-primary)] hover:bg-[var(--crm-brand-soft)] hover:text-[var(--crm-brand-on-soft)]`}
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

        <div className={`mt-4 ${SD_TABLE_SHELL}`}>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[820px] text-left text-sm">
              <thead className="border-b border-[var(--crm-app-border)] bg-[var(--crm-app-table-head)] text-xs uppercase text-slate-300">
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
                      className="border-b border-[var(--crm-app-border)] text-slate-300 last:border-b-0 hover:bg-[var(--crm-app-table-row-hover)]"
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
                            className="transition hover:text-[var(--crm-brand-on-soft)]"
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
              className={`inline-flex h-9 items-center gap-1 px-3 disabled:opacity-40 ${MANAGEMENT_TOOLBAR_OUTLINE_BUTTON_CLASSNAME}`}
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
              className={`inline-flex h-9 items-center gap-1 px-3 disabled:opacity-40 ${MANAGEMENT_TOOLBAR_OUTLINE_BUTTON_CLASSNAME}`}
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
        <AlertDialogContent className={SD_SURFACE_DIALOG}>
          <AlertDialogHeader>
            <AlertDialogTitle>Potansiyel cariyi sil</AlertDialogTitle>
            <AlertDialogDescription className="text-[var(--crm-app-text-muted)]">
              {deletingPotential
                ? `"${deletingPotential.companyName}" kaydini silmek istediginize emin misiniz?`
                : 'Bu islem geri alinamaz.'}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className={SD_SECONDARY_BUTTON}>Iptal</AlertDialogCancel>
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
