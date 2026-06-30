import { useUserList } from '@/features/user-management/hooks/useUserList';

export interface SalesRepOption {
  id: number;
  fullName: string;
}

export const useSalesRepOptions = () => {
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
        fullName: user.fullName || `${user.firstName || ''} ${user.lastName || ''}`.trim() || user.username || '',
      })) || [],
    isLoading,
  };
};
