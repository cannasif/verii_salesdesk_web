import { useQuery } from '@tanstack/react-query';
import { productPricingApi } from '../api/product-pricing-api';
import { queryKeys } from '../utils/query-keys';
import type { PagedParams, PagedFilter } from '@/types/api';
import type { ProductPricingGetDto } from '../types/product-pricing-types';
import type { PagedResponse } from '@/types/api';

export const useProductPricings = (
  params: PagedParams & { filters?: PagedFilter[] | Record<string, unknown> }
): ReturnType<typeof useQuery<PagedResponse<ProductPricingGetDto>>> => {
  return useQuery({
    queryKey: queryKeys.list(params),
    queryFn: () => productPricingApi.getList(params),
    staleTime: 5 * 60 * 1000,
  });
};
