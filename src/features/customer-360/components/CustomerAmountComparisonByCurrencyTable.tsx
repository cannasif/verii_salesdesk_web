import { type ReactElement } from 'react';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';
import type { Customer360AmountComparisonDto } from '../types/customer360.types';

const formatter = new Intl.NumberFormat(undefined, {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

interface CustomerAmountComparisonByCurrencyTableProps {
  rows: Customer360AmountComparisonDto[];
  isLoading: boolean;
}

export function CustomerAmountComparisonByCurrencyTable({
  rows,
  isLoading,
}: CustomerAmountComparisonByCurrencyTableProps): ReactElement {
  const { t } = useTranslation();

  if (isLoading) {
    return (
      <Card className="rounded-xl border border-slate-200 dark:border-white/10">
        <CardHeader>
          <Skeleton className="h-5 w-48" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-32 w-full" />
        </CardContent>
      </Card>
    );
  }

  const list = rows ?? [];
  if (!list.length) {
    return (
      <Card className="rounded-xl border border-slate-200 dark:border-white/10">
        <CardHeader>
          <CardTitle className="text-base">
            {t('customer360.analyticsCharts.amountComparisonTitle')}
          </CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground">
          {t('common.noData')}
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="rounded-xl border border-slate-200 dark:border-white/10">
      <CardHeader>
        <CardTitle className="text-base">
          {t('customer360.analyticsCharts.amountComparisonTitle')}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{t('customer360.currencyTotals.currency')}</TableHead>
              <TableHead className="text-right">
                {t('customer360.analyticsCharts.last12MonthsOrderAmount')}
              </TableHead>
              <TableHead className="text-right">
                {t('customer360.analyticsCharts.openQuotationAmount')}
              </TableHead>
              <TableHead className="text-right">
                {t('customer360.analyticsCharts.openOrderAmount')}
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {list.map((row, idx) => (
              <TableRow key={row.currency ?? `amount-${idx}`}>
                <TableCell className="font-medium">{row.currency ?? '-'}</TableCell>
                <TableCell className="text-right">
                  {formatter.format(row.last12MonthsOrderAmount ?? 0)}
                </TableCell>
                <TableCell className="text-right">
                  {formatter.format(row.openQuotationAmount ?? 0)}
                </TableCell>
                <TableCell className="text-right">
                  {formatter.format(row.openOrderAmount ?? 0)}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
