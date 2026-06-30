import { useUserList } from '@/features/user-management/hooks/useUserList';
import type { User } from '../types/demand-types';

interface UseUsersReturn {
  data: User[];
  isLoading: boolean;
}

export const useUsers = (): UseUsersReturn => {
  const { data, isLoading } = useUserList({
    pageNumber: 1,
    pageSize: 1000,
    sortBy: 'FirstName',
    sortDirection: 'asc',
    filters: [{ column: 'isActive', operator: 'eq', value: 'true' }],
  });
  return {
    data:
      data?.data?.map((user) => ({
        id: user.id,
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        fullName: `${user.firstName || ''} ${user.lastName || ''}`.trim(),
      })) || [],
    isLoading,
  };
};
