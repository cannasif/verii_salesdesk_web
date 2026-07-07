import { type ReactElement } from 'react';
import { cn } from '@/lib/utils';
import { TASK_STATUS_LABELS } from '../../lib/salesdesk-labels';
import type { ProjectStatusCounts } from '../../lib/salesdesk-project-tracking';

interface SalesDeskProjectStatusPipelineProps {
  counts: ProjectStatusCounts;
  total: number;
  className?: string;
}

const STATUS_ITEMS = [
  { key: 'open' as const, status: 1 as const, tone: 'text-sky-300', bar: 'bg-sky-500' },
  { key: 'inProgress' as const, status: 2 as const, tone: 'text-amber-300', bar: 'bg-amber-500' },
  { key: 'completed' as const, status: 3 as const, tone: 'text-emerald-300', bar: 'bg-emerald-500' },
  { key: 'cancelled' as const, status: 4 as const, tone: 'text-slate-400', bar: 'bg-slate-500' },
];

export function SalesDeskProjectStatusPipeline({
  counts,
  total,
  className,
}: SalesDeskProjectStatusPipelineProps): ReactElement {
  const safeTotal = Math.max(total, 1);

  return (
    <div className={cn('rounded-2xl border border-[var(--crm-app-border)] bg-[var(--crm-app-list-card)] p-4', className)}>
      <div className="mb-3 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[var(--crm-app-text-muted)]">
            Durum Dagilimi
          </p>
          <p className="text-sm text-slate-300">Projelerin anlik ilerleme ozeti</p>
        </div>
        <span className="rounded-full bg-indigo-500/15 px-3 py-1 text-xs font-semibold text-indigo-200 ring-1 ring-indigo-500/25">
          {total} proje
        </span>
      </div>

      <div className="mb-4 flex h-2 overflow-hidden rounded-full bg-slate-800/80">
        {STATUS_ITEMS.map((item) => {
          const count = counts[item.key];
          if (count <= 0) return null;
          const width = `${Math.max(8, (count / safeTotal) * 100)}%`;
          return <div key={item.key} className={cn('h-full transition-all', item.bar)} style={{ width }} />;
        })}
      </div>

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {STATUS_ITEMS.map((item) => (
          <div
            key={item.key}
            className="rounded-xl border border-[var(--crm-app-border)] bg-[var(--crm-app-input)]/40 px-3 py-2.5"
          >
            <p className={cn('text-[11px] font-semibold uppercase tracking-wide', item.tone)}>
              {TASK_STATUS_LABELS[item.status]}
            </p>
            <p className="mt-1 text-2xl font-bold text-slate-50">{counts[item.key]}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
