import { useQuery } from '@tanstack/react-query';
import { approvalUserRoleApi } from '../api/approval-user-role-api';
import { approvalUserRoleQueryKeys } from '../utils/query-keys';
import type { PagedParams, PagedFilter } from '@/types/api';
import type { ApprovalUserRoleDto } from '../types/approval-user-role-types';
import type { PagedResponse } from '@/types/api';
import { normalizeQueryParams } from '@/utils/query-params';

export const useApprovalUserRoleList = (
  params: PagedParams & { filters?: PagedFilter[] | Record<string, unknown> }
): ReturnType<typeof useQuery<PagedResponse<ApprovalUserRoleDto>>> => {
  return useQuery({
    queryKey: approvalUserRoleQueryKeys.list(normalizeQueryParams(params)),
    queryFn: () => approvalUserRoleApi.getList(params),
    staleTime: 30000,
  });
};
