import { useQuery, type UseQueryResult } from '@tanstack/react-query';
import { orderApi } from '../api/order-api';
import { queryKeys } from '../utils/query-keys';
import type { ApprovalStatus } from '../types/order-types';

export const useOrderApprovalStatus = (orderId: number): UseQueryResult<ApprovalStatus, Error> => {
  return useQuery({
    queryKey: queryKeys.approvalStatus(orderId),
    queryFn: () => orderApi.getApprovalStatus(orderId),
    enabled: !!orderId,
    staleTime: 5 * 60 * 1000,
  });
};
