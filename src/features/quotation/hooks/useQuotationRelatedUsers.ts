import { useQuery, type UseQueryResult } from '@tanstack/react-query';
import { quotationApi } from '../api/quotation-api';
import { queryKeys } from '../utils/query-keys';
import type { ApprovalScopeUserDto } from '../types/quotation-types';

export const useQuotationRelatedUsers = (userId: number | null | undefined): UseQueryResult<ApprovalScopeUserDto[], Error> => {
  return useQuery({
    queryKey: queryKeys.relatedUsers(userId ?? 0),
    queryFn: () => quotationApi.getQuotationRelatedUsers(userId ?? 0),
    enabled: !!userId && userId > 0,
    staleTime: 5 * 60 * 1000,
  });
};
