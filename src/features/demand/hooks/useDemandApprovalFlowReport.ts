import { useQuery, type UseQueryResult } from '@tanstack/react-query';
import { demandApi } from '../api/demand-api';
import { queryKeys } from '../utils/query-keys';
import type { DemandApprovalFlowReportDto } from '../types/demand-types';

export function useDemandApprovalFlowReport(
  demandId: number
): UseQueryResult<DemandApprovalFlowReportDto | undefined, Error> {
  return useQuery({
    queryKey: queryKeys.approvalFlowReport(demandId),
    queryFn: () => demandApi.getApprovalFlowReport(demandId),
    enabled: !!demandId && demandId > 0,
    staleTime: 60 * 1000,
  });
}
