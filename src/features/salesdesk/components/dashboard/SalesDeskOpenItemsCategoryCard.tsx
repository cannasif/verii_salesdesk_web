import { type ReactElement } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowUpRight, ClipboardList } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { SalesDeskTaskDto } from '../../api/salesdesk-api';
import { formatDate } from '../../lib/salesdesk-shared';
import { PRIORITY_LABELS } from '../../lib/salesdesk-labels';
import type { OpenItemCategoryDef } from '../../lib/salesdesk-open-item-categories';

interface SalesDeskOpenItemsCategoryCardProps {
  category: OpenItemCategoryDef;
  items: SalesDeskTaskDto[];
  isLoading?: boolean;
  maxItems?: number;
}

function priorityLabel(priority: SalesDeskTaskDto['priority']): string {
  return PRIORITY_LABELS[priority] ?? 'Orta';
}

export function SalesDeskOpenItemsCategoryCard({
  category,
  items,
  isLoading = false,
  maxItems = 5,
}: SalesDeskOpenItemsCategoryCardProps): ReactElement {
  const navigate = useNavigate();
  const Icon = category.icon;
  const visibleItems = items.slice(0, maxItems);

  return (
    <section className="group relative overflow-hidden rounded-2xl border border-[var(--crm-app-border)] bg-[var(--crm-app-list-card)] shadow-lg shadow-black/10">
      <div className={cn('pointer-events-none absolute inset-x-0 top-0 h-24 bg-gradient-to-b', category.headerGradient)} />

      <div className="relative flex items-center gap-3 border-b border-[var(--crm-app-border)] px-5 py-4">
        <div
          className={cn(
            'flex h-11 w-11 items-center justify-center rounded-xl ring-1',
            category.iconClassName
          )}
        >
          <Icon size={21} />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <h2 className="text-[15px] font-bold text-slate-50">{category.title}</h2>
            {items.length > 0 ? (
              <span
                className={cn(
                  'inline-flex h-5 min-w-5 items-center justify-center rounded-full px-1.5 text-[11px] font-bold text-white shadow-sm',
                  category.badgeClassName
                )}
              >
                {items.length}
              </span>
            ) : null}
          </div>
          <p className="mt-0.5 text-xs text-[var(--crm-app-text-muted)]">{category.subtitle}</p>
        </div>
        <button
          type="button"
          onClick={() => navigate(category.href)}
          className="flex h-8 w-8 items-center justify-center rounded-lg text-[var(--crm-brand-accent)] transition-colors hover:bg-[var(--crm-brand-soft)]"
          aria-label="Tumunu gor"
        >
          <ArrowUpRight size={17} />
        </button>
      </div>

      <div className="relative p-3">
        {isLoading ? (
          <div className="space-y-2">
            {[0, 1, 2].map((index) => (
              <div key={index} className="flex items-center gap-3 rounded-xl px-2 py-2.5">
                <div className="h-9 w-9 shrink-0 animate-pulse rounded-lg bg-[var(--crm-app-panel-muted)]" />
                <div className="flex-1 space-y-1.5">
                  <div className="h-3 w-2/3 animate-pulse rounded bg-[var(--crm-app-panel-muted)]" />
                  <div className="h-2.5 w-1/3 animate-pulse rounded bg-[var(--crm-app-panel-muted)]" />
                </div>
              </div>
            ))}
          </div>
        ) : visibleItems.length === 0 ? (
          <div className="flex flex-col items-center gap-2 px-4 py-9 text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[var(--crm-app-panel-muted)] text-slate-500">
              <ClipboardList size={22} />
            </div>
            <p className="text-sm font-medium text-slate-300">Acik madde yok</p>
            <p className="max-w-[220px] text-xs text-[var(--crm-app-text-muted)]">
              Bu kategoride takip edilecek acik madde bulunmuyor.
            </p>
          </div>
        ) : (
          <ul className="space-y-1">
            {visibleItems.map((item) => (
              <li key={item.id}>
                <button
                  type="button"
                  onClick={() => navigate(category.href)}
                  className={cn(
                    'flex w-full items-center gap-3 rounded-xl px-2.5 py-2.5 text-left transition-colors',
                    'hover:bg-[var(--crm-brand-soft)]'
                  )}
                >
                  <span
                    className={cn(
                      'flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-[10px] font-bold uppercase',
                      category.badgeClassName
                    )}
                  >
                    {priorityLabel(item.priority).slice(0, 2)}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm font-semibold text-slate-100">{item.title}</span>
                    <span className="block truncate text-xs text-[var(--crm-app-text-muted)]">
                      {item.customerName || item.groupName || 'Genel'}
                    </span>
                  </span>
                  <span className="flex shrink-0 flex-col items-end gap-0.5">
                    <span
                      className={cn(
                        'inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-semibold ring-1',
                        category.badgeClassName
                      )}
                    >
                      {priorityLabel(item.priority)}
                    </span>
                    <span className="text-[10px] text-[var(--crm-app-text-muted)]">
                      {item.dueDate ? formatDate(item.dueDate) : '-'}
                    </span>
                  </span>
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      {visibleItems.length > 0 ? (
        <button
          type="button"
          onClick={() => navigate(category.href)}
          className="relative flex w-full items-center justify-center gap-1.5 border-t border-[var(--crm-app-border)] py-2.5 text-xs font-semibold text-[var(--crm-brand-accent)] transition-colors hover:bg-[var(--crm-brand-soft)]"
        >
          Tumunu gor
          <ArrowUpRight size={13} />
        </button>
      ) : null}
    </section>
  );
}
