export function getLocalServerUrl(): string {
  const fromEnv =
    (import.meta.env.VITE_CHAT_SERVER_URL as string | undefined) ||
    (import.meta.env.VITE_GMAIL_BRIDGE_URL as string | undefined);
  if (fromEnv?.trim()) {
    return fromEnv.trim().replace(/\/$/, '');
  }

  return 'http://localhost:8787';
}
