import { useQuery, type UseQueryResult } from '@tanstack/react-query';
import { quotationApi } from '../api/quotation-api';
import { queryKeys } from '../utils/query-keys';
import type { ApprovalStatus } from '../types/quotation-types';

export const useQuotationApprovalStatus = (quotationId: number): UseQueryResult<ApprovalStatus, Error> => {
  return useQuery({
    queryKey: queryKeys.approvalStatus(quotationId),
    queryFn: () => quotationApi.getApprovalStatus(quotationId),
    enabled: !!quotationId,
    staleTime: 5 * 60 * 1000,
  });
};
