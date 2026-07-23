import { type ReactElement } from 'react';
import { Building2, UserRound } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import type { SalesDeskVisitFormDto } from '../../api/salesdesk-api';
import {
  formatReportDateLabel,
  groupDayEntriesByCustomer,
  type VisitFormVisitorRow,
} from '../../lib/visit-form-report';
import { formatWeeklyPlanDisplayName, type WeeklyDay } from '../../lib/salesdesk-weekly-plan';

const AVATAR_TONES = [
  'bg-indigo-500/20 text-indigo-300 ring-indigo-500/30',
  'bg-emerald-500/20 text-emerald-300 ring-emerald-500/30',
  'bg-blue-500/20 text-blue-300 ring-blue-500/30',
  'bg-amber-500/20 text-amber-300 ring-amber-500/30',
  'bg-fuchsia-500/20 text-fuchsia-300 ring-fuchsia-500/30',
  'bg-rose-500/20 text-rose-300 ring-rose-500/30',
  'bg-sky-500/20 text-sky-300 ring-sky-500/30',
];

const TOOLTIP_CLASS =
  'z-[100] max-w-[320px] border border-slate-300/80 bg-white px-4 py-3.5 text-slate-900 shadow-2xl dark:border-slate-500 dark:bg-slate-950 dark:text-slate-50';

const TABLE_COLUMN_COUNT = 8;

function getInitials(name: string): string {
  const displayName = formatWeeklyPlanDisplayName(name);
  const parts = displayName.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return '?';
  if (parts.length === 1) return parts[0].slice(0, 2).toLocaleUpperCase('tr');
  return `${parts[0][0]}${parts[parts.length - 1][0]}`.toLocaleUpperCase('tr');
}

interface SalesDeskVisitFormReportGridProps {
  rows: VisitFormVisitorRow[];
  weekDays: WeeklyDay[];
  onFormSelect?: (form: SalesDeskVisitFormDto) => void;
}

function VisitChip({
  customerName,
  count,
  forms,
  onFormSelect,
}: {
  customerName: string;
  count: number;
  forms: SalesDeskVisitFormDto[];
  onFormSelect?: (form: SalesDeskVisitFormDto) => void;
}): ReactElement {
  const content = (
    <button
      type="button"
      onClick={() => onFormSelect?.(forms[0])}
      className="flex w-full min-w-0 items-center gap-1 rounded-lg border border-[var(--crm-app-border)] bg-[var(--crm-app-panel-muted)] px-2 py-1.5 text-left text-[11px] font-medium text-slate-200 transition-colors hover:bg-[var(--crm-app-panel-strong)]"
    >
      <Building2 className="h-3 w-3 shrink-0 opacity-80" />
      <span className="min-w-0 flex-1 truncate">{customerName}</span>
      {count > 1 ? (
        <span className="shrink-0 rounded-full bg-slate-500/25 px-1.5 py-0.5 text-[10px] font-bold tabular-nums text-slate-200">
          {count}
        </span>
      ) : null}
    </button>
  );

  return (
    <Tooltip>
      <TooltipTrigger asChild>{content}</TooltipTrigger>
      <TooltipContent side="top" className={TOOLTIP_CLASS}>
        <p className="text-sm font-semibold">{customerName}</p>
        <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
          {count} ziyaret · {formatReportDateLabel(forms[0].formDate.slice(0, 10))}
        </p>
        {forms.length > 1 ? (
          <ul className="mt-2 space-y-1 text-xs text-slate-600 dark:text-slate-300">
            {forms.map((form) => (
              <li key={form.id}>#{form.id} · {form.title}</li>
            ))}
          </ul>
        ) : (
          <p className="mt-2 text-xs text-slate-600 dark:text-slate-300">{forms[0].title}</p>
        )}
      </TooltipContent>
    </Tooltip>
  );
}

export function SalesDeskVisitFormReportGrid({
  rows,
  weekDays,
  onFormSelect,
}: SalesDeskVisitFormReportGridProps): ReactElement {
  if (rows.length === 0) {
    return (
      <div className="rounded-2xl border border-[var(--crm-app-border)] bg-[var(--crm-app-list-card)] px-4 py-12 text-center text-sm text-slate-400">
        Secilen donemde ziyaret formu bulunamadi.
      </div>
    );
  }

  return (
    <TooltipProvider delayDuration={200}>
      <div className="custom-scrollbar hidden overflow-x-auto rounded-2xl border border-[var(--crm-app-border)] bg-[var(--crm-app-list-card)] shadow-sm lg:block">
          <table className="w-full min-w-[960px] table-fixed border-separate border-spacing-0 text-sm">
            <colgroup>
              {Array.from({ length: TABLE_COLUMN_COUNT }).map((_, index) => (
                <col key={`col-${index}`} style={{ width: `${100 / TABLE_COLUMN_COUNT}%` }} />
              ))}
            </colgroup>
            <thead>
              <tr>
                <th className="sticky left-0 z-30 min-w-[200px] border-b border-r border-[var(--crm-app-border)] bg-[var(--crm-app-list-card-header)] px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-400">
                  Ziyaretci
                </th>
                {weekDays.map((day) => (
                  <th
                    key={day.dateKey}
                    className={cn(
                      'min-w-[120px] border-b border-r border-[var(--crm-app-border)] bg-[var(--crm-app-list-card-header)] px-2 py-3 text-center text-xs font-semibold uppercase tracking-wide text-slate-400',
                      day.isWeekend && 'bg-[color-mix(in_srgb,var(--crm-app-panel-muted)_70%,var(--crm-app-list-card-header))]',
                      day.isToday && 'text-slate-200'
                    )}
                  >
                    <div className={cn(day.isToday && 'font-bold text-white')}>{day.dayName}</div>
                    <div className="mt-0.5 font-bold normal-case tracking-normal">{day.shortLabel}</div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((row, rowIndex) => (
                <tr key={row.visitorKey} className="group/row">
                  <td className="sticky left-0 z-20 border-b border-r border-[var(--crm-app-border)] bg-[var(--crm-app-list-card)] px-4 py-3 shadow-[4px_0_12px_-6px_rgba(0,0,0,0.25)]">
                    <div className="flex items-center gap-3">
                      <span
                        className={cn(
                          'flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-xs font-bold ring-1',
                          AVATAR_TONES[rowIndex % AVATAR_TONES.length]
                        )}
                      >
                        {getInitials(row.visitorName)}
                      </span>
                      <div className="min-w-0">
                        <p className="truncate font-semibold text-slate-100">{row.visitorName}</p>
                        <p className="text-xs text-slate-400">
                          {row.totalVisits} ziyaret · {row.uniqueCustomers} cari
                        </p>
                      </div>
                    </div>
                  </td>
                  {weekDays.map((day) => {
                    const entries = row.byDate.get(day.dateKey) ?? [];
                    const groups = groupDayEntriesByCustomer(entries);
                    return (
                      <td
                        key={`${row.visitorKey}-${day.dateKey}`}
                        className={cn(
                          'border-b border-r border-[var(--crm-app-border)] bg-[var(--crm-app-list-card)] p-1.5 align-top',
                          day.isWeekend && 'bg-[color-mix(in_srgb,var(--crm-app-panel-muted)_35%,var(--crm-app-list-card))]'
                        )}
                      >
                        <div className="flex min-h-[52px] flex-col gap-1.5">
                          {groups.map((group) => (
                            <VisitChip
                              key={group.customerKey}
                              customerName={group.customerName}
                              count={group.count}
                              forms={group.forms}
                              onFormSelect={onFormSelect}
                            />
                          ))}
                        </div>
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
      </div>

      <div className="space-y-3 lg:hidden">
        {rows.map((row, rowIndex) => (
          <article
            key={row.visitorKey}
            className="overflow-hidden rounded-2xl border border-[var(--crm-app-border)] bg-[var(--crm-app-list-card)]"
          >
            <div className="flex items-center gap-3 border-b border-[var(--crm-app-border)] px-4 py-3">
              <span
                className={cn(
                  'flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-sm font-bold ring-1',
                  AVATAR_TONES[rowIndex % AVATAR_TONES.length]
                )}
              >
                {getInitials(row.visitorName)}
              </span>
              <div className="min-w-0">
                <p className="font-semibold text-slate-100">{row.visitorName}</p>
                <p className="text-xs text-slate-400">
                  {row.totalVisits} ziyaret · {row.uniqueCustomers} cari
                </p>
              </div>
            </div>
            <div className="divide-y divide-[var(--crm-app-border)]">
              {weekDays.map((day) => {
                const entries = row.byDate.get(day.dateKey) ?? [];
                if (entries.length === 0) return null;
                const groups = groupDayEntriesByCustomer(entries);
                return (
                  <div key={day.dateKey} className="px-4 py-3">
                    <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-400">
                      {day.dayName} · {day.shortLabel}
                    </p>
                    <div className="flex flex-col gap-1.5">
                      {groups.map((group) => (
                        <VisitChip
                          key={group.customerKey}
                          customerName={group.customerName}
                          count={group.count}
                          forms={group.forms}
                          onFormSelect={onFormSelect}
                        />
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </article>
        ))}
      </div>
    </TooltipProvider>
  );
}

export function SalesDeskVisitFormReportGridPlaceholder(): ReactElement {
  return (
    <div className="rounded-2xl border border-[var(--crm-app-border)] bg-[var(--crm-app-list-card)] px-4 py-12 text-center text-sm text-slate-400">
      <UserRound className="mx-auto mb-3 h-8 w-8 opacity-40" />
      Gosterilecek ziyaretci bulunamadi.
    </div>
  );
}
