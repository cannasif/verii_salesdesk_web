import { useQuery } from '@tanstack/react-query';
import { approvalRoleGroupApi } from '../api/approval-role-group-api';
import { approvalRoleGroupQueryKeys } from '../utils/query-keys';
import type { PagedParams, PagedFilter } from '@/types/api';
import type { ApprovalRoleGroupDto } from '../types/approval-role-group-types';
import type { PagedResponse } from '@/types/api';
import { normalizeQueryParams } from '@/utils/query-params';

export const useApprovalRoleGroupList = (
  params: PagedParams & { filters?: PagedFilter[] | Record<string, unknown> }
): ReturnType<typeof useQuery<PagedResponse<ApprovalRoleGroupDto>>> => {
  return useQuery({
    queryKey: approvalRoleGroupQueryKeys.list(normalizeQueryParams(params)),
    queryFn: () => approvalRoleGroupApi.getList(params),
    staleTime: 30000,
  });
};
