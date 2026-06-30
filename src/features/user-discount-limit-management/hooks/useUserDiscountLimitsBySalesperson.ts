import { useQuery } from '@tanstack/react-query';
import { userDiscountLimitApi } from '../api/user-discount-limit-api';
import { queryKeys } from '../utils/query-keys';
import type { UserDiscountLimitDto } from '../types/user-discount-limit-types';

export const useUserDiscountLimitsBySalesperson = (salespersonId: number): ReturnType<typeof useQuery<UserDiscountLimitDto[]>> => {
  return useQuery({
    queryKey: queryKeys.bySalesperson(salespersonId),
    queryFn: () => userDiscountLimitApi.getBySalespersonId(salespersonId),
    enabled: !!salespersonId,
    staleTime: 5 * 60 * 1000,
  });
};
