import { useQuery, type UseQueryOptions } from '@tanstack/react-query';
import { permissionGroupApi } from '../api/permissionGroupApi';
import { ACCESS_CONTROL_QUERY_KEYS } from '../utils/query-keys';
import type { PagedRequest, PagedResponse, PermissionGroupDto } from '../types/access-control.types';

const STALE_TIME_MS = 30_000;

type PermissionGroupsQueryOptions = Omit<
  UseQueryOptions<PagedResponse<PermissionGroupDto>>,
  'queryKey' | 'queryFn'
>;

export const usePermissionGroupsQuery = (params: PagedRequest, options?: PermissionGroupsQueryOptions) => {
  const queryParams = {
    pageNumber: params.pageNumber,
    pageSize: params.pageSize,
    search: params.search,
    sortBy: params.sortBy,
    sortDirection: params.sortDirection,
    filters: params.filters,
  };

  return useQuery({
    queryKey: ACCESS_CONTROL_QUERY_KEYS.PERMISSION_GROUPS(queryParams),
    queryFn: () => permissionGroupApi.getList(params),
    staleTime: STALE_TIME_MS,
    ...options,
  });
};
