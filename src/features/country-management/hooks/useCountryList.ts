import { useQuery } from '@tanstack/react-query';
import { countryApi } from '../api/country-api';
import { queryKeys } from '../utils/query-keys';
import type { PagedParams, PagedFilter } from '@/types/api';
import { normalizeQueryParams } from '@/utils/query-params';

export const useCountryList = (
  params: PagedParams & { filters?: PagedFilter[] | Record<string, unknown> }
) => {
  return useQuery({
    queryKey: queryKeys.list(normalizeQueryParams(params)),
    queryFn: () => countryApi.getList(params),
    staleTime: 5 * 60 * 1000,
  });
};
