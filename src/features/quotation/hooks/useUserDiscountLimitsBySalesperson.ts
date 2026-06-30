import { useQuery, type UseQueryResult } from '@tanstack/react-query';
import { quotationApi } from '../api/quotation-api';
import { queryKeys } from '../utils/query-keys';
import type { UserDiscountLimitDto } from '../types/quotation-types';

export const useUserDiscountLimitsBySalesperson = (salespersonId: number | null | undefined): UseQueryResult<UserDiscountLimitDto[], Error> => {
  return useQuery({
    queryKey: queryKeys.userDiscountLimitsBySalesperson(salespersonId || 0),
    queryFn: () => quotationApi.getUserDiscountLimitsBySalespersonId(salespersonId || 0),
    enabled: !!salespersonId && salespersonId > 0,
    staleTime: 5 * 60 * 1000,
  });
};
