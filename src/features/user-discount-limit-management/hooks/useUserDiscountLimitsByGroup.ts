import { useQuery } from '@tanstack/react-query';
import { userDiscountLimitApi } from '../api/user-discount-limit-api';
import { queryKeys } from '../utils/query-keys';
import type { UserDiscountLimitDto } from '../types/user-discount-limit-types';

export const useUserDiscountLimitsByGroup = (erpProductGroupCode: string): ReturnType<typeof useQuery<UserDiscountLimitDto[]>> => {
  return useQuery({
    queryKey: queryKeys.byGroup(erpProductGroupCode),
    queryFn: () => userDiscountLimitApi.getByErpProductGroupCode(erpProductGroupCode),
    enabled: !!erpProductGroupCode,
    staleTime: 5 * 60 * 1000,
  });
};
