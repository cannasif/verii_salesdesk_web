import { type ReactElement } from 'react';
import { CalendarDays, UserRound } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { SalesDeskTaskDto } from '../../api/salesdesk-api';
import { TASK_STATUS_LABELS } from '../../lib/salesdesk-labels';
import { formatDate } from '../../lib/salesdesk-shared';
import {
  getSalesDeskProjectPhaseLabel,
  groupProjectsByStatus,
  isProjectTaskOverdue,
  parseSalesDeskProjectPhase,
} from '../../lib/salesdesk-project-tracking';
import { PriorityBadge } from '../pages/salesdesk-badges';

interface SalesDeskProjectKanbanBoardProps {
  rows: SalesDeskTaskDto[];
  userNameById: Map<number, string>;
  onEdit: (row: SalesDeskTaskDto) => void;
  isLoading?: boolean;
}

const COLUMN_META: Array<{
  status: 1 | 2 | 3 | 4;
  title: string;
  headerClass: string;
  bodyClass: string;
}> = [
  {
    status: 1,
    title: TASK_STATUS_LABELS[1],
    headerClass: 'border-sky-500/30 bg-sky-500/10 text-sky-200',
    bodyClass: 'from-sky-500/5',
  },
  {
    status: 2,
    title: TASK_STATUS_LABELS[2],
    headerClass: 'border-amber-500/30 bg-amber-500/10 text-amber-200',
    bodyClass: 'from-amber-500/5',
  },
  {
    status: 3,
    title: TASK_STATUS_LABELS[3],
    headerClass: 'border-emerald-500/30 bg-emerald-500/10 text-emerald-200',
    bodyClass: 'from-emerald-500/5',
  },
  {
    status: 4,
    title: TASK_STATUS_LABELS[4],
    headerClass: 'border-slate-500/30 bg-slate-500/10 text-slate-300',
    bodyClass: 'from-slate-500/5',
  },
];

export function SalesDeskProjectKanbanBoard({
  rows,
  userNameById,
  onEdit,
  isLoading = false,
}: SalesDeskProjectKanbanBoardProps): ReactElement {
  const grouped = groupProjectsByStatus(rows);

  if (isLoading) {
    return (
      <div className="grid min-h-[320px] place-items-center rounded-2xl border border-[var(--crm-app-border)] bg-[var(--crm-app-list-card)]">
        <p className="text-sm text-[var(--crm-app-text-muted)]">Kanban yukleniyor...</p>
      </div>
    );
  }

  return (
    <div className="grid gap-4 xl:grid-cols-4 md:grid-cols-2">
      {COLUMN_META.map((column) => {
        const items = grouped[column.status];
        return (
          <section
            key={column.status}
            className={cn(
              'flex min-h-[360px] flex-col overflow-hidden rounded-2xl border border-[var(--crm-app-border)] bg-gradient-to-b to-transparent',
              column.bodyClass
            )}
          >
            <header
              className={cn(
                'flex items-center justify-between border-b px-4 py-3 text-sm font-semibold',
                column.headerClass
              )}
            >
              <span>{column.title}</span>
              <span className="rounded-full bg-black/20 px-2 py-0.5 text-xs">{items.length}</span>
            </header>

            <div className="flex flex-1 flex-col gap-3 overflow-y-auto p-3">
              {items.length === 0 ? (
                <div className="rounded-xl border border-dashed border-[var(--crm-app-border)] px-3 py-8 text-center text-xs text-[var(--crm-app-text-muted)]">
                  Bu durumda proje yok
                </div>
              ) : (
                items.map((item) => {
                  const phase = parseSalesDeskProjectPhase(item.groupName);
                  const overdue = isProjectTaskOverdue(item);
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => onEdit(item)}
                      className={cn(
                        'rounded-xl border border-[var(--crm-app-border)] bg-[var(--crm-app-list-card)] p-3 text-left shadow-sm transition hover:border-indigo-400/40 hover:shadow-md',
                        overdue && 'border-rose-400/40 ring-1 ring-rose-400/20'
                      )}
                    >
                      <div className="mb-2 flex items-start justify-between gap-2">
                        <p className="line-clamp-2 text-sm font-semibold text-slate-100">{item.title}</p>
                        <PriorityBadge priority={item.priority} />
                      </div>

                      {phase ? (
                        <p className="mb-2 text-xs font-medium text-indigo-300">
                          {getSalesDeskProjectPhaseLabel(phase)}
                        </p>
                      ) : null}

                      <div className="space-y-1 text-xs text-[var(--crm-app-text-muted)]">
                        <p className="truncate">{item.customerName || 'Cari secilmedi'}</p>
                        <div className="flex items-center gap-1.5">
                          <UserRound className="h-3.5 w-3.5 shrink-0" />
                          <span className="truncate">
                            {item.assignedUserId
                              ? userNameById.get(item.assignedUserId) ?? `#${item.assignedUserId}`
                              : 'Atanmadi'}
                          </span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <CalendarDays className="h-3.5 w-3.5 shrink-0" />
                          <span className={cn(overdue && 'font-semibold text-rose-300')}>
                            {formatDate(item.dueDate)}
                          </span>
                        </div>
                      </div>
                    </button>
                  );
                })
              )}
            </div>
          </section>
        );
      })}
    </div>
  );
}
