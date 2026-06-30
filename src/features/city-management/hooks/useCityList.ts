import { useQuery } from '@tanstack/react-query';
import { cityApi } from '../api/city-api';
import { queryKeys } from '../utils/query-keys';
import type { PagedParams, PagedFilter } from '@/types/api';
import type { CityDto } from '../types/city-types';
import type { PagedResponse } from '@/types/api';
import { normalizeQueryParams } from '@/utils/query-params';

export const useCityList = (
  params: PagedParams & { filters?: PagedFilter[] | Record<string, unknown> }
): ReturnType<typeof useQuery<PagedResponse<CityDto>>> => {
  return useQuery({
    queryKey: queryKeys.list(normalizeQueryParams(params)),
    queryFn: () => cityApi.getList(params),
    staleTime: 5 * 60 * 1000,
  });
};
