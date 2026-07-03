/**
 * Yerel yardimci sunucu (Gmail koprusu, sohbet, gruplar, ERP meta) taban URL'si.
 * Gelistirmede bos string doner; Vite /gmail, /groups ve /socket.io isteklerini proxy'ler.
 * Production'da runtime-settings.json veya env ile ayarlanir; yoksa ayni origin kullanilir.
 */

let cachedLocalServerUrl: string | null = null;

export function setLocalServerUrl(url: string | null | undefined): void {
  const trimmed = url?.trim().replace(/\/$/, '') ?? '';
  cachedLocalServerUrl = trimmed || null;
}

export function getLocalServerUrl(): string {
  const fromEnv =
    (import.meta.env.VITE_CHAT_SERVER_URL as string | undefined) ||
    (import.meta.env.VITE_GMAIL_BRIDGE_URL as string | undefined);
  if (fromEnv?.trim()) {
    return fromEnv.trim().replace(/\/$/, '');
  }

  if (import.meta.env.DEV) {
    return '';
  }

  if (cachedLocalServerUrl) {
    return cachedLocalServerUrl;
  }

  if (typeof window !== 'undefined') {
    return window.location.origin;
  }

  return '';
}
