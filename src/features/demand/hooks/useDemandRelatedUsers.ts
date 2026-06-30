import { useQuery, type UseQueryResult } from '@tanstack/react-query';
import { demandApi } from '../api/demand-api';
import { queryKeys } from '../utils/query-keys';
import type { ApprovalScopeUserDto } from '../types/demand-types';

export const useDemandRelatedUsers = (userId: number | null | undefined): UseQueryResult<ApprovalScopeUserDto[], Error> => {
  return useQuery({
    queryKey: queryKeys.relatedUsers(userId ?? 0),
    queryFn: () => demandApi.getDemandRelatedUsers(userId ?? 0),
    enabled: !!userId && userId > 0,
    staleTime: 5 * 60 * 1000,
  });
};
