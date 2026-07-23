import { type ReactElement, useState } from 'react';
import { ChevronDown, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  formatReportDateLabel,
  type VisitFormCustomerSummary,
  type VisitFormVisitorRow,
} from '../../lib/visit-form-report';
import { formatWeeklyPlanDisplayName } from '../../lib/salesdesk-weekly-plan';

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
  const displayName = formatWeeklyPlanDisplayName(name);
  const parts = displayName.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return '?';
  if (parts.length === 1) return parts[0].slice(0, 2).toLocaleUpperCase('tr');
  return `${parts[0][0]}${parts[parts.length - 1][0]}`.toLocaleUpperCase('tr');
}

function sortCustomers(customers: VisitFormCustomerSummary[]): VisitFormCustomerSummary[] {
  return [...customers].sort((left, right) => {
    if (right.count !== left.count) return right.count - left.count;
    return left.customerName.localeCompare(right.customerName, 'tr');
  });
}

interface SalesDeskVisitFormReportMonthViewProps {
  rows: VisitFormVisitorRow[];
}

export function SalesDeskVisitFormReportMonthView({
  rows,
}: SalesDeskVisitFormReportMonthViewProps): ReactElement {
  const [expandedKeys, setExpandedKeys] = useState<Set<string>>(() => new Set());

  const toggleRow = (key: string): void => {
    setExpandedKeys((current) => {
      const next = new Set(current);
      if (next.has(key)) {
        next.delete(key);
      } else {
        next.add(key);
      }
      return next;
    });
  };

  if (rows.length === 0) {
    return (
      <div className="rounded-2xl border border-[var(--crm-app-border)] bg-[var(--crm-app-list-card)] px-4 py-12 text-center text-sm text-slate-400">
        Secilen ayda ziyaret formu bulunamadi.
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-[var(--crm-app-border)] bg-[var(--crm-app-list-card)]">
      <div className="hidden border-b border-[var(--crm-app-border)] bg-[var(--crm-app-list-card-header)] px-4 py-3 text-xs font-semibold uppercase tracking-wide text-slate-400 sm:grid sm:grid-cols-[minmax(0,1.4fr)_120px_120px_120px_40px] sm:gap-3">
        <span>Ziyaretci</span>
        <span className="text-center">Toplam</span>
        <span className="text-center">Farkli Cari</span>
        <span className="text-center">Son Ziyaret</span>
        <span />
      </div>

      <div className="divide-y divide-[var(--crm-app-border)]">
        {rows.map((row, rowIndex) => {
          const customers = sortCustomers([...row.byCustomer.values()]);
          const isExpanded = expandedKeys.has(row.visitorKey);
          const lastVisitKey = customers.reduce(
            (latest, customer) => (customer.lastDateKey > latest ? customer.lastDateKey : latest),
            customers[0]?.lastDateKey ?? ''
          );

          return (
            <div key={row.visitorKey}>
              <button
                type="button"
                onClick={() => toggleRow(row.visitorKey)}
                className="flex w-full flex-col gap-3 px-4 py-4 text-left transition-colors hover:bg-[var(--crm-app-table-row-hover)] sm:grid sm:grid-cols-[minmax(0,1.4fr)_120px_120px_120px_40px] sm:items-center sm:gap-3"
              >
                <div className="flex min-w-0 items-center gap-3">
                  <span
                    className={cn(
                      'flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-sm font-bold ring-1',
                      AVATAR_TONES[rowIndex % AVATAR_TONES.length]
                    )}
                  >
                    {getInitials(row.visitorName)}
                  </span>
                  <div className="min-w-0">
                    <p className="truncate font-semibold text-slate-100">{row.visitorName}</p>
                    <p className="text-xs text-slate-400 sm:hidden">
                      {row.totalVisits} ziyaret · {row.uniqueCustomers} cari
                    </p>
                  </div>
                </div>
                <span className="hidden text-center text-lg font-bold tabular-nums text-emerald-300 sm:block">
                  {row.totalVisits}
                </span>
                <span className="hidden text-center text-sm font-semibold text-slate-300 sm:block">
                  {row.uniqueCustomers}
                </span>
                <span className="hidden text-center text-xs text-slate-400 sm:block">
                  {lastVisitKey ? formatReportDateLabel(lastVisitKey) : '-'}
                </span>
                <span className="ml-auto flex h-8 w-8 items-center justify-center rounded-lg border border-[var(--crm-app-border)] text-slate-400 sm:ml-0">
                  {isExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                </span>
              </button>

              {isExpanded ? (
                <div className="border-t border-[var(--crm-app-border)] bg-[var(--crm-app-panel-muted)]/40 px-4 py-3">
                  <div className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-400">
                    Cari Bazli Ziyaretler
                  </div>
                  <div className="space-y-2">
                    {customers.map((customer) => (
                      <div
                        key={customer.customerKey}
                        className="flex flex-col gap-1 rounded-xl border border-[var(--crm-app-border)] bg-[var(--crm-app-list-card)] px-3 py-2.5 sm:flex-row sm:items-center sm:justify-between"
                      >
                        <div className="min-w-0">
                          <p className="truncate font-medium text-slate-100">{customer.customerName}</p>
                          <p className="text-xs text-slate-400">
                            Son ziyaret: {formatReportDateLabel(customer.lastDateKey)}
                          </p>
                        </div>
                        <span className="inline-flex w-fit items-center rounded-full bg-emerald-500/15 px-2.5 py-1 text-xs font-bold tabular-nums text-emerald-300 ring-1 ring-emerald-500/25">
                          {customer.count} ziyaret
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              ) : null}
            </div>
          );
        })}
      </div>
    </div>
  );
}
