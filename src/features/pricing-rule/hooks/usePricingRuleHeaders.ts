import { useQuery, type UseQueryResult } from '@tanstack/react-query';
import { pricingRuleApi } from '../api/pricing-rule-api';
import { pricingRuleQueryKeys } from '../utils/query-keys';
import type { PagedParams, PagedFilter, PagedResponse } from '@/types/api';
import type { PricingRuleFilter, PricingRuleHeaderGetDto } from '../types/pricing-rule-types';

export const usePricingRuleHeaders = (params?: PagedParams, filter?: PricingRuleFilter): UseQueryResult<PagedResponse<PricingRuleHeaderGetDto>, Error> => {
  const queryParams: PagedParams & { filters?: PagedFilter[] | Record<string, unknown> } = {
    ...params,
    ...filter,
  };

  return useQuery({
    queryKey: pricingRuleQueryKeys.headerList(queryParams),
    queryFn: () => pricingRuleApi.getHeaders(queryParams),
    staleTime: 5 * 60 * 1000,
  });
};
