import { useQuery } from '@tanstack/react-query';
import { productPricingApi } from '../api/product-pricing-api';
import { queryKeys } from '../utils/query-keys';
import type { ProductPricingGetDto } from '../types/product-pricing-types';

export const useProductPricing = (id: number): ReturnType<typeof useQuery<ProductPricingGetDto>> => {
  return useQuery({
    queryKey: queryKeys.detail(id),
    queryFn: () => productPricingApi.getById(id),
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
  });
};
