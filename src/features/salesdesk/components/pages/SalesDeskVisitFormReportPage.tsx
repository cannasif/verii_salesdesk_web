import { type ReactElement, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  BarChart3,
  Building2,
  ChevronLeft,
  ChevronRight,
  ClipboardList,
  Loader2,
  MapPin,
  Users,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  useSalesDeskUserOptions,
  useSalesDeskVisitFormList,
} from '../../hooks/useSalesDeskModules';
import {
  addMonths,
  buildVisitFormReportRows,
  buildVisitFormReportSummary,
  buildReportDateRange,
  filterVisitFormsByDateRange,
  formatMonthRange,
  getMonthStart,
  type VisitFormReportPeriod,
} from '../../lib/visit-form-report';
import { addDays, formatWeekRange, getWeekStart } from '../../lib/salesdesk-weekly-plan';
import {
  SD_PAGE_HEADER_ROW,
  SD_PAGE_ICON_BOX,
  SD_PAGE_PULSE,
  SD_PAGE_TITLE,
} from '../../lib/salesdesk-popup-styles';
import { SalesDeskKpiCards, type SalesDeskKpiItem } from '../SalesDeskKpiCards';
import { SalesDeskVisitFormReportGrid } from '../visit-form-report/SalesDeskVisitFormReportGrid';
import { SalesDeskVisitFormReportMonthView } from '../visit-form-report/SalesDeskVisitFormReportMonthView';

const VISIT_FORM_REPORT_FETCH_SIZE = 1000;

export function SalesDeskVisitFormReportPage(): ReactElement {
  const navigate = useNavigate();
  const [period, setPeriod] = useState<VisitFormReportPeriod>('week');
  const [anchorDate, setAnchorDate] = useState<Date>(() => getWeekStart());
  const [visitorFilter, setVisitorFilter] = useState<string>('all');

  const {
    data: users,
    isPending: usersPending,
    isError: usersError,
    error: usersFetchError,
  } = useSalesDeskUserOptions();
  const {
    data: formData,
    isPending: formsPending,
    isError: formsError,
    error: formsFetchError,
  } = useSalesDeskVisitFormList({
    pageNumber: 1,
    pageSize: VISIT_FORM_REPORT_FETCH_SIZE,
    sortBy: 'FormDate',
    sortDirection: 'desc',
  });

  const dateRange = useMemo(
    () => buildReportDateRange(period, anchorDate),
    [period, anchorDate]
  );

  const filteredForms = useMemo(
    () => filterVisitFormsByDateRange(formData?.data ?? [], dateRange.startKey, dateRange.endKey),
    [formData?.data, dateRange.endKey, dateRange.startKey]
  );

  const reportRows = useMemo(
    () => buildVisitFormReportRows(filteredForms, users ?? []),
    [filteredForms, users]
  );

  const visibleRows = useMemo(() => {
    if (visitorFilter === 'all') return reportRows;
    return reportRows.filter((row) => row.visitorKey === visitorFilter);
  }, [reportRows, visitorFilter]);

  const summary = useMemo(() => buildVisitFormReportSummary(reportRows), [reportRows]);

  const kpiItems = useMemo<SalesDeskKpiItem[]>(
    () => [
      {
        key: 'total-visits',
        label: 'Toplam Ziyaret',
        value: summary.totalVisits,
        tone: 'brand',
        icon: MapPin,
      },
      {
        key: 'visitors',
        label: 'Ziyaretci Sayisi',
        value: summary.uniqueVisitors,
        tone: 'emerald',
        icon: Users,
      },
      {
        key: 'customers',
        label: 'Farkli Cari',
        value: summary.uniqueCustomers,
        tone: 'sky',
        icon: Building2,
      },
      {
        key: 'avg',
        label: 'Kisi Basina Ort.',
        value: summary.avgVisitsPerVisitor.toLocaleString('tr-TR', {
          minimumFractionDigits: 1,
          maximumFractionDigits: 1,
        }),
        tone: 'amber',
        icon: BarChart3,
      },
    ],
    [summary]
  );

  const isLoading = usersPending || formsPending;
  const loadErrorMessage = formsError
    ? (formsFetchError as Error)?.message || 'Ziyaret formlari yuklenemedi.'
    : usersError
      ? (usersFetchError as Error)?.message || 'Kullanicilar yuklenemedi.'
      : null;

  const periodLabel =
    period === 'week' ? formatWeekRange(getWeekStart(anchorDate)) : formatMonthRange(getMonthStart(anchorDate));

  const resetToCurrentPeriod = (): void => {
    setAnchorDate(period === 'week' ? getWeekStart() : getMonthStart());
  };

  const shiftPeriod = (direction: -1 | 1): void => {
    setAnchorDate((current) =>
      period === 'week' ? addDays(current, direction * 7) : addMonths(current, direction)
    );
  };

  const handlePeriodChange = (nextPeriod: VisitFormReportPeriod): void => {
    setPeriod(nextPeriod);
    setAnchorDate(nextPeriod === 'week' ? getWeekStart() : getMonthStart());
    setVisitorFilter('all');
  };

  return (
    <div className="space-y-5 text-slate-100">
      <div className={SD_PAGE_HEADER_ROW}>
        <div className="flex min-w-0 items-start gap-3">
          <div className={SD_PAGE_ICON_BOX}>
            <ClipboardList size={22} />
          </div>
          <div className="min-w-0 space-y-1">
            <h1 className={SD_PAGE_TITLE}>Ziyaret Form Raporu</h1>
            <p className="flex items-center gap-2 text-sm font-medium text-zinc-500 dark:text-muted-foreground">
              <span className={`h-2 w-2 animate-pulse rounded-full ${SD_PAGE_PULSE}`} />
              Ziyaret formlarini ziyaretci, cari ve tarih bazinda haftalik / aylik takip et
            </p>
          </div>
        </div>
      </div>

      <SalesDeskKpiCards items={kpiItems} isLoading={isLoading} />

      <div className="flex flex-col gap-3 rounded-2xl border border-[var(--crm-app-border)] bg-[var(--crm-app-list-card)] px-4 py-3 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex flex-wrap items-center gap-2">
          <div className="inline-flex rounded-lg border border-[var(--crm-app-border)] p-0.5">
            <button
              type="button"
              onClick={() => handlePeriodChange('week')}
              className={cn(
                'h-10 rounded-md px-3 text-sm font-medium transition-colors',
                period === 'week'
                  ? 'bg-[var(--crm-app-panel-strong)] text-slate-100 shadow-sm ring-1 ring-[var(--crm-app-border)]'
                  : 'text-slate-400 hover:text-slate-200'
              )}
            >
              Haftalik
            </button>
            <button
              type="button"
              onClick={() => handlePeriodChange('month')}
              className={cn(
                'h-10 rounded-md px-3 text-sm font-medium transition-colors',
                period === 'month'
                  ? 'bg-[var(--crm-app-panel-strong)] text-slate-100 shadow-sm ring-1 ring-[var(--crm-app-border)]'
                  : 'text-slate-400 hover:text-slate-200'
              )}
            >
              Aylik
            </button>
          </div>

          <button
            type="button"
            onClick={resetToCurrentPeriod}
            className="h-11 min-h-[44px] rounded-lg border border-[var(--crm-app-border)] px-3 text-sm font-medium text-slate-200 transition-colors hover:bg-[var(--crm-app-panel-muted)] hover:text-white"
          >
            {period === 'week' ? 'Bu Hafta' : 'Bu Ay'}
          </button>
          <button
            type="button"
            onClick={() => shiftPeriod(-1)}
            className="flex h-11 w-11 min-h-[44px] min-w-[44px] items-center justify-center rounded-lg border border-[var(--crm-app-border)] text-slate-300 transition-colors hover:bg-[var(--crm-app-panel-muted)] hover:text-white"
            aria-label={period === 'week' ? 'Onceki hafta' : 'Onceki ay'}
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={() => shiftPeriod(1)}
            className="flex h-11 w-11 min-h-[44px] min-w-[44px] items-center justify-center rounded-lg border border-[var(--crm-app-border)] text-slate-300 transition-colors hover:bg-[var(--crm-app-panel-muted)] hover:text-white"
            aria-label={period === 'week' ? 'Sonraki hafta' : 'Sonraki ay'}
          >
            <ChevronRight className="h-4 w-4" />
          </button>
          <span className="w-full text-sm font-semibold text-slate-200 sm:ml-2 sm:w-auto">
            {periodLabel}
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <Select value={visitorFilter} onValueChange={setVisitorFilter}>
            <SelectTrigger className="h-11 min-w-[220px] border-[var(--crm-app-border)] bg-[var(--crm-app-input)]">
              <SelectValue placeholder="Tum ziyaretciler" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tum ziyaretciler</SelectItem>
              {reportRows.map((row) => (
                <SelectItem key={row.visitorKey} value={row.visitorKey}>
                  {row.visitorName} ({row.totalVisits})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <span className="text-xs text-slate-400">
            {visibleRows.length} ziyaretci · {filteredForms.length} form
          </span>
        </div>
      </div>

      {loadErrorMessage ? (
        <div className="rounded-lg border border-rose-400/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-200">
          <p>{loadErrorMessage}</p>
        </div>
      ) : null}

      {isLoading ? (
        <div className="flex justify-center py-16">
          <Loader2 className="animate-spin text-[var(--crm-brand-accent)]" size={32} />
        </div>
      ) : period === 'week' && dateRange.weekDays ? (
        <SalesDeskVisitFormReportGrid
          rows={visibleRows}
          weekDays={dateRange.weekDays}
          onFormSelect={(form) => navigate(`/salesdesk/visit-forms/${form.id}/edit`, { state: { visitForm: form } })}
        />
      ) : (
        <SalesDeskVisitFormReportMonthView rows={visibleRows} />
      )}
    </div>
  );
}
