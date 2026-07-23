import {
  formatNavbarLiveRate,
  type NavbarLiveRateCode,
  type NavbarLiveRateItem,
} from '@/lib/live-exchange-rates';

const TRUNCGIL_LIVE_RATES_URL = 'https://finans.truncgil.com/v4/today.json';

type TruncgilEntry = {
  Buying?: number;
  Selling?: number;
  Type?: string;
  Name?: string;
  Change?: number;
};

type TruncgilPayload = Record<string, TruncgilEntry> & {
  Update_Date?: string;
};

const PUBLIC_RATE_SOURCES: readonly { code: NavbarLiveRateCode; keys: readonly string[] }[] = [
  { code: 'USD', keys: ['USD'] },
  { code: 'EUR', keys: ['EUR'] },
  { code: 'GBP', keys: ['GBP'] },
  { code: 'ALTIN', keys: ['GRA', 'HAS'] },
];

function readSellingValue(entry: TruncgilEntry | undefined): number | null {
  const value = Number(entry?.Selling ?? entry?.Buying ?? 0);
  return Number.isFinite(value) && value > 0 ? value : null;
}

export async function fetchPublicLiveRates(): Promise<{
  rates: NavbarLiveRateItem[];
  updatedAt: string | null;
}> {
  const response = await fetch(TRUNCGIL_LIVE_RATES_URL, {
    method: 'GET',
    headers: { Accept: 'application/json' },
  });

  if (!response.ok) {
    throw new Error('Canli kurlar alinamadi.');
  }

  const payload = (await response.json()) as TruncgilPayload;
  const rates = PUBLIC_RATE_SOURCES.flatMap(({ code, keys }) => {
    for (const key of keys) {
      const value = readSellingValue(payload[key]);
      if (value == null) continue;
      return [{ code, value, formatted: formatNavbarLiveRate(value, code) }];
    }
    return [];
  });

  if (rates.length === 0) {
    throw new Error('Canli kur verisi bos dondu.');
  }

  return {
    rates,
    updatedAt: payload.Update_Date ?? null,
  };
}
