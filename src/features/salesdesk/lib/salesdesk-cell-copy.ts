import { toast } from 'sonner';
import type { SalesDeskColumn } from '../components/SalesDeskListLayout';

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

  const raw = (row as Record<string, unknown>)[column.key];
  if (raw == null || String(raw).trim() === '') return null;
  return String(raw).trim();
}

export async function copySalesDeskCellValue(text: string, columnLabel: string): Promise<void> {
  try {
    if (typeof navigator !== 'undefined' && navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(text);
    } else if (typeof document !== 'undefined') {
      const textarea = document.createElement('textarea');
      textarea.value = text;
      textarea.setAttribute('readonly', 'true');
      textarea.style.position = 'fixed';
      textarea.style.opacity = '0';
      textarea.style.pointerEvents = 'none';
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand('copy');
      document.body.removeChild(textarea);
    } else {
      throw new Error('Clipboard unavailable');
    }

    toast.success('Kopyalandi', { description: columnLabel });
  } catch {
    toast.error('Kopyalanamadi');
  }
}
