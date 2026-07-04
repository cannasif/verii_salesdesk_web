/** Teklif uzaktan senkron — liste bekletilmez. */
export const REMOTE_QUOTE_TIMEOUT_MS = 2_500;

/** SalesDesk tablo listeleri — sunumda 30sn beklemeyi engeller. */
export const SALESDESK_LIST_TIMEOUT_MS = 5_000;

export async function withSalesDeskFastTimeout<T>(
  promise: Promise<T>,
  timeoutMs = REMOTE_QUOTE_TIMEOUT_MS,
): Promise<T> {
  let timer: ReturnType<typeof setTimeout> | undefined;

  try {
    return await Promise.race([
      promise,
      new Promise<T>((_, reject) => {
        timer = setTimeout(() => reject(new Error('REMOTE_TIMEOUT')), timeoutMs);
      }),
    ]);
  } finally {
    if (timer) clearTimeout(timer);
  }
}

export async function tryWithSalesDeskFastTimeout<T>(
  promise: Promise<T>,
  timeoutMs = REMOTE_QUOTE_TIMEOUT_MS,
): Promise<T | null> {
  try {
    return await withSalesDeskFastTimeout(promise, timeoutMs);
  } catch {
    return null;
  }
}

export async function tryWithSalesDeskListTimeout<T>(
  promise: Promise<T>,
  timeoutMs = SALESDESK_LIST_TIMEOUT_MS,
): Promise<T | null> {
  return tryWithSalesDeskFastTimeout(promise, timeoutMs);
}
