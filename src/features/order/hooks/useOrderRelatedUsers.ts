import { useQuery, type UseQueryResult } from '@tanstack/react-query';
import { orderApi } from '../api/order-api';
import { queryKeys } from '../utils/query-keys';
import type { ApprovalScopeUserDto } from '../types/order-types';

export const useOrderRelatedUsers = (userId: number | null | undefined): UseQueryResult<ApprovalScopeUserDto[], Error> => {
  return useQuery({
    queryKey: queryKeys.relatedUsers(userId ?? 0),
    queryFn: () => orderApi.getOrderRelatedUsers(userId ?? 0),
    enabled: !!userId && userId > 0,
    staleTime: 5 * 60 * 1000,
  });
};
