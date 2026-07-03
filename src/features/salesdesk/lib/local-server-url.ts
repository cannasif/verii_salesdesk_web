/**
 * Yerel yardimci sunucu (Gmail koprusu, sohbet, gruplar) taban URL'si.
 * Gelistirmede bos string doner; Vite /gmail, /groups ve /socket.io isteklerini proxy'ler.
 */
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

  return 'http://localhost:8787';
}
