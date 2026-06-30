import { useQuery } from '@tanstack/react-query';
import { approvalFlowApi } from '../api/approval-flow-api';
import { queryKeys } from '../utils/query-keys';
import type { ApprovalFlowDto } from '../types/approval-flow-types';

export const useApprovalFlowDetail = (id: number) => {
  return useQuery<ApprovalFlowDto>({
    queryKey: queryKeys.detail(id),
    queryFn: () => approvalFlowApi.getById(id),
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
  });
};
