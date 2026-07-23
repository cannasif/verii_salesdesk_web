import { toast } from 'sonner';

export async function copyTableCellValue(text: string, columnLabel?: string): Promise<void> {
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

export function resolveRowCellCopyValue<TRow>(
  row: TRow,
  columnKey: string,
  copyValue?: (row: TRow) => string | number | boolean | null | undefined
): string | null {
  if (copyValue) {
    const value = copyValue(row);
    if (value == null || String(value).trim() === '') return null;
    return String(value).trim();
  }

  const raw = (row as Record<string, unknown>)[columnKey];
  if (raw == null) return null;
  if (typeof raw === 'object') return null;

  const text = String(raw).trim();
  if (!text || text === '-') return null;
  return text;
}
