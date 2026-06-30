import { useQuery } from '@tanstack/react-query';
import { approvalApi } from '../api/approval-api';
import { queryKeys } from '../utils/query-keys';
import type { ApprovalTransactionDto } from '../types/approval-types';

export const useApprovalHistory = (quotationId: number) => {
  return useQuery<ApprovalTransactionDto[]>({
    queryKey: queryKeys.approvalHistory(quotationId),
    queryFn: () => approvalApi.getApprovalHistory(quotationId),
    enabled: !!quotationId,
    staleTime: 5 * 60 * 1000,
  });
};
