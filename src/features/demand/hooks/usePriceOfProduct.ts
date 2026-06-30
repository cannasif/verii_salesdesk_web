import { useQuery, type UseQueryResult } from '@tanstack/react-query';
import { demandApi } from '../api/demand-api';
import type { PriceOfProductDto } from '../types/demand-types';

export const usePriceOfProduct = (productCode?: string, groupCode?: string, enabled = false): UseQueryResult<PriceOfProductDto[], Error> => {
  return useQuery({
    queryKey: ['priceOfProduct', productCode, groupCode],
    queryFn: () => demandApi.getPriceOfProduct([{ productCode: productCode || '', groupCode: groupCode || '' }]),
    enabled: enabled && !!productCode && !!groupCode,
    staleTime: 2 * 60 * 1000,
  });
};
