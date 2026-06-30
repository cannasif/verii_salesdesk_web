import { useQuery, type UseQueryResult } from '@tanstack/react-query';
import { pricingRuleApi } from '../api/pricing-rule-api';
import { pricingRuleQueryKeys } from '../utils/query-keys';
import type { PricingRuleSalesmanGetDto } from '../types/pricing-rule-types';

export const usePricingRuleSalesmenByHeaderId = (headerId: number): UseQueryResult<PricingRuleSalesmanGetDto[], Error> => {
  return useQuery({
    queryKey: pricingRuleQueryKeys.salesmen(headerId),
    queryFn: () => pricingRuleApi.getSalesmenByHeaderId(headerId),
    enabled: !!headerId && headerId > 0,
    staleTime: 5 * 60 * 1000,
  });
};
