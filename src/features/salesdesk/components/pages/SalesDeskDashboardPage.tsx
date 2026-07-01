import { type ReactElement } from 'react';
import { CalendarDays, Loader2, Mail } from 'lucide-react';
import { useSalesDeskDashboard } from '../../hooks/useSalesDeskModules';
import { formatMoney, surfaceClass } from '../../lib/salesdesk-shared';

export function SalesDeskDashboardPage(): ReactElement {
  const { data, isLoading, isError, error } = useSalesDeskDashboard();
  const today = new Intl.DateTimeFormat('tr-TR', { dateStyle: 'long' }).format(new Date());

  const metrics = [
    { label: 'Aylik Satis', value: formatMoney(data?.monthlySalesTotal ?? 0), hint: 'Kesilen faturalar toplami', tone: 'text-slate-100' },
    { label: 'Acik Gorev', value: data?.openTaskCount ?? 0, hint: 'Takip edilen isler', tone: 'text-amber-400' },
    { label: 'Bugunku Ziyaret', value: data?.todayVisitCount ?? 0, hint: 'Planlanan gorusmeler', tone: 'text-[var(--crm-brand-text)]' },
    { label: 'Bekleyen Teklif', value: data?.pendingQuoteCount ?? 0, hint: 'Onay bekleyen teklifler', tone: 'text-emerald-400' },
  ];

  return (
    <div className="space-y-6 text-slate-100">
      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div>
          <h1 className="text-4xl font-semibold">
            Sales Desk <span className="text-[var(--crm-brand-text)]">Dashboard</span>
          </h1>
          <p className="mt-4 flex items-center gap-2 text-slate-400">
            <CalendarDays size={16} /> {today}
          </p>
        </div>
      </div>

      {isError && (
        <div className="rounded-lg border border-rose-400/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-200">
          {(error as Error)?.message || 'Dashboard yuklenemedi.'}
        </div>
      )}

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {metrics.map((metric) => (
          <div key={metric.label} className={`min-h-[116px] rounded-xl p-5 ${surfaceClass}`}>
            <p className="text-xs font-semibold uppercase text-slate-500">{metric.label}</p>
            {isLoading ? (
              <Loader2 className="mt-3 animate-spin text-[var(--crm-brand-on-soft)]" size={28} />
            ) : (
              <>
                <p className={`mt-3 text-3xl font-semibold ${metric.tone}`}>{metric.value}</p>
                <p className="mt-2 text-sm text-slate-400">{metric.hint}</p>
              </>
            )}
          </div>
        ))}
      </div>

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {[
          { label: 'Cari', value: data?.customerCount ?? 0 },
          { label: 'Potansiyel', value: data?.potentialCount ?? 0 },
          { label: 'Urun', value: data?.productCount ?? 0 },
          { label: 'Kesilecek Fatura', value: data?.toBeIssuedInvoiceCount ?? 0 },
        ].map((item) => (
          <div key={item.label} className={`rounded-xl p-4 ${surfaceClass}`}>
            <p className="text-xs uppercase text-slate-500">{item.label}</p>
            <p className="mt-2 text-2xl font-semibold text-slate-100">{isLoading ? '...' : item.value}</p>
          </div>
        ))}
      </div>

      <div className={`max-w-xl rounded-xl p-5 ${surfaceClass}`}>
        <div className="flex items-center gap-3">
          <Mail className="text-[var(--crm-brand-on-soft)]" size={22} />
          <div>
            <h2 className="text-lg font-semibold">Yaklasan Toplantilar</h2>
            <p className="text-sm text-slate-400">Gmail entegrasyonu ile toplanti davetleri burada listelenir.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
