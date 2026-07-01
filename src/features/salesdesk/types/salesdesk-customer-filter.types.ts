import type { FilterColumnConfig } from '@/lib/advanced-filter-types';
import { applyFilterRowsClient } from '@/lib/advanced-filter-types';
import type { FilterRow } from '@/lib/advanced-filter-types';
import type { SalesDeskCustomerDto } from '../api/salesdesk-api';

export const SALES_DESK_CUSTOMER_FILTER_COLUMNS: readonly FilterColumnConfig[] = [
  { value: 'code', type: 'string', labelKey: 'advancedFilter.columnCustomerCode' },
  { value: 'name', type: 'string', labelKey: 'advancedFilter.columnName' },
  { value: 'contactName', type: 'string', labelKey: 'advancedFilter.columnName' },
  { value: 'email', type: 'string', labelKey: 'advancedFilter.columnEmail' },
  { value: 'phone', type: 'string', labelKey: 'advancedFilter.columnPhone' },
  { value: 'city', type: 'string', labelKey: 'advancedFilter.columnCityName' },
  { value: 'balance', type: 'number', labelKey: 'advancedFilter.columnName' },
] as const;

export function applySalesDeskCustomerFilters(
  items: SalesDeskCustomerDto[],
  rows: FilterRow[]
): SalesDeskCustomerDto[] {
  return applyFilterRowsClient(items, rows, SALES_DESK_CUSTOMER_FILTER_COLUMNS);
}
