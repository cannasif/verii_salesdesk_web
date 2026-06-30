import { useQuery } from '@tanstack/react-query';
import { approvalRoleApi } from '../api/approval-role-api';
import { approvalRoleQueryKeys } from '../utils/query-keys';
import type { ApprovalRoleDto } from '../types/approval-role-types';

export const useApprovalRoleDetail = (
  id: number | null
): ReturnType<typeof useQuery<ApprovalRoleDto>> => {
  return useQuery({
    queryKey: approvalRoleQueryKeys.detail(id ?? 0),
    queryFn: () => approvalRoleApi.getById(id!),
    enabled: id !== null && id > 0,
    staleTime: 60000,
  });
};
