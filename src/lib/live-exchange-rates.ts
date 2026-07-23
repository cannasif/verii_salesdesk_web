import type { KurDto } from '@/services/erp-types';

export type NavbarLiveRateCode = 'USD' | 'EUR' | 'GBP' | 'ALTIN';

export interface NavbarLiveRateDefinition {
  code: NavbarLiveRateCode;
  labels: readonly string[];
}

export interface NavbarLiveRateItem {
  code: NavbarLiveRateCode;
  value: number;
  formatted: string;
}

export const NAVBAR_LIVE_RATE_DEFINITIONS: readonly NavbarLiveRateDefinition[] = [
  { code: 'USD', labels: ['USD', 'DOLAR', 'DOLLAR', 'ABD DOLARI'] },
  { code: 'EUR', labels: ['EUR', 'EURO', 'AVRO'] },
  { code: 'GBP', labels: ['GBP', 'STERLIN', 'POUND'] },
  { code: 'ALTIN', labels: ['ALTIN', 'GOLD', 'XAU', 'GAU', 'GRAM ALTIN', 'GR ALTIN', 'HAS ALTIN'] },
] as const;

export const NAVBAR_LIVE_RATE_DISPLAY: Record<
  NavbarLiveRateCode,
  { shortCode: string; label: string }
> = {
  USD: { shortCode: 'USD', label: 'Dolar' },
  EUR: { shortCode: 'EUR', label: 'Euro' },
  GBP: { shortCode: 'GBP', label: 'Sterlin' },
  ALTIN: { shortCode: 'ALTIN', label: 'Gram Altın' },
};

const normalizeCurrencyToken = (value: unknown): string =>
  String(value ?? '')
    .trim()
    .toUpperCase()
    .replace(/İ/g, 'I')
    .replace(/Ş/g, 'S')
    .replace(/Ğ/g, 'G')
    .replace(/Ü/g, 'U')
    .replace(/Ö/g, 'O')
    .replace(/Ç/g, 'C');

function getCurrencyTokens(value: unknown): string[] {
  const normalized = normalizeCurrencyToken(value);
  if (!normalized) return [];

  const tokens = normalized.split(/[^A-Z0-9]+/).filter(Boolean);
  const compact = normalized.replace(/[^A-Z0-9]/g, '');
  return Array.from(new Set([...tokens, compact, normalized].filter(Boolean)));
}

function matchesRateDefinition(rate: KurDto, definition: NavbarLiveRateDefinition): boolean {
  const rateTokens = getCurrencyTokens(rate.dovizIsmi);
  const labelTokens = definition.labels.flatMap((label) => getCurrencyTokens(label));
  return rateTokens.some((token) => labelTokens.includes(token));
}

export function pickNavbarLiveRates(rates: KurDto[] | undefined): NavbarLiveRateItem[] {
  if (!rates?.length) return [];

  return NAVBAR_LIVE_RATE_DEFINITIONS.flatMap((definition) => {
    const match = rates.find((rate) => matchesRateDefinition(rate, definition));
    const value = Number(match?.kurDegeri ?? 0);
    if (!match || !Number.isFinite(value) || value <= 0) return [];

    return [
      {
        code: definition.code,
        value,
        formatted: formatNavbarLiveRate(value, definition.code),
      },
    ];
  });
}

export function formatNavbarLiveRate(value: number, code: NavbarLiveRateCode): string {
  const fractionDigits = code === 'ALTIN' ? 2 : 4;
  return new Intl.NumberFormat('tr-TR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: fractionDigits,
  }).format(value);
}
