import { useQuery, type UseQueryResult } from '@tanstack/react-query';
import { quotationApi } from '../api/quotation-api';
import { queryKeys } from '../utils/query-keys';
import type { QuotationLineGetDto } from '../types/quotation-types';

export const useQuotationLines = (quotationId: number): UseQueryResult<QuotationLineGetDto[], Error> => {
  return useQuery({
    queryKey: queryKeys.quotationLines(quotationId),
    queryFn: () => quotationApi.getQuotationLinesByQuotationId(quotationId),
    enabled: !!quotationId && quotationId > 0,
    staleTime: 5 * 60 * 1000,
  });
};
