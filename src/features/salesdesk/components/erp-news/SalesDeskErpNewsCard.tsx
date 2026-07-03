import { type ReactElement } from 'react';
import {
  AlertTriangle,
  BookOpen,
  Bot,
  CalendarDays,
  ExternalLink,
  Globe,
  Pencil,
  Star,
  Trash2,
  Users,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import type { SalesDeskErpNewsItemEnriched } from '../../lib/erp-news-types';
import { formatDate } from '../../lib/salesdesk-shared';
import {
  formatTargetGroups,
  getModuleLabel,
  getModuleStyle,
  getNewsCardAccent,
  getNewsScoreMeta,
  getSourceTypeLabel,
  getSourceTypeStyle,
  normalizeNewsUrl,
} from '../../lib/erp-news-ui';

interface SalesDeskErpNewsCardProps {
  item: SalesDeskErpNewsItemEnriched;
  onEdit: (item: SalesDeskErpNewsItemEnriched) => void;
  onDelete: (item: SalesDeskErpNewsItemEnriched) => void;
  onToggleRead: (item: SalesDeskErpNewsItemEnriched) => void;
  isTogglingRead?: boolean;
}

export function SalesDeskErpNewsCard({
  item,
  onEdit,
  onDelete,
  onToggleRead,
  isTogglingRead = false,
}: SalesDeskErpNewsCardProps): ReactElement {
  const sourceUrl = normalizeNewsUrl(item.sourceUrl);
  const moduleStyle = getModuleStyle(item.module);
  const scoreMeta = getNewsScoreMeta(item.score);
  const accent = getNewsCardAccent(item);

  return (
    <article
      className={cn(
        'group relative overflow-hidden rounded-2xl border border-[var(--crm-app-border)] border-l-4 bg-[var(--crm-app-list-card)] shadow-sm transition-all duration-200 hover:border-[color-mix(in_srgb,var(--crm-brand-primary)_28%,transparent)] hover:shadow-[0_10px_28px_rgb(0_0_0_/8%)]',
        accent,
        !item.isRead && 'bg-[color-mix(in_srgb,var(--crm-brand-soft)_35%,var(--crm-app-list-card))]'
      )}
    >
      <div className="flex flex-col gap-4 p-5 lg:flex-row lg:items-start lg:justify-between">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className={cn('rounded-full px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wide', moduleStyle.badge)}>
              {getModuleLabel(item.module)}
            </span>
            <span className={cn('rounded-full px-2.5 py-0.5 text-[11px] font-semibold', getSourceTypeStyle(item.sourceType))}>
              {item.sourceType === 'system' ? <Bot size={11} className="mr-1 inline" /> : null}
              {getSourceTypeLabel(item.sourceType)}
            </span>
            {item.isCritical ? (
              <span className="inline-flex items-center gap-1 rounded-full bg-rose-500/10 px-2.5 py-0.5 text-[11px] font-semibold text-rose-600 ring-1 ring-rose-400/30 dark:text-rose-300">
                <AlertTriangle size={12} />
                Kritik
              </span>
            ) : null}
            {!item.isRead ? <span className="inline-flex h-2 w-2 rounded-full bg-[var(--crm-brand-accent)]" aria-label="Okunmadi" /> : null}
          </div>

          <h3
            className={cn(
              'mt-3 text-base leading-snug text-slate-900 dark:text-slate-50',
              !item.isRead ? 'font-bold' : 'font-semibold'
            )}
          >
            {sourceUrl ? (
              <a
                href={sourceUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="transition-colors hover:text-[var(--crm-brand-accent)]"
              >
                {item.title}
              </a>
            ) : (
              item.title
            )}
          </h3>

          <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-[var(--crm-app-text-muted)]">
            <span className="inline-flex items-center gap-1.5">
              <Globe size={13} />
              {item.source?.trim() || 'Kaynak belirtilmedi'}
            </span>
            <span className="inline-flex items-center gap-1.5">
              <CalendarDays size={13} />
              {formatDate(item.publishedAt)}
            </span>
            <span className={cn('inline-flex items-center gap-1 font-semibold', scoreMeta.className)}>
              <Star size={12} />
              {item.score}/10 · {scoreMeta.label}
            </span>
            <span className="inline-flex items-center gap-1.5">
              <Users size={13} />
              {formatTargetGroups(item.targetGroupNames)}
            </span>
          </div>
        </div>

        <div className="flex shrink-0 flex-wrap items-center gap-2 lg:justify-end">
          <button
            type="button"
            onClick={() => onToggleRead(item)}
            disabled={isTogglingRead}
            className={cn(
              'inline-flex h-9 items-center gap-1.5 rounded-lg border px-3 text-xs font-semibold transition-colors disabled:opacity-50',
              item.isRead
                ? 'border-[var(--crm-app-border)] text-slate-500 hover:bg-[var(--crm-app-panel-muted)] dark:text-slate-300'
                : 'border-[color-mix(in_srgb,var(--crm-brand-primary)_30%,transparent)] bg-[var(--crm-brand-soft)] text-[var(--crm-brand-accent)]'
            )}
          >
            <BookOpen size={14} />
            {item.isRead ? 'Okunmadi yap' : 'Okundu isaretle'}
          </button>
          {sourceUrl ? (
            <a
              href={sourceUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-[var(--crm-app-border)] px-3 text-xs font-semibold text-slate-600 transition-colors hover:bg-[var(--crm-brand-soft)] hover:text-[var(--crm-brand-accent)] dark:text-slate-300"
            >
              <ExternalLink size={14} />
              Haberi ac
            </a>
          ) : null}
          {!item.isAutoGenerated ? (
            <button
              type="button"
              onClick={() => onEdit(item)}
              className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-[var(--crm-app-border)] text-slate-500 transition-colors hover:bg-[var(--crm-brand-soft)] hover:text-[var(--crm-brand-accent)]"
              aria-label="Duzenle"
            >
              <Pencil size={15} />
            </button>
          ) : null}
          <button
            type="button"
            onClick={() => onDelete(item)}
            className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-[var(--crm-app-border)] text-slate-500 transition-colors hover:border-rose-400/40 hover:bg-rose-500/10 hover:text-rose-500 dark:hover:text-rose-300"
            aria-label="Sil"
          >
            <Trash2 size={15} />
          </button>
        </div>
      </div>
    </article>
  );
}
