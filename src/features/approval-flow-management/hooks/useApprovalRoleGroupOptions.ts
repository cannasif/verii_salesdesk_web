import { useQuery } from '@tanstack/react-query';
import { approvalRoleGroupApi } from '@/features/approval-role-group-management/api/approval-role-group-api';
import type { ApprovalRoleGroupDto } from '@/features/approval-role-group-management/types/approval-role-group-types';

export const useApprovalRoleGroupOptions = (): ReturnType<typeof useQuery<ApprovalRoleGroupDto[]>> => {
  return useQuery({
    queryKey: ['approval-role-group-options'],
    queryFn: async (): Promise<ApprovalRoleGroupDto[]> => {
      const response = await approvalRoleGroupApi.getList({
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
