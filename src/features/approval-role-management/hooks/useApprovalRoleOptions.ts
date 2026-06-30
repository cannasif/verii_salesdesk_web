import { useQuery } from '@tanstack/react-query';
import { approvalRoleApi } from '../api/approval-role-api';
import { approvalRoleQueryKeys } from '../utils/query-keys';
import type { ApprovalRoleDto } from '../types/approval-role-types';

export const useApprovalRoleOptions = (): ReturnType<typeof useQuery<ApprovalRoleDto[]>> => {
  return useQuery({
    queryKey: approvalRoleQueryKeys.options(),
    queryFn: async (): Promise<ApprovalRoleDto[]> => {
      const response = await approvalRoleApi.getList({
        pageNumber: 1,
        pageSize: 1000,
        sortBy: 'Name',
        sortDirection: 'asc',
      });
      return response.data || [];
    },
    staleTime: 5 * 60 * 1000,
  });
};
