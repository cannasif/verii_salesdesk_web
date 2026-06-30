import { useQuery, type UseQueryResult } from '@tanstack/react-query';
import { pricingRuleApi } from '../api/pricing-rule-api';
import { pricingRuleQueryKeys } from '../utils/query-keys';
import type { PricingRuleHeaderGetDto } from '../types/pricing-rule-types';

export const usePricingRuleHeader = (id: number): UseQueryResult<PricingRuleHeaderGetDto, Error> => {
  return useQuery({
    queryKey: pricingRuleQueryKeys.header(id),
    queryFn: () => pricingRuleApi.getHeaderById(id),
    enabled: !!id && id > 0,
    staleTime: 5 * 60 * 1000,
  });
};
