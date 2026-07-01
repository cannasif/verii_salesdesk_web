import type { ColumnDef } from '@/components/shared/ColumnPreferencesPopover';
import type { FilterColumnConfig } from '@/lib/advanced-filter-types';
import type { GridExportColumn } from '@/lib/grid-export';
import type { SalesDeskColumn } from '../components/SalesDeskListLayout';

export function salesDeskColumnsToColumnDefs<T>(columns: SalesDeskColumn<T>[]): ColumnDef[] {
  return columns.map((column) => ({
    key: column.key,
    label: column.header,
  }));
}

export function salesDeskColumnsToFilterColumns<T>(columns: SalesDeskColumn<T>[]): FilterColumnConfig[] {
  return columns.map((column) => ({
    value: column.key,
    type: column.filterType ?? 'string',
    labelKey: column.key,
    label: column.header,
  }));
}

export function buildSalesDeskExportData<T extends object>(
  rows: T[],
  visibleColumnKeys: string[],
  columns: SalesDeskColumn<T>[]
): { exportColumns: GridExportColumn[]; exportRows: Record<string, unknown>[] } {
  const exportColumns: GridExportColumn[] = visibleColumnKeys.map((key) => ({
    key,
    label: columns.find((column) => column.key === key)?.header ?? key,
  }));

  const exportRows = rows.map((row) =>
    Object.fromEntries(
      visibleColumnKeys.map((key) => {
        const column = columns.find((item) => item.key === key);
        if (column?.exportValue) {
          return [key, column.exportValue(row)];
        }
        const raw = (row as Record<string, unknown>)[key];
        return [key, raw ?? ''];
      })
    )
  );

  return { exportColumns, exportRows };
}
