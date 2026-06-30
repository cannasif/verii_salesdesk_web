import { useQuery, type UseQueryResult } from '@tanstack/react-query';
import { demandApi } from '../api/demand-api';
import { queryKeys } from '../utils/query-keys';
import type { PricingRuleLineGetDto } from '../types/demand-types';

export const usePriceRuleOfDemand = (
  customerCode: string | null | undefined,
  salesmenId: number | null | undefined,
  demandDate: string | null | undefined
): UseQueryResult<PricingRuleLineGetDto[], Error> => {
  const enabled = !!customerCode && !!salesmenId && !!demandDate;

  return useQuery({
    queryKey: queryKeys.priceRuleOfDemand(
      customerCode || '',
      salesmenId || 0,
      demandDate || ''
    ),
    queryFn: () => demandApi.getPriceRuleOfDemand(
      customerCode!,
      salesmenId!,
      demandDate!
    ),
    enabled,
    staleTime: 2 * 60 * 1000,
  });
};
