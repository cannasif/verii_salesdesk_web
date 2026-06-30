import { useQuery, type UseQueryResult } from '@tanstack/react-query';
import { pricingRuleApi } from '../api/pricing-rule-api';
import { pricingRuleQueryKeys } from '../utils/query-keys';
import type { PricingRuleLineGetDto } from '../types/pricing-rule-types';

export const usePricingRuleLinesByHeaderId = (headerId: number): UseQueryResult<PricingRuleLineGetDto[], Error> => {
  return useQuery({
    queryKey: pricingRuleQueryKeys.lines(headerId),
    queryFn: () => pricingRuleApi.getLinesByHeaderId(headerId),
    enabled: !!headerId && headerId > 0,
    staleTime: 5 * 60 * 1000,
  });
};
