import { type ReactElement } from 'react';
import { useTranslation } from 'react-i18next';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import type {
  Customer360CurrencyAmountDto,
  Customer360AnalyticsSummaryDto,
} from '../types/customer360.types';

const formatter = new Intl.NumberFormat(undefined, {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

interface CustomerCurrencySummaryCardsProps {
  isAllCurrencies: boolean;
  summary: Customer360AnalyticsSummaryDto | null | undefined;
  totalsByCurrency: Customer360CurrencyAmountDto[];
  isLoading: boolean;
  lastActivityDateFormatted: string;
}

export function CustomerCurrencySummaryCards({
  isAllCurrencies,
  summary,
  totalsByCurrency,
  isLoading,
  lastActivityDateFormatted,
}: CustomerCurrencySummaryCardsProps): ReactElement {
  const { t } = useTranslation();

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {[1, 2, 3, 4, 5].map((i) => (
          <Card key={i} className="rounded-xl border border-slate-200 dark:border-white/10">
            <CardContent className="pt-6">
              <Skeleton className="h-4 w-32 mb-2" />
              <Skeleton className="h-8 w-20" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (isAllCurrencies) {
    const list = totalsByCurrency ?? [];
    if (!list.length) {
      return (
        <Card className="rounded-xl border border-slate-200 dark:border-white/10">
          <CardContent className="pt-6 text-sm text-muted-foreground">
            {t('common.noData')}
          </CardContent>
        </Card>
      );
    }
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {list.map((row) => (
          <Card key={row.currency} className="rounded-xl border border-slate-200 dark:border-white/10">
            <CardContent className="pt-6">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                {row.currency}
              </p>
              <div className="mt-2 space-y-1 text-sm">
                <p>
                  <span className="text-muted-foreground">{t('customer360.currencyTotals.demandAmount')}:</span>{' '}
                  <span className="font-semibold">{formatter.format(row.demandAmount ?? 0)}</span>
                </p>
                <p>
                  <span className="text-muted-foreground">{t('customer360.currencyTotals.quotationAmount')}:</span>{' '}
                  <span className="font-semibold">{formatter.format(row.quotationAmount ?? 0)}</span>
                </p>
                <p>
                  <span className="text-muted-foreground">{t('customer360.currencyTotals.orderAmount')}:</span>{' '}
                  <span className="font-semibold">{formatter.format(row.orderAmount ?? 0)}</span>
                </p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  const s = summary ?? {
    last12MonthsOrderAmount: 0,
    openQuotationAmount: 0,
    openOrderAmount: 0,
    activityCount: 0,
    lastActivityDate: null,
    totalsByCurrency: [],
  };
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
      <Card className="rounded-xl border border-slate-200 dark:border-white/10">
        <CardContent className="pt-6">
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
            {t('customer360.analytics.last12MonthsOrderAmount')}
          </p>
          <p className="text-2xl font-bold mt-1">{formatter.format(s.last12MonthsOrderAmount ?? 0)}</p>
        </CardContent>
      </Card>
      <Card className="rounded-xl border border-slate-200 dark:border-white/10">
        <CardContent className="pt-6">
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
            {t('customer360.analytics.openQuotationAmount')}
          </p>
          <p className="text-2xl font-bold mt-1">{formatter.format(s.openQuotationAmount ?? 0)}</p>
        </CardContent>
      </Card>
      <Card className="rounded-xl border border-slate-200 dark:border-white/10">
        <CardContent className="pt-6">
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
            {t('customer360.analytics.openOrderAmount')}
          </p>
          <p className="text-2xl font-bold mt-1">{formatter.format(s.openOrderAmount ?? 0)}</p>
        </CardContent>
      </Card>
      <Card className="rounded-xl border border-slate-200 dark:border-white/10">
        <CardContent className="pt-6">
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
            {t('customer360.analytics.activityCount')}
          </p>
          <p className="text-2xl font-bold mt-1">{s.activityCount ?? 0}</p>
        </CardContent>
      </Card>
      <Card className="rounded-xl border border-slate-200 dark:border-white/10">
        <CardContent className="pt-6">
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
            {t('customer360.analytics.lastActivityDate')}
          </p>
          <p className="text-2xl font-bold mt-1">{lastActivityDateFormatted}</p>
        </CardContent>
      </Card>
    </div>
  );
}
