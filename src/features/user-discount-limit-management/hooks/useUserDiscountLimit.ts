import { useQuery } from '@tanstack/react-query';
import { userDiscountLimitApi } from '../api/user-discount-limit-api';
import { queryKeys } from '../utils/query-keys';
import type { UserDiscountLimitDto } from '../types/user-discount-limit-types';

export const useUserDiscountLimit = (id: number): ReturnType<typeof useQuery<UserDiscountLimitDto>> => {
  return useQuery({
    queryKey: queryKeys.detail(id),
    queryFn: () => userDiscountLimitApi.getById(id),
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
  });
};
