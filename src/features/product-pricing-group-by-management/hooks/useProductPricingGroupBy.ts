import { useQuery } from '@tanstack/react-query';
import { productPricingGroupByApi } from '../api/product-pricing-group-by-api';
import { queryKeys } from '../utils/query-keys';
import type { ProductPricingGroupByDto } from '../types/product-pricing-group-by-types';

export const useProductPricingGroupBy = (id: number): ReturnType<typeof useQuery<ProductPricingGroupByDto>> => {
  return useQuery({
    queryKey: queryKeys.detail(id),
    queryFn: () => productPricingGroupByApi.getById(id),
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
  });
};
