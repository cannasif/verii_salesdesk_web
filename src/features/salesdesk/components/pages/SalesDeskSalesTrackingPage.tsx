import { type ReactElement, useMemo } from 'react';
import { Columns3, Loader2 } from 'lucide-react';
import { useSalesDeskDashboard, useSalesDeskInvoiceStats, useSalesDeskQuoteStats } from '../../hooks/useSalesDeskModules';
import { formatMoney, surfaceClass } from '../../lib/salesdesk-shared';

export function SalesDeskSalesTrackingPage(): ReactElement {
  const { data: dashboard, isLoading: dashboardLoading, isError, error } = useSalesDeskDashboard();
  const { data: invoiceStats } = useSalesDeskInvoiceStats();
  const { data: quoteStats } = useSalesDeskQuoteStats();

  const invoiceRows = invoiceStats?.data ?? [];
  const quoteRows = quoteStats?.data ?? [];

  const issuedTotal = useMemo(
    () => invoiceRows.filter((item) => item.status === 6).reduce((sum, item) => sum + item.grandTotal, 0),
    [invoiceRows]
  );
  const approvedQuotes = quoteRows.filter((item) => item.status === 3).length;
  const orderedQuotes = quoteRows.filter((item) => item.status === 4).length;
  const uniqueCustomers = new Set(invoiceRows.map((item) => item.customerId)).size;

  return (
    <div className="space-y-5 text-slate-100">
      <div className="flex items-start gap-3">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-emerald-400/20 bg-emerald-500/15 text-emerald-300">
          <Columns3 size={22} />
        </div>
        <div>
          <h1 className="text-2xl font-semibold text-slate-50">Satis Takip</h1>
          <p className="mt-1 text-sm text-slate-400">Aylik performans ve fatura ozetleri</p>
        </div>
      </div>

      {isError && (
        <div className="rounded-lg border border-rose-400/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-200">
          {(error as Error)?.message || 'Veriler yuklenemedi.'}
        </div>
      )}

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {[
          {
            label: 'Aylik Satis',
            value: dashboardLoading ? '...' : formatMoney(dashboard?.monthlySalesTotal ?? 0),
            hint: 'Dashboard metrigi',
            tone: 'text-blue-300',
          },
          {
            label: 'Kesilen Fatura Toplami',
            value: formatMoney(issuedTotal),
            hint: `${uniqueCustomers} cari`,
            tone: 'text-emerald-300',
          },
          {
            label: 'Onayli Teklif',
            value: approvedQuotes,
            hint: 'Faturaya donusturulebilir',
            tone: 'text-green-300',
          },
          {
            label: 'Siparise Donen',
            value: orderedQuotes,
            hint: 'Teklif durumu',
            tone: 'text-[var(--crm-brand-on-soft)]',
          },
        ].map((metric) => (
          <div key={metric.label} className={`min-h-[116px] rounded-xl p-5 ${surfaceClass}`}>
            <p className="text-xs font-semibold uppercase text-slate-500">{metric.label}</p>
            {dashboardLoading && metric.label === 'Aylik Satis' ? (
              <Loader2 className="mt-3 animate-spin text-violet-300" />
            ) : (
              <>
                <p className={`mt-3 text-3xl font-semibold ${metric.tone}`}>{metric.value}</p>
                <p className="mt-2 text-sm text-slate-400">{metric.hint}</p>
              </>
            )}
          </div>
        ))}
      </div>

      <section className="rounded-xl border border-white/8 bg-slate-900/35 p-5">
        <h2 className="text-lg font-semibold">Fatura Durum Ozeti</h2>
        <div className="mt-4 grid gap-3 sm:grid-cols-3">
          {[
            { label: 'Toplam Fatura', value: invoiceStats?.totalCount ?? 0 },
            { label: 'Kesilecek', value: invoiceRows.filter((item) => item.status === 5).length },
            { label: 'Kesildi', value: invoiceRows.filter((item) => item.status === 6).length },
          ].map((item) => (
            <div key={item.label} className={`rounded-lg p-4 ${surfaceClass}`}>
              <p className="text-xs uppercase text-slate-500">{item.label}</p>
              <p className="mt-2 text-2xl font-semibold text-slate-100">{item.value}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
