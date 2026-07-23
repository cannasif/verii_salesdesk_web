import type { SalesDeskColumn } from '../components/SalesDeskListLayout';
import { copyTableCellValue, resolveRowCellCopyValue } from '@/lib/table-cell-copy';

export function resolveSalesDeskColumnCopyValue<T>(
  row: T,
  column: SalesDeskColumn<T>
): string | null {
  if (column.copyValue) {
    const value = column.copyValue(row);
    if (value == null || String(value).trim() === '') return null;
    return String(value).trim();
  }

  if (column.exportValue) {
    const value = column.exportValue(row);
    if (value == null || String(value).trim() === '') return null;
    return String(value).trim();
  }

  return resolveRowCellCopyValue(row, column.key);
}

export async function copySalesDeskCellValue(text: string, columnLabel: string): Promise<void> {
  await copyTableCellValue(text, columnLabel);
}
