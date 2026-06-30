import { useQuery, type UseQueryResult } from '@tanstack/react-query';
import { demandApi } from '../api/demand-api';
import { queryKeys } from '../utils/query-keys';
import type { DemandExchangeRateGetDto } from '../types/demand-types';

export const useDemandExchangeRates = (demandId: number): UseQueryResult<DemandExchangeRateGetDto[], Error> => {
  return useQuery({
    queryKey: queryKeys.demandExchangeRates(demandId),
    queryFn: () => demandApi.getDemandExchangeRatesByDemandId(demandId),
    enabled: !!demandId && demandId > 0,
    staleTime: 5 * 60 * 1000,
  });
};
