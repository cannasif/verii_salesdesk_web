import { useQuery, type UseQueryResult } from '@tanstack/react-query';
import { quotationApi } from '../api/quotation-api';
import { queryKeys } from '../utils/query-keys';
import type { QuotationApprovalFlowReportDto } from '../types/quotation-types';

export function useQuotationApprovalFlowReport(
  quotationId: number
): UseQueryResult<QuotationApprovalFlowReportDto | undefined, Error> {
  return useQuery({
    queryKey: queryKeys.approvalFlowReport(quotationId),
    queryFn: () => quotationApi.getApprovalFlowReport(quotationId),
    enabled: !!quotationId && quotationId > 0,
    staleTime: 60 * 1000,
  });
}
