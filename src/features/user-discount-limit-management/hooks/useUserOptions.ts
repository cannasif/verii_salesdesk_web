import { useQuery } from '@tanstack/react-query';
import { userApi } from '@/features/user-management/api/user-api';
import type { UserDto } from '@/features/user-management/types/user-types';

export const useUserOptions = (): ReturnType<typeof useQuery<UserDto[]>> => {
  return useQuery({
    queryKey: ['userOptions', 'active'],
    queryFn: async (): Promise<UserDto[]> => {
      const response = await userApi.getList({
        pageNumber: 1,
        pageSize: 1000,
        sortBy: 'Id',
        sortDirection: 'asc',
      });
      const allUsers = response.data || [];
      const activeUsers = allUsers.filter((user: UserDto) => user.isActive === true);
      return activeUsers.sort((a, b) => {
        const nameA = (a.fullName || a.username || '').toLowerCase();
        const nameB = (b.fullName || b.username || '').toLowerCase();
        return nameA.localeCompare(nameB, 'tr');
      });
    },
    staleTime: 5 * 60 * 1000,
  });
};
