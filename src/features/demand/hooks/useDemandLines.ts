import { useQuery, type UseQueryResult } from '@tanstack/react-query';
import { demandApi } from '../api/demand-api';
import { queryKeys } from '../utils/query-keys';
import type { DemandLineGetDto } from '../types/demand-types';

export const useDemandLines = (demandId: number): UseQueryResult<DemandLineGetDto[], Error> => {
  return useQuery({
    queryKey: queryKeys.demandLines(demandId),
    queryFn: () => demandApi.getDemandLinesByDemandId(demandId),
    enabled: !!demandId && demandId > 0,
    staleTime: 5 * 60 * 1000,
  });
};
