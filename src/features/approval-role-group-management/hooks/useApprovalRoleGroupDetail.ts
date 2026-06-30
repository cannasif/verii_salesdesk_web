import { useQuery } from '@tanstack/react-query';
import { approvalRoleGroupApi } from '../api/approval-role-group-api';
import { approvalRoleGroupQueryKeys } from '../utils/query-keys';
import type { ApprovalRoleGroupDto } from '../types/approval-role-group-types';

export const useApprovalRoleGroupDetail = (
  id: number | null
): ReturnType<typeof useQuery<ApprovalRoleGroupDto>> => {
  return useQuery({
    queryKey: approvalRoleGroupQueryKeys.detail(id ?? 0),
    queryFn: () => approvalRoleGroupApi.getById(id!),
    enabled: id !== null && id > 0,
    staleTime: 60000,
  });
};
