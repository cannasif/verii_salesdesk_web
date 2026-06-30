import { useQuery } from '@tanstack/react-query';
import { dashboardApi } from '../api/dashboard-api';
import { queryKeys } from '../utils/query-keys';
import type { CurrencyRate } from '../types/dashboard';

export const useCurrencyRatesQuery = (): ReturnType<typeof useQuery<CurrencyRate[]>> => {
  return useQuery({
    queryKey: queryKeys.currencyRates(),
    queryFn: dashboardApi.getCurrencyRates,
    staleTime: 300000,
  });
};
