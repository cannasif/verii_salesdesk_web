import { getLocalServerUrl } from './local-server-url';

export interface LocalServerHealth {
  ok: boolean;
  message?: string;
}

export async function pingLocalServerHealth(): Promise<LocalServerHealth> {
  const base = getLocalServerUrl();
  const url = base ? `${base}/health` : '/health';

  try {
    const response = await fetch(url, {
      method: 'GET',
      cache: 'no-store',
      signal: AbortSignal.timeout(5000),
    });

    if (!response.ok) {
      return { ok: false, message: `Yerel sunucu yaniti: HTTP ${response.status}` };
    }

    const payload = (await response.json().catch(() => ({}))) as { ok?: boolean };
    if (payload.ok === false) {
      return { ok: false, message: 'Yerel sunucu saglik kontrolu basarisiz.' };
    }

    return { ok: true };
  } catch {
    return {
      ok: false,
      message:
        'Yerel sunucuya ulasilamadi. Gruplar, sohbet, Gmail koprusu ve ERP haber meta icin "npm run dev" veya ayri sunucu gerekir.',
    };
  }
}
