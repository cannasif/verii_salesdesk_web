import { useQuery, type UseQueryResult } from '@tanstack/react-query';
import { orderApi } from '../api/order-api';
import type { PriceOfProductDto } from '../types/order-types';

export const usePriceOfProduct = (productCode?: string, groupCode?: string, enabled = false): UseQueryResult<PriceOfProductDto[], Error> => {
  return useQuery({
    queryKey: ['priceOfProduct', productCode, groupCode],
    queryFn: () => orderApi.getPriceOfProduct([{ productCode: productCode || '', groupCode: groupCode || '' }]),
    enabled: enabled && !!productCode && !!groupCode,
    staleTime: 2 * 60 * 1000,
  });
};
