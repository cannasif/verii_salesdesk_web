import { type ReactElement, useMemo } from 'react';
import { CalendarDays, X } from 'lucide-react';
import { tr } from 'react-day-picker/locale';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { formatDate } from '../../lib/salesdesk-shared';
import {
  datesToInputValues,
  inputValuesToDates,
  MAX_VISIT_FORM_DATE_FILTERS,
} from '../../lib/visit-form-list-filters';

interface SalesDeskVisitFormDateFilterProps {
  selectedDates: string[];
  onSelectedDatesChange: (dates: string[]) => void;
  disabled?: boolean;
}

export function SalesDeskVisitFormDateFilter({
  selectedDates,
  onSelectedDatesChange,
  disabled = false,
}: SalesDeskVisitFormDateFilterProps): ReactElement {
  const selectedDateObjects = useMemo(() => inputValuesToDates(selectedDates), [selectedDates]);
  const hasSelection = selectedDates.length > 0;

  const handleSelect = (dates: Date[] | undefined): void => {
    const nextDates = datesToInputValues(dates ?? []);
    if (nextDates.length > MAX_VISIT_FORM_DATE_FILTERS) {
      toast.info(`En fazla ${MAX_VISIT_FORM_DATE_FILTERS} tarih seçebilirsiniz.`);
      onSelectedDatesChange(nextDates.slice(0, MAX_VISIT_FORM_DATE_FILTERS));
      return;
    }
    onSelectedDatesChange(nextDates);
  };

  const removeDate = (date: string): void => {
    onSelectedDatesChange(selectedDates.filter((item) => item !== date));
  };

  return (
    <div className="space-y-2">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
        <Popover>
          <PopoverTrigger asChild>
            <Button
              type="button"
              variant="outline"
              disabled={disabled}
              className={cn(
                'h-10 w-full justify-start gap-2 rounded-xl border-[var(--crm-app-border)] bg-[var(--crm-app-input)] px-3 text-sm font-medium text-slate-700 dark:text-slate-200 sm:w-auto',
                hasSelection &&
                  'border-[color-mix(in_srgb,var(--crm-brand-primary)_35%,transparent)] bg-[var(--crm-brand-soft)] text-[var(--crm-brand-accent)]'
              )}
            >
              <CalendarDays size={16} />
              {hasSelection ? `${selectedDates.length} tarih seçili` : 'Tarih filtrele'}
            </Button>
          </PopoverTrigger>
          <PopoverContent
            align="start"
            className="w-auto min-w-[19rem] border-[var(--crm-app-border)] bg-[var(--crm-app-panel)] p-0"
          >
            <div className="border-b border-[var(--crm-app-border)] px-3 py-2 text-xs text-[var(--crm-app-text-muted)]">
              Aynı anda en fazla {MAX_VISIT_FORM_DATE_FILTERS} tarih seçebilirsiniz.
            </div>
            <Calendar
              mode="multiple"
              locale={tr}
              selected={selectedDateObjects}
              onSelect={handleSelect}
              initialFocus
              className="rounded-none bg-transparent p-2"
            />
            {hasSelection ? (
              <div className="flex items-center justify-between gap-2 border-t border-[var(--crm-app-border)] px-3 py-2">
                <span className="text-xs text-[var(--crm-app-text-muted)]">
                  {selectedDates.length} / {MAX_VISIT_FORM_DATE_FILTERS} tarih
                </span>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="h-8 px-2 text-xs"
                  onClick={() => onSelectedDatesChange([])}
                >
                  Temizle
                </Button>
              </div>
            ) : null}
          </PopoverContent>
        </Popover>

        {hasSelection ? (
          <Button
            type="button"
            variant="ghost"
            disabled={disabled}
            className="h-10 w-full rounded-xl text-xs font-medium text-slate-600 dark:text-slate-300 sm:w-auto"
            onClick={() => onSelectedDatesChange([])}
          >
            Filtreyi kaldır
          </Button>
        ) : null}
      </div>

      {hasSelection ? (
        <div className="flex flex-wrap gap-2">
          {selectedDates.map((date) => (
            <Badge
              key={date}
              variant="secondary"
              className="gap-1 rounded-lg border border-[var(--crm-app-border)] bg-[var(--crm-app-panel-muted)] px-2 py-1 text-xs font-medium text-slate-700 dark:text-slate-200"
            >
              {formatDate(date)}
              <button
                type="button"
                aria-label={`${formatDate(date)} tarihini kaldır`}
                className="rounded-sm p-0.5 text-[var(--crm-app-text-muted)] transition-colors hover:text-rose-500"
                onClick={() => removeDate(date)}
              >
                <X size={12} />
              </button>
            </Badge>
          ))}
        </div>
      ) : null}
    </div>
  );
}
