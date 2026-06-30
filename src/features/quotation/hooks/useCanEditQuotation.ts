import { useQuery, type UseQueryResult } from '@tanstack/react-query';
import { quotationApi } from '../api/quotation-api';
import { queryKeys } from '../utils/query-keys';

export const useCanEditQuotation = (quotationId: number): UseQueryResult<boolean, Error> => {
  return useQuery({
    queryKey: queryKeys.canEdit(quotationId),
    queryFn: () => quotationApi.canEdit(quotationId),
    enabled: !!quotationId,
    staleTime: 5 * 60 * 1000,
  });
};
