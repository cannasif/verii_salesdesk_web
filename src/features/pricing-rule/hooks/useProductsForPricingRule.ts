import { useProducts } from '@/features/quotation/hooks/useProducts';

export const useProductsForPricingRule = (search?: string): ReturnType<typeof useProducts> => {
  return useProducts(search);
};
