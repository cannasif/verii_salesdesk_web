import { type ReactElement } from 'react';
import { Loader2, RefreshCw, Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { cn } from '@/lib/utils';
import type { SalesDeskVisitFormDto } from '../../api/salesdesk-api';
import type { VisitFormCustomerContact } from '../../lib/visit-form-recipient';
import { PAGE_SIZE_OPTIONS } from '../../lib/salesdesk-shared';
import { SD_SEARCH_FOCUS, SD_SELECT_CONTENT } from '../../lib/salesdesk-popup-styles';
import { SalesDeskVisitFormListRow } from './SalesDeskVisitFormListRow';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface SalesDeskVisitFormsListProps {
  forms: SalesDeskVisitFormDto[];
  customerContacts?: Record<number, VisitFormCustomerContact>;
  totalCount: number;
  isLoading?: boolean;
  isFetching?: boolean;
  isError?: boolean;
  errorMessage?: string | null;
  searchTerm: string;
  onSearchChange: (value: string) => void;
  onRefresh: () => void;
  pageNumber: number;
  pageSize: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  onPageSizeChange: (size: number) => void;
  onEdit: (form: SalesDeskVisitFormDto) => void;
  onDelete: (form: SalesDeskVisitFormDto) => void;
  onPreviewPdf: (form: SalesDeskVisitFormDto) => void | Promise<void>;
}

function ListSkeleton(): ReactElement {
  return (
    <div className="space-y-3">
      {[0, 1, 2].map((item) => (
        <div key={item} className="h-32 animate-pulse rounded-2xl bg-[var(--crm-app-panel-muted)]" />
      ))}
    </div>
  );
}

export function SalesDeskVisitFormsList({
  forms,
  customerContacts = {},
  totalCount,
  isLoading = false,
  isFetching = false,
  isError = false,
  errorMessage,
  searchTerm,
  onSearchChange,
  onRefresh,
  pageNumber,
  pageSize,
  totalPages,
  onPageChange,
  onPageSizeChange,
  onEdit,
  onDelete,
  onPreviewPdf,
}: SalesDeskVisitFormsListProps): ReactElement {
  const hasPreviousPage = pageNumber > 1;
  const hasNextPage = pageNumber < totalPages;
  const rangeStart = totalCount === 0 ? 0 : (pageNumber - 1) * pageSize + 1;
  const rangeEnd = Math.min(pageNumber * pageSize, totalCount);

  return (
    <div className="space-y-4">
      <div className="rounded-2xl border border-[var(--crm-app-border)] bg-[var(--crm-app-list-card)] px-4 py-3">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="group/search relative min-w-0 flex-1">
            <Search
              size={16}
              className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--crm-app-text-muted)]"
            />
            <Input
              value={searchTerm}
              onChange={(event) => onSearchChange(event.target.value)}
              placeholder="Baslik, cari veya icerikte ara..."
              className={cn(
                'h-10 rounded-xl border-[var(--crm-app-border)] bg-[var(--crm-app-input)] pl-10 text-sm text-slate-900 dark:text-slate-100',
                SD_SEARCH_FOCUS
              )}
            />
          </div>
          <button
            type="button"
            onClick={onRefresh}
            disabled={isFetching}
            className="inline-flex h-10 items-center justify-center gap-2 rounded-xl border border-[var(--crm-app-border)] px-4 text-sm font-medium text-slate-600 transition-colors hover:bg-[var(--crm-brand-soft)] hover:text-[var(--crm-brand-accent)] dark:text-slate-300"
          >
            <RefreshCw size={15} className={isFetching ? 'animate-spin' : ''} />
            Yenile
          </button>
        </div>
      </div>

      <div className="rounded-2xl border border-[var(--crm-app-border)] bg-[var(--crm-app-panel-muted)]/50 px-4 py-2.5 text-sm text-slate-600 dark:text-slate-300">
        <span className="font-semibold text-slate-900 dark:text-slate-100">{totalCount}</span> ziyaret formu
      </div>

      {isError ? (
        <div className="rounded-xl border border-rose-400/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-700 dark:text-rose-200">
          {errorMessage || 'Ziyaret formlari yuklenemedi.'}
        </div>
      ) : null}

      {isLoading ? (
        <ListSkeleton />
      ) : forms.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-[var(--crm-app-border)] px-6 py-16 text-center">
          <p className="text-base font-semibold text-slate-900 dark:text-slate-100">
            {searchTerm.trim() ? 'Sonuc bulunamadi' : 'Henuz ziyaret formu yok'}
          </p>
          <p className="mt-1 text-sm text-[var(--crm-app-text-muted)]">
            {searchTerm.trim()
              ? 'Arama kriterlerinizi degistirmeyi deneyin.'
              : 'Yeni ziyaret formu olusturmak icin ustteki butonu kullanin.'}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {forms.map((form) => (
            <SalesDeskVisitFormListRow
              key={form.id}
              form={form}
              customerContact={form.customerId ? customerContacts[form.customerId] : undefined}
              onEdit={onEdit}
              onDelete={onDelete}
              onPreviewPdf={onPreviewPdf}
            />
          ))}
        </div>
      )}

      {isFetching && !isLoading ? (
        <div className="flex items-center justify-center gap-2 text-xs text-[var(--crm-app-text-muted)]">
          <Loader2 size={14} className="animate-spin" />
          Guncelleniyor...
        </div>
      ) : null}

      {totalCount > 0 ? (
        <div className="flex flex-col gap-3 rounded-2xl border border-[var(--crm-app-border)] bg-[var(--crm-app-list-card)] px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-xs text-[var(--crm-app-text-muted)]">
            <span className="font-medium text-slate-700 dark:text-slate-200">
              {rangeStart}–{rangeEnd}
            </span>{' '}
            / {totalCount}
          </p>
          <div className="flex flex-wrap items-center gap-2">
            <Select value={String(pageSize)} onValueChange={(value) => onPageSizeChange(Number(value))}>
              <SelectTrigger className="h-9 w-[72px] rounded-lg border-[var(--crm-app-border)] bg-[var(--crm-app-input)] text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className={SD_SELECT_CONTENT}>
                {PAGE_SIZE_OPTIONS.map((size) => (
                  <SelectItem key={size} value={String(size)}>
                    {size}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <button
              type="button"
              onClick={() => onPageChange(pageNumber - 1)}
              disabled={!hasPreviousPage}
              className="flex h-9 w-9 items-center justify-center rounded-lg border border-[var(--crm-app-border)] disabled:opacity-40"
            >
              <ChevronLeft size={16} />
            </button>
            <span className="min-w-[72px] text-center text-xs font-semibold">
              {pageNumber} / {Math.max(1, totalPages)}
            </span>
            <button
              type="button"
              onClick={() => onPageChange(pageNumber + 1)}
              disabled={!hasNextPage}
              className="flex h-9 w-9 items-center justify-center rounded-lg border border-[var(--crm-app-border)] disabled:opacity-40"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
