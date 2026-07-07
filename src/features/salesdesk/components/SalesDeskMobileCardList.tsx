import { type ReactElement, type ReactNode } from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';

export interface SalesDeskMobileCardColumn<TKey extends string> {
  key: TKey;
  label: string;
}

interface SalesDeskMobileCardListProps<TRow, TKey extends string> {
  columns: SalesDeskMobileCardColumn<TKey>[];
  visibleColumnKeys: TKey[];
  rows: TRow[];
  rowKey: (row: TRow) => string | number;
  renderCell: (row: TRow, columnKey: TKey) => ReactNode;
  primaryKey?: TKey;
  detailKeys?: TKey[];
  renderActions?: (row: TRow) => ReactNode;
  onRowActivate?: (row: TRow) => void;
  isLoading?: boolean;
  isError?: boolean;
  errorText?: string;
  emptyText?: string;
  pageSize?: number;
  className?: string;
}

const PREFERRED_PRIMARY_KEYS = ['name', 'companyName', 'title', 'code'] as const;

function resolvePrimaryKey<TKey extends string>(
  visibleKeys: TKey[],
  explicitKey?: TKey
): TKey {
  if (explicitKey && visibleKeys.includes(explicitKey)) return explicitKey;
  for (const key of PREFERRED_PRIMARY_KEYS) {
    const match = visibleKeys.find((item) => String(item).toLowerCase() === key);
    if (match) return match;
  }
  const nonId = visibleKeys.find((item) => String(item).toLowerCase() !== 'id');
  return nonId ?? visibleKeys[0];
}

export function SalesDeskMobileCardList<TRow, TKey extends string>({
  columns,
  visibleColumnKeys,
  rows,
  rowKey,
  renderCell,
  primaryKey,
  detailKeys,
  renderActions,
  onRowActivate,
  isLoading = false,
  isError = false,
  errorText = 'Veri yuklenemedi.',
  emptyText = 'Kayit bulunamadi.',
  pageSize = 10,
  className,
}: SalesDeskMobileCardListProps<TRow, TKey>): ReactElement {
  const resolvedPrimary = resolvePrimaryKey(visibleColumnKeys, primaryKey);
  const resolvedDetailKeys =
    detailKeys ??
    visibleColumnKeys.filter(
      (key) => key !== resolvedPrimary && String(key).toLowerCase() !== 'id'
    );

  if (isLoading && !isError) {
    return (
      <div className={cn('space-y-3 p-3', className)}>
        {Array.from({ length: Math.min(pageSize, 5) }).map((_, index) => (
          <div
            key={`sd-mobile-skeleton-${index}`}
            className="rounded-xl border border-[var(--crm-app-border)] bg-[var(--crm-app-list-card)] p-4"
          >
            <Skeleton className="mb-3 h-5 w-2/3 bg-slate-200/60 dark:bg-white/10" />
            <Skeleton className="mb-2 h-4 w-full bg-slate-200/60 dark:bg-white/10" />
            <Skeleton className="h-4 w-4/5 bg-slate-200/60 dark:bg-white/10" />
          </div>
        ))}
      </div>
    );
  }

  if (isError) {
    return <div className={cn('p-4 text-center text-sm text-red-600', className)}>{errorText}</div>;
  }

  if (rows.length === 0) {
    return (
      <div className={cn('p-6 text-center text-sm text-muted-foreground', className)}>{emptyText}</div>
    );
  }

  return (
    <div className={cn('space-y-3 p-3', className)}>
      {rows.map((row) => (
        <article
          key={rowKey(row)}
          className={cn(
            'rounded-xl border border-[var(--crm-app-border)] bg-[var(--crm-app-list-card)] p-4 shadow-sm',
            onRowActivate && 'cursor-pointer active:scale-[0.99]'
          )}
          onClick={onRowActivate ? () => onRowActivate(row) : undefined}
          onKeyDown={
            onRowActivate
              ? (event) => {
                  if (event.key === 'Enter' || event.key === ' ') {
                    event.preventDefault();
                    onRowActivate(row);
                  }
                }
              : undefined
          }
          role={onRowActivate ? 'button' : undefined}
          tabIndex={onRowActivate ? 0 : undefined}
        >
          <div className="mb-3 min-w-0">
            <div className="text-base font-bold leading-snug text-slate-900 dark:text-white">
              {renderCell(row, resolvedPrimary)}
            </div>
          </div>

          {resolvedDetailKeys.length > 0 ? (
            <dl className="grid grid-cols-1 gap-x-4 gap-y-2.5">
              {resolvedDetailKeys.map((key) => {
                const column = columns.find((item) => item.key === key);
                return (
                  <div key={`${rowKey(row)}-${key}`} className="min-w-0">
                    <dt className="text-[10px] font-semibold uppercase tracking-wider text-[var(--crm-app-text-muted)]">
                      {column?.label ?? key}
                    </dt>
                    <dd className="mt-0.5 text-sm text-slate-700 dark:text-slate-200">
                      <div className="min-w-0 break-words">{renderCell(row, key)}</div>
                    </dd>
                  </div>
                );
              })}
            </dl>
          ) : null}

          {renderActions ? (
            <div
              className="mt-4 space-y-2 border-t border-[var(--crm-app-border)] pt-3"
              data-skip-row-double-click
              data-no-drag-scroll
              onClick={(event) => event.stopPropagation()}
            >
              {renderActions(row)}
            </div>
          ) : null}
        </article>
      ))}
    </div>
  );
}
