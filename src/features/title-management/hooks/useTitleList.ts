import { useQuery } from '@tanstack/react-query';
import { titleApi } from '../api/title-api';
import { queryKeys } from '../utils/query-keys';
import type { PagedParams, PagedFilter } from '@/types/api';
import type { TitleDto } from '../types/title-types';
import type { PagedResponse } from '@/types/api';
import { normalizeQueryParams } from '@/utils/query-params';

export const useTitleList = (
  params: PagedParams & { filters?: PagedFilter[] | Record<string, unknown> }
): ReturnType<typeof useQuery<PagedResponse<TitleDto>>> => {
  return useQuery({
    queryKey: queryKeys.list(normalizeQueryParams(params)),
    queryFn: () => titleApi.getList(params),
    staleTime: 30000,
  });
};
