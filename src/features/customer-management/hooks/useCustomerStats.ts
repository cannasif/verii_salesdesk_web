import { useQuery } from '@tanstack/react-query';
import { customerApi } from '../api/customer-api';
import { queryKeys } from '../utils/query-keys';
import type { CustomerDto } from '../types/customer-types';

export interface CustomerStats {
  totalCustomers: number;
  approvedCustomers: number;
  newThisMonth: number;
}

export const useCustomerStats = () => {
  return useQuery<CustomerStats>({
    queryKey: queryKeys.stats(),
    queryFn: async (): Promise<CustomerStats> => {
      const allCustomersResponse = await customerApi.getList({
        pageNumber: 1,
        pageSize: 1000,
      });

      const allCustomers = allCustomersResponse.data || [];
      const now = new Date();
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

      const totalCustomers = allCustomersResponse.totalCount || 0;
      const approvedCustomers = 0;
      const newThisMonth = allCustomers.filter(
        (customer: CustomerDto) => customer.createdDate && new Date(customer.createdDate) >= startOfMonth
      ).length;

      return {
        totalCustomers,
        approvedCustomers,
        newThisMonth,
      };
    },
    staleTime: 5 * 60 * 1000,
  });
};
