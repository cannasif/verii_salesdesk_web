import { useQuery, type UseQueryResult } from '@tanstack/react-query';
import { quotationApi } from '../api/quotation-api';
import { queryKeys } from '../utils/query-keys';
import type { QuotationExchangeRateGetDto } from '../types/quotation-types';

export const useQuotationExchangeRates = (quotationId: number): UseQueryResult<QuotationExchangeRateGetDto[], Error> => {
  return useQuery({
    queryKey: queryKeys.quotationExchangeRates(quotationId),
    queryFn: () => quotationApi.getQuotationExchangeRatesByQuotationId(quotationId),
    enabled: !!quotationId && quotationId > 0,
    staleTime: 5 * 60 * 1000,
  });
};
