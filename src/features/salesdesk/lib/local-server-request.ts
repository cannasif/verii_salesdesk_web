import { getLocalServerUrl } from './local-server-url';

interface LocalServerEnvelope<T> {
  success?: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export class LocalServerUnavailableError extends Error {
  constructor(message = 'Yerel sunucuya ulasilamadi.') {
    super(message);
    this.name = 'LocalServerUnavailableError';
  }
}

export async function requestLocalServerJson<T>(path: string, init?: RequestInit): Promise<T> {
  let response: Response;
  try {
    response = await fetch(`${getLocalServerUrl()}${path}`, {
      ...init,
      headers: {
        'Content-Type': 'application/json',
        ...(init?.headers ?? {}),
      },
      signal: init?.signal ?? AbortSignal.timeout(15_000),
    });
  } catch {
    throw new LocalServerUnavailableError(
      'Yerel sunucuya ulasilamadi. "npm run dev" ile baslatin veya production ortaminda yardimci sunucuyu deploy edin.'
    );
  }

  const payload = (await response.json().catch(() => ({}))) as LocalServerEnvelope<T>;
  if (!response.ok || payload.success === false) {
    throw new Error(payload.error || payload.message || `Sunucu hatasi (${response.status}).`);
  }

  if (payload.data === undefined) {
    if (init?.method === 'DELETE' && response.ok) {
      return undefined as T;
    }
    throw new Error('Yerel sunucudan gecersiz yanit alindi.');
  }

  return payload.data;
}

export async function isLocalServerReachable(): Promise<boolean> {
  try {
    await requestLocalServerJson<{ ok?: boolean }>('/health');
    return true;
  } catch {
    return false;
  }
}
