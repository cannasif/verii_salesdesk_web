import { useQuery, type UseQueryResult } from '@tanstack/react-query';
import { quotationApi } from '../api/quotation-api';
import { queryKeys } from '../utils/query-keys';
import type { PricingRuleLineGetDto } from '../types/quotation-types';

export const usePriceRuleOfQuotation = (
  customerCode: string | null | undefined,
  salesmenId: number | null | undefined,
  quotationDate: string | null | undefined
): UseQueryResult<PricingRuleLineGetDto[], Error> => {
  const enabled = !!customerCode && !!salesmenId && !!quotationDate;

  return useQuery({
    queryKey: queryKeys.priceRuleOfQuotation(
      customerCode || '',
      salesmenId || 0,
      quotationDate || ''
    ),
    queryFn: () => quotationApi.getPriceRuleOfQuotation(
      customerCode!,
      salesmenId!,
      quotationDate!
    ),
    enabled,
    staleTime: 2 * 60 * 1000,
  });
};
