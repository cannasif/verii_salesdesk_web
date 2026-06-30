import { useQuery } from '@tanstack/react-query';
import { approvalFlowStepApi } from '../api/approval-flow-step-api';
import { queryKeys } from '../utils/query-keys';
import type { ApprovalFlowStepGetDto } from '../types/approval-flow-step-types';

export const useApprovalFlowStepList = (
  approvalFlowId: number
): ReturnType<typeof useQuery<ApprovalFlowStepGetDto[]>> => {
  return useQuery({
    queryKey: queryKeys.steps(approvalFlowId),
    queryFn: async (): Promise<ApprovalFlowStepGetDto[]> => {
      const response = await approvalFlowStepApi.getList({
        pageNumber: 1,
        pageSize: 1000,
        sortBy: 'StepOrder',
        sortDirection: 'asc',
      });
      const allSteps = response.data || [];
      return allSteps.filter((step) => step.approvalFlowId === approvalFlowId);
    },
    enabled: !!approvalFlowId,
    staleTime: 30 * 1000,
  });
};
