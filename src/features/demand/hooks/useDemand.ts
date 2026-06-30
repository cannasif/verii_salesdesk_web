import { useQuery, type UseQueryResult } from '@tanstack/react-query';
import { demandApi } from '../api/demand-api';
import { queryKeys } from '../utils/query-keys';
import type { DemandGetDto } from '../types/demand-types';

export const useDemand = (id: number): UseQueryResult<DemandGetDto, Error> => {
  return useQuery({
    queryKey: queryKeys.demand(id),
    queryFn: () => demandApi.getById(id),
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
  });
};
