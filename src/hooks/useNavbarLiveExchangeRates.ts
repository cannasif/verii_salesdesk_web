import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  NAVBAR_LIVE_RATE_DEFINITIONS,
  type NavbarLiveRateCode,
  type NavbarLiveRateItem,
} from '@/lib/live-exchange-rates';
import { fetchPublicLiveRates } from '@/services/live-rates-api';

export const LIVE_RATE_REFRESH_MS = 60_000;

export const NAVBAR_LIVE_RATE_CODES: readonly NavbarLiveRateCode[] = NAVBAR_LIVE_RATE_DEFINITIONS.map(
  (item) => item.code
);

export function useNavbarLiveExchangeRates(): {
  rates: NavbarLiveRateItem[];
  displayRates: Array<NavbarLiveRateItem | { code: NavbarLiveRateCode; formatted: string; pending: true }>;
  isLoading: boolean;
  isError: boolean;
  updatedAt: Date | null;
} {
  const todayKey = new Date().toISOString().slice(0, 10);
  const { data, isLoading, isError, isFetching } = useQuery({
    queryKey: ['live-rates', 'navbar', todayKey],
    queryFn: fetchPublicLiveRates,
    staleTime: 30_000,
    refetchInterval: LIVE_RATE_REFRESH_MS,
    retry: 2,
  });

  const rates = useMemo(() => data?.rates ?? [], [data?.rates]);
  const updatedAt = useMemo(() => {
    if (!data?.updatedAt) return null;
    const parsed = new Date(data.updatedAt.replace(' ', 'T'));
    return Number.isNaN(parsed.getTime()) ? null : parsed;
  }, [data?.updatedAt]);

  const displayRates = useMemo(
    () =>
      NAVBAR_LIVE_RATE_CODES.map((code) => {
        const match = rates.find((rate) => rate.code === code);
        if (match) return match;
        return { code, formatted: '—', pending: true as const };
      }),
    [rates]
  );

  return {
    rates,
    displayRates,
    isLoading: isLoading || (isFetching && rates.length === 0),
    isError,
    updatedAt,
  };
}
