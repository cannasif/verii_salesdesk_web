import { useQuery } from '@tanstack/react-query';
import { approvalRoleApi } from '../api/approval-role-api';
import { approvalRoleQueryKeys } from '../utils/query-keys';
import type { PagedParams, PagedFilter } from '@/types/api';
import type { ApprovalRoleDto } from '../types/approval-role-types';
import type { PagedResponse } from '@/types/api';
import { normalizeQueryParams } from '@/utils/query-params';

export const useApprovalRoleList = (
  params: PagedParams & { filters?: PagedFilter[] | Record<string, unknown> }
): ReturnType<typeof useQuery<PagedResponse<ApprovalRoleDto>>> => {
  return useQuery({
    queryKey: approvalRoleQueryKeys.list(normalizeQueryParams(params)),
    queryFn: () => approvalRoleApi.getList(params),
    staleTime: 30000,
  });
};
