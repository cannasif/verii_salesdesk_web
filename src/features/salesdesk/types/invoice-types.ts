import type { SalesDeskInvoiceDto } from '../api/salesdesk-api';
import type { SalesDeskInvoiceType } from '../api/salesdesk-api';

/** 1 = Satis, 2 = Alis */
export type { SalesDeskInvoiceType };

export const SALES_DESK_INVOICE_TYPE = {
  sales: 1,
  purchase: 2,
} as const satisfies Record<string, SalesDeskInvoiceType>;

export type SalesDeskInvoiceTypeFilter = 'all' | 'sales' | 'purchase';

export const SALES_DESK_INVOICE_TYPE_LABELS: Record<SalesDeskInvoiceType, string> = {
  1: 'Satis Faturasi',
  2: 'Alis Faturasi',
};

export const SALES_DESK_INVOICE_TYPE_FILTER_OPTIONS: {
  value: SalesDeskInvoiceTypeFilter;
  label: string;
}[] = [
  { value: 'all', label: 'Tumu' },
  { value: 'sales', label: 'Satis Faturalari' },
  { value: 'purchase', label: 'Alis Faturalari' },
];

export function resolveInvoiceType(invoice: SalesDeskInvoiceDto): SalesDeskInvoiceType {
  return invoice.invoiceType === 2 ? 2 : 1;
}

export function filterInvoicesByType(
  rows: SalesDeskInvoiceDto[],
  filter: SalesDeskInvoiceTypeFilter
): SalesDeskInvoiceDto[] {
  if (filter === 'all') return rows;
  const target = filter === 'sales' ? SALES_DESK_INVOICE_TYPE.sales : SALES_DESK_INVOICE_TYPE.purchase;
  return rows.filter((row) => resolveInvoiceType(row) === target);
}

export function invoiceTypeFromRouteParam(value: string | undefined): SalesDeskInvoiceType {
  return value === 'purchase' ? SALES_DESK_INVOICE_TYPE.purchase : SALES_DESK_INVOICE_TYPE.sales;
}

export function invoiceTypeRouteSegment(type: SalesDeskInvoiceType): 'sales' | 'purchase' {
  return type === SALES_DESK_INVOICE_TYPE.purchase ? 'purchase' : 'sales';
}
