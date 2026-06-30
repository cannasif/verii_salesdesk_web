import { useQuery } from '@tanstack/react-query';
import { productPricingGroupByApi } from '../api/product-pricing-group-by-api';
import { queryKeys } from '../utils/query-keys';
import type { PagedParams, PagedFilter } from '@/types/api';
import type { ProductPricingGroupByDto } from '../types/product-pricing-group-by-types';
import type { PagedResponse } from '@/types/api';
import { normalizeQueryParams } from '@/utils/query-params';

export const useProductPricingGroupBys = (
  params: PagedParams & { filters?: PagedFilter[] | Record<string, unknown> }
): ReturnType<typeof useQuery<PagedResponse<ProductPricingGroupByDto>>> => {
  return useQuery({
    queryKey: queryKeys.list(normalizeQueryParams(params)),
    queryFn: () => productPricingGroupByApi.getList(params),
    staleTime: 5 * 60 * 1000,
  });
};
