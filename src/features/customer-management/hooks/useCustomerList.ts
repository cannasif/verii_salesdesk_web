import { useQuery } from '@tanstack/react-query';
import { customerApi } from '../api/customer-api';
import { queryKeys } from '../utils/query-keys';
import type { PagedParams, PagedFilter } from '@/types/api';
import { normalizeQueryParams } from '@/utils/query-params';

export const useCustomerList = (
  params: PagedParams & { filters?: PagedFilter[] | Record<string, unknown> }
) => {
  return useQuery({
    queryKey: queryKeys.list(normalizeQueryParams(params)),
    queryFn: () => customerApi.getList(params),
    staleTime: 5 * 60 * 1000,
  });
};
