export const surfaceClass =
  'border border-[var(--crm-app-border)] bg-[var(--crm-app-panel)] shadow-sm dark:bg-[color-mix(in_srgb,var(--crm-app-panel)_72%,transparent)] dark:shadow-[inset_0_1px_0_rgba(255,255,255,.04),0_18px_48px_rgba(0,0,0,.18)] dark:backdrop-blur-xl';

export const salesDeskPageShellClass = 'space-y-5 text-slate-900 dark:text-slate-100';
export const salesDeskPageTitleClass = 'text-2xl font-semibold text-slate-900 dark:text-slate-50';
export const salesDeskPageSubtitleClass = 'mt-1 text-sm text-slate-600 dark:text-slate-400';
export const salesDeskSectionTitleClass = 'text-lg font-semibold text-slate-900 dark:text-slate-50';
export const salesDeskStatValueClass = 'font-semibold text-slate-900 dark:text-slate-100';

export const fieldClass = [
  'h-11 rounded-lg border border-[var(--crm-app-border)] bg-[var(--crm-app-input)] px-4 text-sm text-slate-900 dark:text-slate-200 outline-none',
  'focus-visible:!border-[var(--crm-brand-accent)] focus-visible:!ring-0 focus-visible:!shadow-[0_0_0_3px_var(--crm-brand-focus-glow)]',
  'focus:!border-[var(--crm-brand-accent)] focus:!shadow-[0_0_0_3px_var(--crm-brand-focus-glow)]',
  'transition-[color,box-shadow,border-color] duration-150',
].join(' ');

export const PAGE_SIZE_OPTIONS = [10, 20, 50] as const;

export function formatMoney(value: number): string {
  return new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(value);
}

export function formatDate(value?: string | null): string {
  if (!value) return '-';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat('tr-TR').format(date);
}

export function formatTime(value?: string | null): string {
  if (!value) return '-';
  if (/^\d{2}:\d{2}/.test(value)) return value.slice(0, 5);
  return value;
}

export function toDateInputValue(value?: string | null): string {
  if (!value) return new Date().toISOString().slice(0, 10);
  return value.slice(0, 10);
}

export function toTimeInputValue(value?: string | null): string {
  if (!value) return '';
  const match = value.match(/(\d{2}:\d{2})/);
  return match?.[1] ?? '';
}

/**
 * `<input type="time">` degeri "HH:mm" formatinda gelir. Backend TimeSpan alanlari
 * "HH:mm:ss" bekledigi icin saniye eklenerek normalize edilir.
 */
export function toTimePayloadValue(value?: string | null): string | undefined {
  if (!value) return undefined;
  const match = value.match(/^(\d{2}):(\d{2})(?::(\d{2}))?/);
  if (!match) return undefined;
  const [, hours, minutes, seconds] = match;
  return `${hours}:${minutes}:${seconds ?? '00'}`;
}

/** API NextCodeAsync beklemeden benzersiz demirbas kodu uretir. */
export function buildAutoAssetCode(): string {
  const year = new Date().getUTCFullYear();
  const stamp = String(Date.now()).slice(-6);
  return `DMR${year}${stamp.padStart(6, '0')}`;
}

export interface SalesDeskSelectOption {
  value: string;
  label: string;
}

/** Radix Select does not allow empty string item values. */
export const NONE_SELECT_VALUE = '__none__';

export function withNoneOption(
  options: SalesDeskSelectOption[],
  label = 'Secilmedi'
): SalesDeskSelectOption[] {
  return [
    { value: NONE_SELECT_VALUE, label },
    ...options.filter((option) => option.value && option.value !== NONE_SELECT_VALUE),
  ];
}

export function idToSelectValue(id?: number | null): string {
  return id ? String(id) : NONE_SELECT_VALUE;
}

export function sanitizeSelectOptions(options: SalesDeskSelectOption[]): SalesDeskSelectOption[] {
  return options.map((option) =>
    !option.value || option.value.trim() === ''
      ? { ...option, value: NONE_SELECT_VALUE }
      : option
  );
}

export function normalizeSelectValue(value?: string | null): string {
  if (value == null || value === '') return NONE_SELECT_VALUE;
  return value;
}

export function enumToSelectOptions<T extends number>(
  labels: Record<T, string>
): SalesDeskSelectOption[] {
  return (Object.keys(labels) as unknown as T[]).map((key) => ({
    value: String(key),
    label: labels[key],
  }));
}

export function optionalIdFromSelect(value?: string): number | undefined {
  if (!value || value === '' || value === NONE_SELECT_VALUE || value === '0') return undefined;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : undefined;
}

export function optionalGroupNameFromSelect(value?: string): string | undefined {
  if (!value || value === NONE_SELECT_VALUE) return undefined;
  const trimmed = value.trim();
  return trimmed || undefined;
}

export function requiredIdFromSelect(value: string, field = 'Secim'): number {
  if (!value || value === NONE_SELECT_VALUE) {
    throw new Error(`${field} zorunludur`);
  }
  const parsed = Number(value);
  if (!Number.isFinite(parsed) || parsed <= 0) {
    throw new Error(`${field} zorunludur`);
  }
  return parsed;
}

/** API / SQL hatalarini kullaniciya anlasilir Turkce mesaja cevirir. */
export function formatSalesDeskApiError(error: unknown, fallback: string): string {
  const responseLike = error && typeof error === 'object' ? (error as Record<string, unknown>) : null;
  const responseMessage =
    typeof responseLike?.message === 'string' && responseLike.message.trim().length > 0
      ? responseLike.message
      : typeof responseLike?.exceptionMessage === 'string' && responseLike.exceptionMessage.trim().length > 0
        ? responseLike.exceptionMessage
        : Array.isArray(responseLike?.errors)
          ? responseLike.errors.find((item): item is string => typeof item === 'string' && item.trim().length > 0)
          : null;
  const raw =
    error instanceof Error
      ? error.message
      : typeof error === 'string'
        ? error
        : responseMessage
          ? responseMessage
        : fallback;
  const text = raw.trim() || fallback;
  const lower = text.toLowerCase();

  if (lower.includes('invalid object name') || lower.includes('invalid column name')) {
    return 'Veritabani guncellemesi eksik. API sunucusunda migration uygulanmali.';
  }
  if (lower.includes('status code 405') || lower.includes('method not allowed')) {
    return 'Bu islem su anda tamamlanamiyor. Sayfayi yenileyip tekrar deneyin; devam ederse destek ekibi kontrol etmeli.';
  }
  if (lower.includes('entity changes') || lower.includes('inner exception')) {
    return 'Kayit veritabanina yazilamadi. Zorunlu alanlari ve veritabani guncelligini kontrol edin.';
  }
  if (lower.includes('duplicate') || lower.includes('unique') || lower.includes('409')) {
    return 'Bu kayit numarasi veya benzersiz alan zaten kullaniliyor.';
  }
  if (
    lower.includes('sql exception') ||
    lower.includes('microsoft.data.sqlclient') ||
    lower.includes('stack trace') ||
    lower.includes('internal server error') ||
    lower.includes('sunucu hatasi')
  ) {
    return fallback;
  }

  return text;
}
