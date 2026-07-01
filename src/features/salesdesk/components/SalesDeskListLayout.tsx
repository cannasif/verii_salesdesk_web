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
import {
  SD_ADD_BUTTON,
  SD_FORM_INPUT,
  SD_PAGE_ICON_BOX,
  SD_SECONDARY_BUTTON,
  SD_SURFACE_DIALOG,
  SD_TABLE_SHELL,
} from '../lib/salesdesk-popup-styles';
import {
  MANAGEMENT_LIST_CARD_CLASSNAME,
  MANAGEMENT_TOOLBAR_OUTLINE_BUTTON_CLASSNAME,
} from '@/lib/management-list-layout';

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
  blue: 'text-[var(--crm-brand-text)]',
  green: 'text-emerald-400',
  yellow: 'text-amber-400',
  red: 'text-rose-400',
  violet: 'text-slate-200',
  pink: 'text-slate-200',
  cyan: 'text-[var(--crm-brand-text)]',
};

export function SalesDeskListLayout<T extends { id: number }>({
  title,
  subtitle,
  tableTitle,
  actionLabel,
  icon,
  accentClass = SD_PAGE_ICON_BOX,
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
          <div className={accentClass}>
            {icon}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="h-7 w-1 rounded-full bg-[var(--crm-brand-primary)] shadow-[0_0_24px_var(--crm-brand-ring)]" />
              <h1 className="text-2xl font-semibold tracking-normal text-slate-50">{title}</h1>
            </div>
            <p className="mt-1 text-sm text-slate-400">{subtitle}</p>
          </div>
        </div>
        <button
          type="button"
          onClick={onAdd}
          className={SD_ADD_BUTTON}
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

      <section className={`rounded-xl p-4 ${MANAGEMENT_LIST_CARD_CLASSNAME}`}>
        <h2 className="text-xl font-semibold text-slate-900 dark:text-white">{tableTitle}</h2>
        <div className="mt-3 flex flex-col gap-3 rounded-xl border border-[var(--crm-app-border)] bg-[var(--crm-app-list-card-header)] p-4 md:flex-row md:items-center md:justify-between">
          <div className="relative w-full md:max-w-xs">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--crm-app-text-muted)]" size={16} />
            <input
              className={`h-10 w-full pl-10 pr-3 ${SD_FORM_INPUT}`}
              placeholder="Ara"
              value={searchTerm}
              onChange={(event) => onSearchChange(event.target.value)}
            />
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <select
              className={`h-10 px-3 text-sm ${SD_FORM_INPUT} ${MANAGEMENT_TOOLBAR_OUTLINE_BUTTON_CLASSNAME}`}
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
              className={`inline-flex h-10 items-center gap-2 px-4 text-sm font-medium disabled:opacity-60 ${MANAGEMENT_TOOLBAR_OUTLINE_BUTTON_CLASSNAME} border-dashed hover:border-[var(--crm-brand-primary)] hover:bg-[var(--crm-brand-soft)] hover:text-[var(--crm-brand-on-soft)]`}
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

        <div className={`mt-4 ${SD_TABLE_SHELL}`}>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[820px] text-left text-sm">
              <thead className="border-b border-[var(--crm-app-border)] bg-[var(--crm-app-table-head)] text-xs uppercase text-slate-300">
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
                      className="border-b border-[var(--crm-app-border)] text-slate-300 last:border-b-0 hover:bg-[var(--crm-app-table-row-hover)]"
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
                            className="transition hover:text-[var(--crm-brand-accent)]"
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
              onClick={() => onPageChange(Math.min(totalPages, pageNumber + 1))}
              className={`inline-flex h-9 items-center gap-1 px-3 disabled:opacity-40 ${MANAGEMENT_TOOLBAR_OUTLINE_BUTTON_CLASSNAME}`}
            >
              Sonraki
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      </section>

      {formDialog}

      <AlertDialog open={deletingRow != null} onOpenChange={(open) => !open && onDeleteCancel()}>
        <AlertDialogContent className={SD_SURFACE_DIALOG}>
          <AlertDialogHeader>
            <AlertDialogTitle>Kaydi sil</AlertDialogTitle>
            <AlertDialogDescription className="text-[var(--crm-app-text-muted)]">
              {deletingRow
                ? `"${deleteLabel?.(deletingRow) ?? deletingRow.id}" kaydini silmek istediginize emin misiniz?`
                : 'Bu islem geri alinamaz.'}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className={SD_SECONDARY_BUTTON}>
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
