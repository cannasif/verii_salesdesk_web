import { useQuery } from '@tanstack/react-query';
import { approvalApi } from '../api/approval-api';
import { queryKeys } from '../utils/query-keys';
import type { QuotationDetailDto } from '../types/approval-types';

export const useQuotationDetail = (quotationId: number) => {
  return useQuery<QuotationDetailDto>({
    queryKey: queryKeys.quotationDetail(quotationId),
    queryFn: () => approvalApi.getQuotationDetail(quotationId),
    enabled: !!quotationId,
    staleTime: 5 * 60 * 1000,
  });
};
