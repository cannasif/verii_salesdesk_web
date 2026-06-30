import { useQuery, type UseQueryResult } from '@tanstack/react-query';
import { demandApi } from '../api/demand-api';
import { queryKeys } from '../utils/query-keys';
import type { UserDiscountLimitDto } from '../types/demand-types';

export const useUserDiscountLimitsBySalesperson = (salespersonId: number | null | undefined): UseQueryResult<UserDiscountLimitDto[], Error> => {
  return useQuery({
    queryKey: queryKeys.userDiscountLimitsBySalesperson(salespersonId || 0),
    queryFn: () => demandApi.getUserDiscountLimitsBySalespersonId(salespersonId || 0),
    enabled: !!salespersonId && salespersonId > 0,
    staleTime: 5 * 60 * 1000,
  });
};
