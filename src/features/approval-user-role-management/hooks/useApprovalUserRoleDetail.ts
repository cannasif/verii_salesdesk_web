import { useQuery } from '@tanstack/react-query';
import { approvalUserRoleApi } from '../api/approval-user-role-api';
import { approvalUserRoleQueryKeys } from '../utils/query-keys';
import type { ApprovalUserRoleDto } from '../types/approval-user-role-types';

export const useApprovalUserRoleDetail = (
  id: number | null
): ReturnType<typeof useQuery<ApprovalUserRoleDto>> => {
  return useQuery({
    queryKey: approvalUserRoleQueryKeys.detail(id ?? 0),
    queryFn: () => approvalUserRoleApi.getById(id!),
    enabled: id !== null && id > 0,
    staleTime: 60000,
  });
};
