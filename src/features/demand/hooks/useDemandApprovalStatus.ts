import { useQuery, type UseQueryResult } from '@tanstack/react-query';
import { demandApi } from '../api/demand-api';
import { queryKeys } from '../utils/query-keys';
import type { ApprovalStatus } from '../types/demand-types';

export const useDemandApprovalStatus = (demandId: number): UseQueryResult<ApprovalStatus, Error> => {
  return useQuery({
    queryKey: queryKeys.approvalStatus(demandId),
    queryFn: () => demandApi.getApprovalStatus(demandId),
    enabled: !!demandId,
    staleTime: 5 * 60 * 1000,
  });
};
