import { useQuery, type UseQueryResult } from '@tanstack/react-query';
import { orderApi } from '../api/order-api';
import { queryKeys } from '../utils/query-keys';
import type { OrderApprovalFlowReportDto } from '../types/order-types';

export function useOrderApprovalFlowReport(
  orderId: number
): UseQueryResult<OrderApprovalFlowReportDto | undefined, Error> {
  return useQuery({
    queryKey: queryKeys.approvalFlowReport(orderId),
    queryFn: () => orderApi.getApprovalFlowReport(orderId),
    enabled: !!orderId && orderId > 0,
    staleTime: 60 * 1000,
  });
}
