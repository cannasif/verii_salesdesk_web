import { useQuery, type UseQueryResult } from '@tanstack/react-query';
import { quotationApi } from '../api/quotation-api';
import type { PriceOfProductDto } from '../types/quotation-types';

export const usePriceOfProduct = (productCode?: string, groupCode?: string, enabled = false): UseQueryResult<PriceOfProductDto[], Error> => {
  return useQuery({
    queryKey: ['priceOfProduct', productCode, groupCode],
    queryFn: () => quotationApi.getPriceOfProduct([{ productCode: productCode || '', groupCode: groupCode || '' }]),
    enabled: enabled && !!productCode && !!groupCode,
    staleTime: 2 * 60 * 1000,
  });
};
