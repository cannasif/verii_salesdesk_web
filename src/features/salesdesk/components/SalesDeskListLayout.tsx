import { type ReactElement, type ReactNode } from 'react';
import {
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
import { PAGE_SIZE_OPTIONS, surfaceClass } from '../lib/salesdesk-shared';

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
  icon: ReactNode;
  accentClass?: string;
  metrics: SalesDeskMetric[];
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
  onPageChange: (page: number) => void;
  onRefresh: () => void;
  onAdd: () => void;
  onEdit: (row: T) => void;
  onDeleteRequest: (row: T) => void;
  deletingRow: T | null;
  onDeleteConfirm: () => void | Promise<void>;
  onDeleteCancel: () => void;
  isDeleting?: boolean;
  deleteLabel?: (row: T) => string;
  formDialog?: ReactNode;
  emptyMessage?: string;
}

const metricTone: Record<NonNullable<SalesDeskMetric['tone']>, string> = {
  blue: 'text-blue-300',
  green: 'text-emerald-300',
  yellow: 'text-amber-300',
  red: 'text-rose-300',
  violet: 'text-violet-300',
  pink: 'text-pink-300',
  cyan: 'text-cyan-300',
};

export function SalesDeskListLayout<T extends { id: number }>({
  title,
  subtitle,
  tableTitle,
  actionLabel,
  icon,
  accentClass = 'border-violet-400/20 bg-violet-500/15 text-violet-300 shadow-[0_0_28px_rgba(124,58,237,.18)]',
  metrics,
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
}: SalesDeskListLayoutProps<T>): ReactElement {
  const startRow = totalCount === 0 ? 0 : (pageNumber - 1) * pageSize + 1;
  const endRow = totalCount === 0 ? 0 : Math.min(pageNumber * pageSize, totalCount);

  return (
    <div className="space-y-5 text-slate-100">
      <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
        <div className="flex items-start gap-3">
          <div className={`flex h-12 w-12 items-center justify-center rounded-xl border ${accentClass}`}>
            {icon}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="h-7 w-1 rounded-full bg-violet-500 shadow-[0_0_24px_rgba(139,92,246,.7)]" />
              <h1 className="text-2xl font-semibold tracking-normal text-slate-50">{title}</h1>
            </div>
            <p className="mt-1 text-sm text-slate-400">{subtitle}</p>
          </div>
        </div>
        <button
          type="button"
          onClick={onAdd}
          className="inline-flex h-11 items-center gap-2 rounded-lg bg-violet-500 px-5 text-sm font-semibold text-white shadow-lg shadow-violet-950/40 hover:bg-violet-400"
        >
          <Plus size={16} />
          {actionLabel}
        </button>
      </div>

      {metrics.length > 0 && (
        <div className={`grid gap-3 sm:grid-cols-2 ${metrics.length >= 4 ? 'xl:grid-cols-4' : 'xl:grid-cols-3'}`}>
          {metrics.map((metric) => (
            <div key={metric.label} className={`min-h-[116px] rounded-xl p-5 ${surfaceClass}`}>
              <p className="text-xs font-semibold uppercase text-slate-500">{metric.label}</p>
              <p className={`mt-3 text-3xl font-semibold ${metricTone[metric.tone ?? 'blue']}`}>{metric.value}</p>
            </div>
          ))}
        </div>
      )}

      <section className="rounded-xl border border-white/8 bg-slate-900/35 p-4">
        <h2 className="text-xl font-semibold">{tableTitle}</h2>
        <div className="mt-3 flex flex-col gap-3 rounded-xl border border-white/10 bg-[#0a0f1e]/70 p-4 md:flex-row md:items-center md:justify-between">
          <div className="relative w-full md:max-w-xs">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
            <input
              className="h-10 w-full rounded-lg border border-white/10 bg-[#050711]/80 pl-10 pr-3 text-sm text-slate-200 outline-none transition focus:border-violet-400/70 focus:ring-4 focus:ring-violet-500/10"
              placeholder="Ara"
              value={searchTerm}
              onChange={(event) => onSearchChange(event.target.value)}
            />
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <select
              className="h-10 rounded-lg border border-white/10 bg-[#050711]/80 px-3 text-sm text-slate-200 outline-none"
              value={pageSize}
              onChange={(event) => onPageSizeChange(Number(event.target.value))}
            >
              {PAGE_SIZE_OPTIONS.map((size) => (
                <option key={size} value={size}>
                  {size} / sayfa
                </option>
              ))}
            </select>
            <button
              type="button"
              onClick={onRefresh}
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
            {error?.message || 'Liste yuklenemedi. API baglantisini kontrol edin.'}
          </div>
        )}

        <div className="mt-4 overflow-hidden rounded-xl border border-white/10 bg-[#070a13]/72">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[820px] text-left text-sm">
              <thead className="border-b border-white/10 bg-white/[.025] text-xs uppercase text-slate-300">
                <tr>
                  {columns.map((column) => (
                    <th key={column.key} className="px-4 py-4 font-semibold">
                      {column.header}
                    </th>
                  ))}
                  <th className="px-4 py-4 text-right font-semibold">Islem</th>
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  <tr>
                    <td colSpan={columns.length + 1} className="px-4 py-10 text-center text-slate-400">
                      <Loader2 className="mx-auto mb-2 animate-spin" size={24} />
                      Yukleniyor...
                    </td>
                  </tr>
                ) : rows.length === 0 ? (
                  <tr>
                    <td colSpan={columns.length + 1} className="px-4 py-10 text-center text-slate-400">
                      {emptyMessage}
                    </td>
                  </tr>
                ) : (
                  rows.map((row) => (
                    <tr
                      key={row.id}
                      className="border-b border-white/10 text-slate-300 last:border-b-0 hover:bg-white/[.025]"
                    >
                      {columns.map((column) => (
                        <td key={column.key} className={`px-4 py-3 ${column.cellClassName ?? ''}`}>
                          {column.render(row)}
                        </td>
                      ))}
                      <td className="px-4 py-3">
                        <div className="flex justify-end gap-3 text-slate-500">
                          <button
                            type="button"
                            className="transition hover:text-violet-300"
                            onClick={() => onEdit(row)}
                            aria-label="Duzenle"
                          >
                            <Edit3 size={16} />
                          </button>
                          <button
                            type="button"
                            className="transition hover:text-rose-300"
                            onClick={() => onDeleteRequest(row)}
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
              onClick={() => onPageChange(Math.max(1, pageNumber - 1))}
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
              onClick={() => onPageChange(Math.min(totalPages, pageNumber + 1))}
              className="inline-flex h-9 items-center gap-1 rounded-lg border border-white/10 px-3 text-slate-200 disabled:opacity-40"
            >
              Sonraki
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      </section>

      {formDialog}

      <AlertDialog open={deletingRow != null} onOpenChange={(open) => !open && onDeleteCancel()}>
        <AlertDialogContent className="border border-white/10 bg-[#0a0f1e] text-slate-100">
          <AlertDialogHeader>
            <AlertDialogTitle>Kaydi sil</AlertDialogTitle>
            <AlertDialogDescription className="text-slate-400">
              {deletingRow
                ? `"${deleteLabel?.(deletingRow) ?? deletingRow.id}" kaydini silmek istediginize emin misiniz?`
                : 'Bu islem geri alinamaz.'}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="border-white/10 bg-transparent text-slate-200 hover:bg-white/5">
              Iptal
            </AlertDialogCancel>
            <AlertDialogAction
              className="bg-rose-600 hover:bg-rose-500"
              onClick={onDeleteConfirm}
              disabled={isDeleting}
            >
              {isDeleting ? 'Siliniyor...' : 'Sil'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
