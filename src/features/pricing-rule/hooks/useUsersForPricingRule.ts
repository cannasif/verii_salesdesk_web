import { useUserList } from '@/features/user-management/hooks/useUserList';

export const useUsersForPricingRule = (): { data: Array<{ id: number; firstName: string; lastName: string; fullName: string }>; isLoading: boolean } => {
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
        fullName: `${user.firstName || ''} ${user.lastName || ''}`.trim() || user.fullName,
      })) || [],
    isLoading,
  };
};
