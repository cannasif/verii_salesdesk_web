import { type ReactElement, useMemo } from 'react';
import { Columns3 } from 'lucide-react';
import { useSalesDeskDashboard, useSalesDeskInvoiceStats, useSalesDeskQuoteStats } from '../../hooks/useSalesDeskModules';
import { formatMoney, surfaceClass } from '../../lib/salesdesk-shared';
import {
  SD_PAGE_HEADER_ROW,
  SD_PAGE_PULSE,
  SD_PAGE_TITLE,
} from '../../lib/salesdesk-popup-styles';
import { SalesDeskKpiCards } from '../SalesDeskKpiCards';
import { salesDeskMetricsToKpiItems } from '../../lib/salesdesk-kpi-utils';

export function SalesDeskSalesTrackingPage(): ReactElement {
  const { data: dashboard, isLoading: dashboardLoading, isError, error } = useSalesDeskDashboard();
  const { data: invoiceStats } = useSalesDeskInvoiceStats();
  const { data: quoteStats } = useSalesDeskQuoteStats();

  const invoiceRows = useMemo(() => invoiceStats?.data ?? [], [invoiceStats?.data]);
  const quoteRows = useMemo(() => quoteStats?.data ?? [], [quoteStats?.data]);

  const issuedTotal = useMemo(
    () => invoiceRows.filter((item) => item.status === 6).reduce((sum, item) => sum + item.grandTotal, 0),
    [invoiceRows]
  );
  const approvedQuotes = quoteRows.filter((item) => item.status === 3).length;
  const orderedQuotes = quoteRows.filter((item) => item.status === 4).length;

  return (
    <div className="relative w-full space-y-6">
      <div className={SD_PAGE_HEADER_ROW}>
        <div className="flex min-w-0 items-start gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-emerald-400/20 bg-emerald-500/15 text-emerald-600 dark:text-emerald-300">
            <Columns3 size={22} />
          </div>
          <div className="min-w-0 space-y-1">
            <h1 className={SD_PAGE_TITLE}>Satis Takip</h1>
            <p className="flex items-center gap-2 text-sm font-medium text-zinc-500 dark:text-muted-foreground">
              <span className={`h-2 w-2 animate-pulse rounded-full ${SD_PAGE_PULSE}`} />
              Aylik performans ve fatura ozetleri
            </p>
          </div>
        </div>
      </div>

      {isError ? (
        <div className="rounded-lg border border-rose-400/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-200">
          {(error as Error)?.message || 'Veriler yuklenemedi.'}
        </div>
      ) : null}

      <SalesDeskKpiCards
        isLoading={dashboardLoading}
        items={salesDeskMetricsToKpiItems([
          {
            label: 'Aylik Satis',
            value: dashboardLoading ? '...' : formatMoney(dashboard?.monthlySalesTotal ?? 0),
            tone: 'cyan',
          },
          {
            label: 'Kesilen Fatura',
            value: formatMoney(issuedTotal),
            tone: 'green',
          },
          {
            label: 'Onayli Teklif',
            value: approvedQuotes,
            tone: 'green',
          },
          {
            label: 'Siparise Donen',
            value: orderedQuotes,
            tone: 'blue',
          },
        ])}
      />

      <section className={`rounded-xl p-4 sm:p-5 ${surfaceClass}`}>
        <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-50">Fatura Durum Ozeti</h2>
        <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-3">
          {[
            { label: 'Toplam Fatura', value: invoiceStats?.totalCount ?? 0 },
            { label: 'Kesilecek', value: invoiceRows.filter((item) => item.status === 5).length },
            { label: 'Kesildi', value: invoiceRows.filter((item) => item.status === 6).length },
          ].map((item) => (
            <div
              key={item.label}
              className="rounded-lg border border-[var(--crm-app-border)] bg-[var(--crm-app-panel-muted)] p-4"
            >
              <p className="text-xs uppercase text-slate-500">{item.label}</p>
              <p className="mt-2 text-2xl font-semibold text-slate-900 dark:text-slate-100">{item.value}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
