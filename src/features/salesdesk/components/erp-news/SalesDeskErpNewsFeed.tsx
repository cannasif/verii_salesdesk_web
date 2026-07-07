import { type ReactElement } from 'react';
import { ChevronLeft, ChevronRight, Loader2, RefreshCw, Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { cn } from '@/lib/utils';
import type { SalesDeskErpNewsItemEnriched, ErpNewsFeedFilter } from '../../lib/erp-news-types';
import { PAGE_SIZE_OPTIONS } from '../../lib/salesdesk-shared';
import { SD_SEARCH_FOCUS, SD_SELECT_CONTENT } from '../../lib/salesdesk-popup-styles';
import { SalesDeskErpNewsCard } from './SalesDeskErpNewsCard';

const FEED_FILTERS: Array<{ id: ErpNewsFeedFilter; label: string }> = [
  { id: 'all', label: 'Tumu' },
  { id: 'my-feed', label: 'Benim akisim' },
  { id: 'system', label: 'Sistem' },
  { id: 'manual', label: 'Manuel' },
  { id: 'external', label: 'Dis kaynak' },
  { id: 'unread', label: 'Okunmamis' },
  { id: 'critical', label: 'Kritik' },
  { id: 'today', label: 'Bugun' },
];

interface SalesDeskErpNewsFeedProps {
  items: SalesDeskErpNewsItemEnriched[];
  totalCount: number;
  feedFilter: ErpNewsFeedFilter;
  onFeedFilterChange: (value: ErpNewsFeedFilter) => void;
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
  onEdit: (item: SalesDeskErpNewsItemEnriched) => void;
  onDelete: (item: SalesDeskErpNewsItemEnriched) => void;
  onToggleRead: (item: SalesDeskErpNewsItemEnriched) => void;
  togglingReadId?: number | null;
  onAdd: () => void;
}

function FeedSkeleton(): ReactElement {
  return (
    <div className="space-y-3">
      {[0, 1, 2, 3].map((item) => (
        <div key={item} className="h-36 animate-pulse rounded-2xl bg-[var(--crm-app-panel-muted)]" />
      ))}
    </div>
  );
}

export function SalesDeskErpNewsFeed({
  items,
  totalCount,
  feedFilter,
  onFeedFilterChange,
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
  onToggleRead,
  togglingReadId = null,
  onAdd,
}: SalesDeskErpNewsFeedProps): ReactElement {
  const hasPreviousPage = pageNumber > 1;
  const hasNextPage = pageNumber < totalPages;
  const rangeStart = totalCount === 0 ? 0 : (pageNumber - 1) * pageSize + 1;
  const rangeEnd = Math.min(pageNumber * pageSize, totalCount);

  return (
    <div className="space-y-4">
      <div className="rounded-2xl border border-[var(--crm-app-border)] bg-[var(--crm-app-list-card)] p-4 sm:p-5">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
          <div className="group/search relative min-w-0 flex-1">
            <Search
              size={16}
              className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--crm-app-text-muted)]"
            />
            <Input
              value={searchTerm}
              onChange={(event) => onSearchChange(event.target.value)}
              placeholder="Baslik, modul veya kaynakta ara..."
              className={cn(
                'h-11 rounded-xl border-[var(--crm-app-border)] bg-[var(--crm-app-input)] pl-10 text-sm text-slate-900 dark:text-slate-100',
                SD_SEARCH_FOCUS
              )}
            />
          </div>
          <button
            type="button"
            onClick={onRefresh}
            disabled={isFetching}
            className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-xl border border-[var(--crm-app-border)] px-4 text-sm font-medium text-slate-600 transition-colors hover:bg-[var(--crm-brand-soft)] hover:text-[var(--crm-brand-accent)] dark:text-slate-300 sm:w-auto"
          >
            <RefreshCw size={15} className={isFetching ? 'animate-spin' : ''} />
            Yenile
          </button>
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          {FEED_FILTERS.map((filter) => (
            <button
              key={filter.id}
              type="button"
              onClick={() => onFeedFilterChange(filter.id)}
              className={cn(
                'min-h-[44px] rounded-full px-3 py-2 text-xs font-semibold transition-colors sm:min-h-0 sm:py-1.5',
                feedFilter === filter.id
                  ? 'bg-[var(--crm-brand-soft)] text-[var(--crm-brand-accent)] ring-1 ring-[color-mix(in_srgb,var(--crm-brand-primary)_30%,transparent)]'
                  : 'border border-[var(--crm-app-border)] text-[var(--crm-app-text-muted)] hover:bg-[var(--crm-app-panel-muted)] hover:text-slate-700 dark:hover:text-slate-200'
              )}
            >
              {filter.label}
            </button>
          ))}
        </div>
      </div>

      <div className="rounded-2xl border border-[var(--crm-app-border)] bg-[var(--crm-app-panel-muted)]/50 px-4 py-2.5 text-sm text-slate-600 dark:text-slate-300">
        <span className="font-semibold text-slate-900 dark:text-slate-100">{totalCount}</span> haber kaydi
      </div>

      {isError ? (
        <div className="rounded-xl border border-rose-400/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-700 dark:text-rose-200">
          {errorMessage || 'Haber kayitlari yuklenemedi.'}
        </div>
      ) : null}

      {isLoading ? (
        <FeedSkeleton />
      ) : items.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-[var(--crm-app-border)] px-6 py-16 text-center">
          <p className="text-base font-semibold text-slate-900 dark:text-slate-100">
            {searchTerm.trim() || feedFilter !== 'all' ? 'Sonuc bulunamadi' : 'Henuz haber kaydi yok'}
          </p>
          <p className="mt-1 text-sm text-[var(--crm-app-text-muted)]">
            {searchTerm.trim() || feedFilter !== 'all'
              ? 'Filtreleri degistirmeyi veya otomasyonu calistirmayi deneyin.'
              : 'Sistem tetikleyicilerini calistirin veya manuel haber ekleyin.'}
          </p>
          {!searchTerm.trim() && feedFilter === 'all' ? (
            <button
              type="button"
              onClick={onAdd}
              className="mt-4 rounded-lg bg-[var(--crm-brand-primary)] px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[color-mix(in_srgb,var(--crm-brand-primary)_88%,black)]"
            >
              Ilk haberi ekle
            </button>
          ) : null}
        </div>
      ) : (
        <div className="space-y-3">
          {items.map((item) => (
            <SalesDeskErpNewsCard
              key={item.id}
              item={item}
              onEdit={onEdit}
              onDelete={onDelete}
              onToggleRead={onToggleRead}
              isTogglingRead={togglingReadId === item.id}
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
              className="flex h-11 w-11 min-h-[44px] min-w-[44px] items-center justify-center rounded-lg border border-[var(--crm-app-border)] disabled:opacity-40"
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
              className="flex h-11 w-11 min-h-[44px] min-w-[44px] items-center justify-center rounded-lg border border-[var(--crm-app-border)] disabled:opacity-40"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
