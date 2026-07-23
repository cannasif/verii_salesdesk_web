import type { SalesDeskColumn } from '../components/SalesDeskListLayout';

export function resolveSalesDeskDetailSubtitle<T extends object>(
  row: T,
  columns: SalesDeskColumn<T>[],
  primaryKey?: string
): string {
  const key = primaryKey ?? columns[0]?.key;
  if (!key) return 'Kayit bilgilerini goruntuluyorsunuz.';

  const column = columns.find((item) => item.key === key);
  if (column?.exportValue) {
    const value = column.exportValue(row);
    if (value != null && String(value).trim()) return String(value);
  }

  const raw = (row as Record<string, unknown>)[key];
  if (raw != null && String(raw).trim()) return String(raw);

  return 'Kayit bilgilerini goruntuluyorsunuz.';
}
