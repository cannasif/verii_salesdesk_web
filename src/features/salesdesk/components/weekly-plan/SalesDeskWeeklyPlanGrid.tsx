import { type ReactElement } from 'react';
import { Plus, Users } from 'lucide-react';
import {
  resolveActivityType,
  weeklyPlanCellKey,
  type WeeklyDay,
} from '../../lib/salesdesk-weekly-plan';
import type { SalesDeskTaskDto } from '../../api/salesdesk-api';
import type { SalesDeskUserOption } from '../../hooks/useSalesDeskModules';
import { cn } from '@/lib/utils';

const AVATAR_TONES = [
  'bg-indigo-500/20 text-indigo-300 ring-indigo-500/30',
  'bg-emerald-500/20 text-emerald-300 ring-emerald-500/30',
  'bg-blue-500/20 text-blue-300 ring-blue-500/30',
  'bg-amber-500/20 text-amber-300 ring-amber-500/30',
  'bg-fuchsia-500/20 text-fuchsia-300 ring-fuchsia-500/30',
  'bg-rose-500/20 text-rose-300 ring-rose-500/30',
  'bg-sky-500/20 text-sky-300 ring-sky-500/30',
];

function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return '?';
  if (parts.length === 1) return parts[0].slice(0, 2).toLocaleUpperCase('tr');
  return `${parts[0][0]}${parts[parts.length - 1][0]}`.toLocaleUpperCase('tr');
}

interface SalesDeskWeeklyPlanGridProps {
  users: SalesDeskUserOption[];
  weekDays: WeeklyDay[];
  planIndex: Map<string, SalesDeskTaskDto>;
  currentUserId?: number | null;
  onCellClick: (userId: number, dateKey: string, task: SalesDeskTaskDto | null) => void;
}

export function SalesDeskWeeklyPlanGrid({
  users,
  weekDays,
  planIndex,
  currentUserId,
  onCellClick,
}: SalesDeskWeeklyPlanGridProps): ReactElement {
  return (
    <div className="custom-scrollbar overflow-x-auto rounded-2xl border border-[var(--crm-app-border)] bg-[var(--crm-app-list-card)] shadow-sm">
      <table className="w-full min-w-[900px] border-separate border-spacing-0">
        <thead>
          <tr>
            <th className="sticky left-0 z-30 w-[200px] min-w-[200px] border-b border-r border-[var(--crm-app-border)] bg-[var(--crm-brand-secondary)] px-4 py-3 text-left">
              <span className="flex items-center gap-2 text-sm font-bold text-white">
                <Users className="h-4 w-4" />
                Kisiler
              </span>
            </th>
            {weekDays.map((day) => (
              <th
                key={day.dateKey}
                className={cn(
                  'border-b border-r border-[var(--crm-app-border)] px-3 py-3 text-center',
                  day.isWeekend ? 'bg-[color-mix(in_srgb,var(--crm-brand-secondary)_10%,transparent)]' : 'bg-[color-mix(in_srgb,var(--crm-app-panel-muted)_85%,transparent)]',
                  day.isToday && 'bg-[var(--crm-brand-soft)]'
                )}
              >
                <div className="text-xs font-bold uppercase tracking-wide text-slate-200">{day.dayName}</div>
                <div
                  className={cn(
                    'mt-0.5 text-[11px] font-medium',
                    day.isToday ? 'text-[var(--crm-brand-accent)]' : 'text-[var(--crm-app-text-muted)]'
                  )}
                >
                  {day.shortLabel}
                </div>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {users.map((user, rowIndex) => {
            const isCurrent = currentUserId != null && user.id === currentUserId;
            return (
              <tr key={user.id} className="group/row">
                <td
                  className={cn(
                    'sticky left-0 z-20 border-b border-r border-[var(--crm-app-border)] px-4 py-3',
                    'bg-[var(--crm-app-list-card)] shadow-[4px_0_12px_-6px_rgba(0,0,0,0.25)]',
                    isCurrent && 'bg-[var(--crm-brand-soft)]'
                  )}
                >
                  <div className="flex items-center gap-3">
                    <span
                      className={cn(
                        'flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-xs font-bold ring-1',
                        AVATAR_TONES[rowIndex % AVATAR_TONES.length]
                      )}
                    >
                      {getInitials(user.name)}
                    </span>
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold text-slate-100">{user.name}</p>
                      {isCurrent ? (
                        <span className="text-[10px] font-medium uppercase tracking-wide text-[var(--crm-brand-accent)]">
                          Ben
                        </span>
                      ) : null}
                    </div>
                  </div>
                </td>
                {weekDays.map((day) => {
                  const task = planIndex.get(weeklyPlanCellKey(user.id, day.dateKey)) ?? null;
                  const activity = task ? resolveActivityType(task.title) : null;
                  return (
                    <td
                      key={day.dateKey}
                      className={cn(
                        'border-b border-r border-[var(--crm-app-border)] p-2 align-middle',
                        day.isWeekend && 'bg-[color-mix(in_srgb,var(--crm-brand-secondary)_5%,transparent)]'
                      )}
                    >
                      {task && activity ? (
                        <button
                          type="button"
                          onClick={() => onCellClick(user.id, day.dateKey, task)}
                          className={cn(
                            'flex w-full items-center justify-center gap-1.5 rounded-lg px-2 py-2 text-xs font-semibold ring-1 transition-transform hover:scale-[1.03]',
                            activity.chipClass
                          )}
                          title={task.description || activity.label}
                        >
                          <activity.icon className="h-3.5 w-3.5 shrink-0" />
                          <span className="truncate">{activity.label}</span>
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={() => onCellClick(user.id, day.dateKey, null)}
                          className={cn(
                            'flex w-full items-center justify-center rounded-lg px-2 py-2 text-[var(--crm-app-text-muted)]',
                            'opacity-0 transition-opacity hover:bg-[var(--crm-brand-soft)] hover:text-[var(--crm-brand-accent)] group-hover/row:opacity-100'
                          )}
                          aria-label="Gorev ekle"
                        >
                          <Plus className="h-4 w-4" />
                        </button>
                      )}
                    </td>
                  );
                })}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
