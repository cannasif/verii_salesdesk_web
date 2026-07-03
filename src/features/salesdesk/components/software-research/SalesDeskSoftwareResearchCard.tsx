import { type ReactElement } from 'react';
import {
  Building2,
  CalendarDays,
  ExternalLink,
  Globe,
  Pencil,
  Server,
  Trash2,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import type { SalesDeskSoftwareResearchDto } from '../../api/salesdesk-api';
import { formatDate } from '../../lib/salesdesk-shared';
import {
  getResearchCardSubtitle,
  getResearchScoreColor,
  getResearchStatusAccent,
  getResearchStatusLabel,
  normalizeExternalUrl,
  parseResearchKeywords,
} from '../../lib/software-research-ui';
import { PotentialStatusBadge } from '../pages/salesdesk-badges';

interface SalesDeskSoftwareResearchCardProps {
  item: SalesDeskSoftwareResearchDto;
  onEdit: (item: SalesDeskSoftwareResearchDto) => void;
  onDelete: (item: SalesDeskSoftwareResearchDto) => void;
}

export function SalesDeskSoftwareResearchCard({
  item,
  onEdit,
  onDelete,
}: SalesDeskSoftwareResearchCardProps): ReactElement {
  const keywords = parseResearchKeywords(item.keywords);
  const sourceUrl = normalizeExternalUrl(item.sourceUrl);
  const scoreColor = getResearchScoreColor(item.score);
  const accent = getResearchStatusAccent(item.status);

  return (
    <article className="group relative flex h-full flex-col overflow-hidden rounded-2xl border border-[var(--crm-app-border)] bg-[var(--crm-app-list-card)] shadow-sm transition-all duration-200 hover:border-[color-mix(in_srgb,var(--crm-brand-primary)_28%,transparent)] hover:shadow-[0_12px_32px_rgb(0_0_0_/10%)]">
      <div className={cn('pointer-events-none absolute inset-x-0 top-0 h-24 bg-gradient-to-b', accent)} />

      <div className="relative flex flex-1 flex-col p-5">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="text-base font-bold text-slate-900 dark:text-slate-50">{item.provider}</h3>
              <PotentialStatusBadge status={item.status} />
            </div>
            <p className="mt-1 flex items-center gap-1.5 text-sm text-[var(--crm-brand-accent)]">
              <Building2 size={14} />
              {getResearchCardSubtitle(item)}
            </p>
          </div>

          <div className="flex shrink-0 flex-col items-center rounded-xl border border-[var(--crm-app-border)] bg-[var(--crm-app-panel-muted)] px-3 py-2">
            <span className={cn('text-xl font-bold tabular-nums', scoreColor)}>{item.score}</span>
            <span className="text-[10px] font-semibold uppercase tracking-wide text-[var(--crm-app-text-muted)]">
              Skor
            </span>
          </div>
        </div>

        <div className="mt-4 space-y-2 text-sm text-slate-600 dark:text-slate-300">
          {item.host ? (
            <p className="flex items-center gap-2 truncate">
              <Server size={14} className="shrink-0 text-[var(--crm-brand-primary)]" />
              {item.host}
            </p>
          ) : null}
          <p className="flex items-center gap-2 text-xs text-[var(--crm-app-text-muted)]">
            <CalendarDays size={13} />
            {formatDate(item.researchedAt)}
            <span className="mx-1">·</span>
            {getResearchStatusLabel(item.status)}
          </p>
        </div>

        {keywords.length > 0 ? (
          <div className="mt-4 flex flex-wrap gap-1.5">
            {keywords.map((keyword) => (
              <span
                key={keyword}
                className="rounded-full border border-[var(--crm-app-border)] bg-[var(--crm-app-panel-muted)] px-2.5 py-0.5 text-[11px] font-medium text-slate-600 dark:text-slate-300"
              >
                {keyword}
              </span>
            ))}
          </div>
        ) : (
          <p className="mt-4 text-xs italic text-[var(--crm-app-text-muted)]">Anahtar kelime eklenmemis</p>
        )}

        <div className="mt-auto flex flex-wrap items-center gap-2 pt-5">
          {sourceUrl ? (
            <a
              href={sourceUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-[var(--crm-app-border)] px-3 text-xs font-semibold text-slate-600 transition-colors hover:bg-[var(--crm-brand-soft)] hover:text-[var(--crm-brand-accent)] dark:text-slate-300"
            >
              <ExternalLink size={14} />
              Kaynak
            </a>
          ) : (
            <span className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-dashed border-[var(--crm-app-border)] px-3 text-xs text-[var(--crm-app-text-muted)]">
              <Globe size={14} />
              Kaynak yok
            </span>
          )}
          <button
            type="button"
            onClick={() => onEdit(item)}
            className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-[var(--crm-app-border)] text-slate-500 transition-colors hover:bg-[var(--crm-brand-soft)] hover:text-[var(--crm-brand-accent)]"
            aria-label="Duzenle"
          >
            <Pencil size={15} />
          </button>
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
