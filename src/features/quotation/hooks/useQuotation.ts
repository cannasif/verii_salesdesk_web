import { useQuery, type UseQueryResult } from '@tanstack/react-query';
import { quotationApi } from '../api/quotation-api';
import { queryKeys } from '../utils/query-keys';
import type { QuotationGetDto } from '../types/quotation-types';

export const useQuotation = (id: number): UseQueryResult<QuotationGetDto, Error> => {
  return useQuery({
    queryKey: queryKeys.quotation(id),
    queryFn: () => quotationApi.getById(id),
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
  });
};
