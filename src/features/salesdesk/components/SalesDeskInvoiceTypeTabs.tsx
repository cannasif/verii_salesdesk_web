import { type ReactElement } from 'react';
import { cn } from '@/lib/utils';
import {
  SALES_DESK_INVOICE_TYPE_FILTER_OPTIONS,
  type SalesDeskInvoiceTypeFilter,
} from '../types/invoice-types';

interface SalesDeskInvoiceTypeTabsProps {
  value: SalesDeskInvoiceTypeFilter;
  onChange: (value: SalesDeskInvoiceTypeFilter) => void;
  counts?: Partial<Record<SalesDeskInvoiceTypeFilter, number>>;
}

export function SalesDeskInvoiceTypeTabs({
  value,
  onChange,
  counts,
}: SalesDeskInvoiceTypeTabsProps): ReactElement {
  return (
    <div className="flex w-full flex-wrap gap-2 sm:w-auto">
      {SALES_DESK_INVOICE_TYPE_FILTER_OPTIONS.map((option) => {
        const isActive = value === option.value;
        const count = counts?.[option.value];
        return (
          <button
            key={option.value}
            type="button"
            onClick={() => onChange(option.value)}
            className={cn(
              'inline-flex min-h-[44px] flex-1 items-center justify-center gap-2 rounded-lg border px-4 text-sm font-medium transition-colors sm:flex-none',
              isActive
                ? 'border-[color-mix(in_srgb,var(--crm-brand-primary)_35%,transparent)] bg-[var(--crm-brand-soft)] text-[var(--crm-brand-on-soft)]'
                : 'border-[var(--crm-app-border)] bg-[var(--crm-app-panel-muted)] text-slate-300 hover:border-[color-mix(in_srgb,var(--crm-brand-primary)_22%,transparent)] hover:text-slate-100'
            )}
          >
            {option.label}
            {count != null ? (
              <span
                className={cn(
                  'rounded-md px-1.5 py-0.5 text-[11px] font-semibold tabular-nums',
                  isActive ? 'bg-[color-mix(in_srgb,var(--crm-brand-primary)_18%,transparent)]' : 'bg-white/5'
                )}
              >
                {count}
              </span>
            ) : null}
          </button>
        );
      })}
    </div>
  );
}
